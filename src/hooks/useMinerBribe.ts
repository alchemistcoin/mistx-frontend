import { useEffect, useState, useMemo } from 'react'
import { useBlockNumber } from '../state/application/hooks'
import { useUserBribeMargin } from '../state/user/hooks'
import { useActiveWeb3React } from './index'
import { JSBI, Percent, Trade, Router, SwapParameters } from '@alchemistcoin/sdk'
import { calculateGasMargin, getRouterContract } from '../utils'
import useTransactionDeadline from './useTransactionDeadline'
import { BIPS_BASE, INITIAL_ALLOWED_SLIPPAGE } from '../constants'
import useENS from './useENS'
import isZero from '../utils/isZero'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'

interface SwapCall {
  contract: Contract | undefined
  parameters: SwapParameters
}

function useSwapCallArguments(
  trade: Trade | undefined,
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE,
  recipientAddressOrName: string | null
): SwapCall {
  const { chainId, library, account } = useActiveWeb3React()
  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress
  const deadline = useTransactionDeadline()

  return useMemo(() => {
    if (!trade || !recipient || !library || !account || !chainId || !deadline)
      return { contract: undefined, parameters: { methodName: '', args: [], value: '' } }
    const contract = getRouterContract(chainId, library, account)
    const callParams = Router.swapCallParameters(trade, {
      feeOnTransfer: false,
      allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
      recipient,
      deadline: deadline.toNumber()
    })

    return { parameters: callParams, contract }
  }, [account, allowedSlippage, chainId, deadline, library, recipient, trade])
}

export default function useMinerBribe(
  trade: Trade | undefined,
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE,
  recipientAddressOrName: string | null
): BigNumber | undefined {
  const { library } = useActiveWeb3React()
  const [bribe, setBribe] = useState<BigNumber | undefined>(undefined)
  const [estimatedGas, setEstimatedGas] = useState<BigNumber | undefined>(undefined)
  const currentBlock = useBlockNumber()
  const [userBribeMargin] = useUserBribeMargin()
  const {
    contract,
    parameters: { methodName, args, value }
  } = useSwapCallArguments(trade, allowedSlippage, recipientAddressOrName)

  useEffect(() => {
    async function estimateGas() {
      if (!contract || !methodName || !args) {
        setEstimatedGas(undefined)
        return
      }
      const options = !value || isZero(value) ? {} : { value }
      const estimatedGas = await contract.estimateGas[methodName](...args, options)
      const estimatedGasWithMargin = calculateGasMargin(BigNumber.from(estimatedGas))
      setEstimatedGas(estimatedGasWithMargin)
    }
    estimateGas()
  }, [contract, methodName, args, value])

  useEffect(() => {
    async function calculateMinerBribe(): Promise<void> {
      if (!library || !currentBlock || !userBribeMargin || !estimatedGas) {
        setBribe(undefined)
        return
      }
      const block = await library.getBlockWithTransactions(currentBlock)
      const finalTransaction = block.transactions[block.transactions.length - 1]
      if (!finalTransaction) {
        setBribe(undefined)
        return
      }

      const gasPriceToBeat = finalTransaction.gasPrice
      // Bribe must be calculated such that
      //
      // gasPriceToBeat = finalTransactionFromLastBlock.gasPrice
      // effectivePrice = minerBribe / gasUsed
      // effectivePrice > gasPriceToBeat
      //
      // The margin in which effectivePrice is greater than gasPriceToBeat
      // will be a percentage derived from a user setting.
      //
      // gasPriceToBeatWithMargin = gasPriceToBeat.add(gasPriceToBeat.mul(BRIBE_MARGIN_PERCENT).div(100))
      // minerBribe / gasUsed = gasPriceToBeatWithMargin
      // minerBribe = gasToBeatWithMargin*gasUsed

      const gasPriceToBeatWithMargin = gasPriceToBeat.add(gasPriceToBeat.mul(userBribeMargin).div(100))
      const estBribe = gasPriceToBeatWithMargin.mul(estimatedGas)

      setBribe(estBribe)
    }
    calculateMinerBribe()
  }, [library, currentBlock, userBribeMargin, estimatedGas])
  return bribe
}
