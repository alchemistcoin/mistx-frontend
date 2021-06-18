import { Trade, TokenAmount, CurrencyAmount, ETHER, ChainId, Exchange } from '@alchemistcoin/sdk'
import { useCallback, useMemo } from 'react'
import { MISTX_ROUTER_ADDRESS } from '../constants'
import { useTokenAllowance } from '../data/Allowances'
import { getTradeVersion, useV1TradeExchangeAddress } from '../data/V1'
import { Field } from '../state/swap/actions'
import { useHasPendingApproval } from '../state/transactions/hooks'
import { computeSlippageAdjustedAmounts } from '../utils/prices'
import { calculateGasMargin } from '../utils'
import { useTokenContract } from './useContract'
import { useActiveWeb3React } from './index'
import { Version } from './useToggledVersion'
import { PopulatedTransaction } from '@ethersproject/contracts'
import { keccak256 } from '@ethersproject/keccak256'
import { ethers } from 'ethers'
import { SignatureLike } from '@ethersproject/bytes'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED
}
interface SignedTransactionResponse {
  raw: string
  tx: any
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  amountToApprove?: CurrencyAmount,
  spender?: string
): [ApprovalState, () => Promise<string | undefined>] {
  const { account, library, chainId } = useActiveWeb3React()
  const token = amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)
  const pendingApproval = useHasPendingApproval(token?.address, spender)

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency === ETHER) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pendingApproval, spender])

  const tokenContract = useTokenContract(token?.address)
  // const addTransaction = useTransactionAdder()

  const approve = useCallback(async (): Promise<string | undefined> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily')
      return undefined
    }
    if (!token) {
      console.error('no token')
      return undefined
    }

    if (!library) {
      console.error('no provider')
      return undefined
    }

    if (!chainId) {
      console.error('no chainId')
      return undefined
    }

    if (!account) {
      console.error('no account')
      return undefined
    }

    if (!tokenContract) {
      console.error('tokenContract is null')
      return undefined
    }

    if (!amountToApprove) {
      console.error('missing amount to approve')
      return undefined
    }

    if (!spender) {
      console.error('no spender')
      return undefined
    }

    // let useExact = false
    // const estimatedGas = await tokenContract.estimateGas.approve(spender, MaxUint256).catch(() => {
    //   // general fallback for tokens who restrict approval amounts
    //   useExact = true
    //   return tokenContract.estimateGas.approve(spender, amountToApprove.raw.toString())
    // })
    //we always useExact
    const estimatedGas = await tokenContract.estimateGas.approve(spender, amountToApprove.raw.toString())

    if (!(tokenContract.signer instanceof JsonRpcSigner)) {
      throw new Error(`Cannot sign transactions with this wallet type`)
    }

    // ethers will change eth_sign to personal_sign if it detects metamask
    let web3Provider: Web3Provider | undefined
    let isMetamask: boolean | undefined
    if (library instanceof Web3Provider) {
      web3Provider = library as Web3Provider
      isMetamask = web3Provider.provider.isMetaMask
      web3Provider.provider.isMetaMask = false
    }
    try {
      //use populate instead of broadcasting
      const populatedTx: PopulatedTransaction = await tokenContract.populateTransaction.approve(
        spender,
        amountToApprove.raw.toString(),
        {
          nonce: tokenContract.signer.getTransactionCount(),
          gasLimit: calculateGasMargin(estimatedGas) //needed?
        }
      )
      populatedTx.chainId = chainId

      let signedTx
      if (isMetamask) {
        delete populatedTx.from

        const serialized = ethers.utils.serializeTransaction(populatedTx)
        const hash = keccak256(serialized)
        const signature: SignatureLike = await library.jsonRpcFetchFunc('eth_sign', [account, hash])
        signedTx = ethers.utils.serializeTransaction(populatedTx, signature)
      } else {
        const signedTxRes: SignedTransactionResponse = await library.jsonRpcFetchFunc('eth_signTransaction', [
          {
            ...populatedTx,
            gasLimit: populatedTx.gasLimit?.toHexString(),
            gasPrice: '0x0'
          }
        ])

        signedTx = signedTxRes.raw
      }

      if (web3Provider) {
        web3Provider.provider.isMetaMask = isMetamask
      }
      return signedTx
    } catch (error) {
      console.debug('Failed to approve token', error)
      if (web3Provider) {
        web3Provider.provider.isMetaMask = isMetamask
      }
      throw error
    }
  }, [approvalState, token, tokenContract, amountToApprove, spender, account, chainId, library])

  return [approvalState, approve]
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(trade?: Trade, allowedSlippage = 0) {
  const amountToApprove = useMemo(
    () => (trade ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT] : undefined),
    [trade, allowedSlippage]
  )
  const tradeIsV1 = getTradeVersion(trade) === Version.v1
  const v1ExchangeAddress = useV1TradeExchangeAddress(trade)
  const { chainId } = useActiveWeb3React()
  return useApproveCallback(
    amountToApprove,
    tradeIsV1 ? v1ExchangeAddress : MISTX_ROUTER_ADDRESS[chainId || ChainId.MAINNET]?.[trade?.exchange || Exchange.UNI]
  )
}
