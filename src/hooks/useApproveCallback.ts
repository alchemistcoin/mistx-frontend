import { Trade, CurrencyAmount, Currency, ChainId, Exchange, TradeType } from '@alchemist-coin/mistx-core'
import { useCallback, useMemo } from 'react'
import { MISTX_ROUTER_ADDRESS } from '../constants'
import { useTokenAllowance } from '../data/Allowances'
import { Field } from '../state/swap/actions'
import { useHasPendingApproval } from '../state/transactions/hooks'
import { computeSlippageAdjustedAmounts } from '../utils/prices'
import { BigNumber } from '@ethersproject/bignumber'
import { useTokenContract } from './useContract'
import { useActiveWeb3React } from './index'
import useBaseFeePerGas from './useBaseFeePerGas'
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
  amountToApprove?: CurrencyAmount<Currency>,
  spender?: string
): [ApprovalState, () => Promise<string | undefined>] {
  const { account, library, chainId } = useActiveWeb3React()
  const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)
  const pendingApproval = useHasPendingApproval(token?.address, spender)
  const { maxBaseFeePerGas } = useBaseFeePerGas()
  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency.isNative) return ApprovalState.APPROVED
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
      // console.log('approve was called unnecessarily')
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
    const estimatedGas = await tokenContract.estimateGas.approve(spender, amountToApprove.quotient.toString())

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
      const nonce = await tokenContract.signer.getTransactionCount()
      //use populate instead of broadcasting
      const populatedTx: PopulatedTransaction = await tokenContract.populateTransaction.approve(
        spender,
        amountToApprove.quotient.toString(),
        {
          nonce: nonce,
          gasLimit: estimatedGas.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000)), // add 10%
          type: 2,
          maxFeePerGas: maxBaseFeePerGas,
          maxPriorityFeePerGas: '0x0'
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
        try {
          const signPayload = [
            {
              ...populatedTx,
              chainId: undefined,
              gasLimit: `0x${populatedTx.gasLimit?.toNumber().toString(16)}`,
              maxFeePerGas: `0x${populatedTx.maxFeePerGas?.toNumber().toString(16)}`,
              maxPriorityFeePerGas: '0x0',
              nonce: `0x${populatedTx.nonce?.toString(16)}`
            }
          ]
          const signedTxRes: SignedTransactionResponse = await library.jsonRpcFetchFunc(
            'eth_signTransaction',
            signPayload
          )

          signedTx = signedTxRes.raw
        } catch (e) {
          console.error('jsonRpcFetch error', e)
          throw e
        }
      }

      if (web3Provider && isMetamask) {
        web3Provider.provider.isMetaMask = isMetamask
      }
      return signedTx
    } catch (error) {
      console.debug('Failed to approve token', error)
      if (web3Provider && isMetamask) {
        web3Provider.provider.isMetaMask = isMetamask
      }
      throw error
    }
  }, [approvalState, token, tokenContract, amountToApprove, spender, account, chainId, library, maxBaseFeePerGas])

  return [approvalState, approve]
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(trade?: Trade<Currency, Currency, TradeType>, allowedSlippage = 0) {
  const amountToApprove = useMemo(
    () => (trade ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT] : undefined),
    [trade, allowedSlippage]
  )
  const { chainId } = useActiveWeb3React()
  return useApproveCallback(
    amountToApprove,
    MISTX_ROUTER_ADDRESS[chainId || ChainId.MAINNET]?.[trade?.exchange || Exchange.UNI]
  )
}
