import { Contract } from '@ethersproject/contracts'
import {
  JSBI,
  Percent,
  Router,
  SwapParameters,
  Trade,
  TradeType,
  Currency,
  CurrencyAmount,
  TokenAmount,
  Token
} from '@alchemistcoin/sdk'
import { useMemo } from 'react'
import { useCurrency } from './Tokens'
import { BIPS_BASE, INITIAL_ALLOWED_SLIPPAGE } from '../constants'
import { getTradeVersion, useV1TradeExchangeAddress } from '../data/V1'
import { getRouterContract } from '../utils'
import v1SwapArguments from '../utils/v1SwapArguments'
import { useActiveWeb3React } from './index'
import { useV1ExchangeContract } from './useContract'
import { useTradeExactIn, useTradeExactOut } from './Trades'
import useTransactionDeadline from './useTransactionDeadline'
import useENS from './useENS'
import { Version } from './useToggledVersion'
import { BigNumber } from '@ethersproject/bignumber'

export interface SwapCall {
  contract: Contract
  parameters: SwapParameters
}
export interface PendingCall {
  call: SwapCall
  modifiedCall: SwapCall
}
export interface SuccessfulCall {
  call: SwapCall
  modifiedCall: SwapCall
  gasEstimate: BigNumber
}
export interface FailedCall {
  call: SwapCall
  modifiedCall: SwapCall
  error: Error
}

function useModifiedTrade(
  trade: Trade | undefined // trade to execute, required
): Trade | undefined {
  const currencyInEth = useCurrency('ETH') as Currency
  const currencyAmountIn = CurrencyAmount.ether(JSBI.BigInt(1))
  let modifiedTrade: Trade | undefined
  let currencyAmountOut: CurrencyAmount | undefined
  let currencyOut: Currency | undefined

  if (trade && trade.inputAmount.currency.symbol !== currencyInEth.symbol) {
    currencyOut = trade.inputAmount.currency
    currencyAmountOut = new TokenAmount(currencyOut as Token, JSBI.BigInt(1))
  } else if (trade) {
    currencyOut = trade.outputAmount.currency
    currencyAmountOut = new TokenAmount(currencyOut as Token, JSBI.BigInt(1))
  }
  const modifiedExactInTrade = useTradeExactIn(currencyAmountIn, currencyOut)
  const modifiedExactOutTrade = useTradeExactOut(currencyInEth, currencyAmountOut)
  if (trade?.tradeType === TradeType.EXACT_INPUT) {
    modifiedTrade = modifiedExactOutTrade || undefined
  }
  if (trade?.tradeType === TradeType.EXACT_OUTPUT) {
    modifiedTrade = modifiedExactInTrade || undefined
  }

  return modifiedTrade
}

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName
 */
export function useSwapCallArguments(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): PendingCall[] {
  const { account, chainId, library } = useActiveWeb3React()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress
  const deadline = useTransactionDeadline()

  const v1Exchange = useV1ExchangeContract(useV1TradeExchangeAddress(trade), true)
  const modifiedTrade = useModifiedTrade(trade)

  return useMemo(() => {
    const tradeVersion = getTradeVersion(trade)
    if (!trade || !modifiedTrade || !recipient || !library || !account || !tradeVersion || !chainId || !deadline)
      return []

    const contract: Contract | null =
      tradeVersion === Version.v2 ? getRouterContract(chainId, library, account) : v1Exchange

    // recipient should be replaced here in order to use a
    // wallet/address under our control which we can ensure
    // allways has a small amount of ETH
    const modifiedContract: Contract | null =
      tradeVersion === Version.v2 ? getRouterContract(chainId, library, recipient) : v1Exchange
    if (!contract) {
      return []
    }

    const swapMethods: PendingCall[] = []

    switch (tradeVersion) {
      case Version.v2:
        swapMethods.push({
          call: {
            contract,
            parameters: Router.swapCallParameters(trade, {
              feeOnTransfer: false,
              allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
              recipient,
              deadline: deadline.toNumber()
            })
          },
          modifiedCall: {
            contract: modifiedContract,
            parameters: Router.swapCallParameters(modifiedTrade, {
              feeOnTransfer: false,
              allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
              recipient,
              deadline: deadline.toNumber()
            })
          }
        } as PendingCall)

        if (trade.tradeType === TradeType.EXACT_INPUT) {
          swapMethods.push({
            call: {
              contract,
              parameters: Router.swapCallParameters(trade, {
                feeOnTransfer: true,
                allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
                recipient,
                deadline: deadline.toNumber()
              })
            },
            modifiedCall: {
              contract: modifiedContract,
              parameters: Router.swapCallParameters(modifiedTrade, {
                feeOnTransfer: false,
                allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
                recipient,
                deadline: deadline.toNumber()
              })
            }
          } as PendingCall)
        }
        break
      case Version.v1:
        swapMethods.push({
          call: {
            contract,
            parameters: v1SwapArguments(trade, {
              allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
              recipient,
              deadline: deadline.toNumber()
            })
          },
          modifiedCall: {
            contract: modifiedContract,
            parameters: v1SwapArguments(modifiedTrade, {
              allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
              recipient,
              deadline: deadline.toNumber()
            })
          }
        } as PendingCall)
        break
    }
    return swapMethods
  }, [account, allowedSlippage, chainId, deadline, library, recipient, trade, modifiedTrade, v1Exchange])
}
