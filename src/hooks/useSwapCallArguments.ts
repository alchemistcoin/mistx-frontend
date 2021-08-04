import { Contract } from '@ethersproject/contracts'
import { JSBI, Percent, Router, SwapParameters, Trade, TradeType, Currency } from '@alchemist-coin/mistx-core'
import { useMemo } from 'react'
import { BIPS_BASE, INITIAL_ALLOWED_SLIPPAGE } from '../constants'
import { getRouterContract } from '../utils'
import { useActiveWeb3React } from './index'
import useTransactionDeadline from './useTransactionDeadline'
import useENS from './useENS'
import { BigNumber } from '@ethersproject/bignumber'

export interface SwapCall {
  contract: Contract
  parameters: SwapParameters
}
export interface PendingCall {
  call: SwapCall
}
export interface SuccessfulCall {
  call: SwapCall
  gasEstimate: BigNumber
}
export interface FailedCall {
  call: SwapCall
  error: Error
}

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName
 */
export function useSwapCallArguments(
  trade: Trade<Currency, Currency, TradeType> | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): PendingCall | undefined {
  const { account, chainId, library } = useActiveWeb3React()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress
  const deadline = useTransactionDeadline()

  return useMemo((): PendingCall | undefined => {
    let pendingCall: PendingCall
    if (!trade || !recipient || !library || !account || !chainId || !deadline) return undefined

    const contract: Contract = getRouterContract(chainId, library, trade, account)

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      pendingCall = {
        call: {
          contract: contract as Contract,
          parameters: Router.swapCallParameters(trade, {
            feeOnTransfer: true,
            allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
            recipient,
            deadline: deadline.toNumber()
          })
        }
      }
    } else {
      pendingCall = {
        call: {
          contract: contract as Contract,
          parameters: Router.swapCallParameters(trade, {
            feeOnTransfer: false,
            allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
            recipient,
            deadline: deadline.toNumber()
          })
        }
      }
    }
    return pendingCall
  }, [account, allowedSlippage, chainId, deadline, library, recipient, trade])
}
