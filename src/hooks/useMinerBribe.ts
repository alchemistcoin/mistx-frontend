import { useEffect, useState } from 'react'
import { useBlockNumber } from '../state/application/hooks'
import { useUserBribeMargin } from '../state/user/hooks'
import { useActiveWeb3React } from './index'
import { Trade } from '@alchemistcoin/sdk'
import { calculateGasMargin } from '../utils'
import { INITIAL_ALLOWED_SLIPPAGE } from '../constants'
import { BigNumber } from '@ethersproject/bignumber'
import { useModifiedTradeEstimationCallback } from './useEstimationCallback'

export default function useMinerBribe(
  trade: Trade | undefined,
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE,
  recipientAddressOrName: string | null
): BigNumber | undefined {
  const { library } = useActiveWeb3React()
  const [bribe, setBribe] = useState<BigNumber | undefined>(undefined)
  const currentBlock = useBlockNumber()
  const [userBribeMargin] = useUserBribeMargin()
  const estimationCall = useModifiedTradeEstimationCallback(trade, allowedSlippage, recipientAddressOrName)

  useEffect(() => {
    async function calculateMinerBribe(): Promise<void> {
      if (!library || !currentBlock || !userBribeMargin || !trade) {
        setBribe(undefined)
        return
      }

      const successfullCall = await estimationCall()
      if (!successfullCall) {
        setBribe(undefined)
        return
      }
      const estimatedGas = successfullCall.gasEstimate
      const estimatedGasWithMargin = calculateGasMargin(estimatedGas)
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
      const estBribe = gasPriceToBeatWithMargin.mul(estimatedGasWithMargin)

      setBribe(estBribe)
    }
    calculateMinerBribe()
  }, [library, currentBlock, userBribeMargin, trade])

  return bribe
}
