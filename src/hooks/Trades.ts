import { isTradeBetter } from 'utils/trades'
import { Currency, CurrencyAmount, Exchange, Pair, Token, Trade, MinTradeEstimate, TradeType } from '@alchemistcoin/sdk'
import flatMap from 'lodash.flatmap'
import { useMemo } from 'react'

import {
  BASES_TO_CHECK_TRADES_AGAINST,
  CUSTOM_BASES,
  BETTER_TRADE_LESS_HOPS_THRESHOLD,
  ADDITIONAL_BASES
} from '../constants'
import { PairState, usePairs } from '../data/Reserves'
import { wrappedCurrency } from '../utils/wrappedCurrency'

import { useActiveWeb3React } from './index'
import { useUnsupportedTokens } from './Tokens'
import { useUserSingleHopOnly } from 'state/user/hooks'
import { BigNumber } from '@ethersproject/bignumber'

export type MinTradeEstimates = { [exchange in Exchange]: MinTradeEstimate | null }

function useAllCommonPairs(exchange: Exchange, currencyA?: Currency, currencyB?: Currency): Pair[] {
  const { chainId } = useActiveWeb3React()

  const [tokenA, tokenB] = chainId
    ? [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
    : [undefined, undefined]

  const bases: Token[] = useMemo(() => {
    if (!chainId) return []

    const common = BASES_TO_CHECK_TRADES_AGAINST[chainId] ?? []
    const additionalA = tokenA ? ADDITIONAL_BASES[chainId]?.[tokenA.address] ?? [] : []
    const additionalB = tokenB ? ADDITIONAL_BASES[chainId]?.[tokenB.address] ?? [] : []

    return [...common, ...additionalA, ...additionalB]
  }, [chainId, tokenA, tokenB])

  const basePairs: [Token, Token][] = useMemo(
    () => flatMap(bases, (base): [Token, Token][] => bases.map(otherBase => [base, otherBase])),
    [bases]
  )

  const allPairCombinations: [Token, Token][] = useMemo(
    () =>
      tokenA && tokenB
        ? [
            // the direct pair
            [tokenA, tokenB],
            // token A against all bases
            ...bases.map((base): [Token, Token] => [tokenA, base]),
            // token B against all bases
            ...bases.map((base): [Token, Token] => [tokenB, base]),
            // each base against all bases
            ...basePairs
          ]
            .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
            .filter(([t0, t1]) => t0.address !== t1.address)
            .filter(([tokenA, tokenB]) => {
              if (!chainId) return true
              const customBases = CUSTOM_BASES[chainId]

              const customBasesA: Token[] | undefined = customBases?.[tokenA.address]
              const customBasesB: Token[] | undefined = customBases?.[tokenB.address]

              if (!customBasesA && !customBasesB) return true

              if (customBasesA && !customBasesA.find(base => tokenB.equals(base))) return false
              if (customBasesB && !customBasesB.find(base => tokenA.equals(base))) return false

              return true
            })
        : [],
    [tokenA, tokenB, bases, basePairs, chainId]
  )

  const allPairs = usePairs(allPairCombinations, exchange)

  // only pass along valid pairs, non-duplicated pairs
  return useMemo(
    () =>
      Object.values(
        allPairs
          // filter out invalid pairs
          .filter((result): result is [PairState.EXISTS, Pair] => Boolean(result[0] === PairState.EXISTS && result[1]))
          // filter out duplicated pairs
          .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
            memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr
            return memo
          }, {})
      ),
    [allPairs]
  )
}

const MAX_HOPS = 3

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export function useTradeExactIn(
  exchange: Exchange,
  minTradeAmount: MinTradeEstimate | null,
  currencyAmountIn?: CurrencyAmount,
  currencyOut?: Currency,
  gasPriceToBeat?: BigNumber,
  minerBribeMargin?: BigNumber
): Trade | null {
  const allowedPairs = useAllCommonPairs(exchange, currencyAmountIn?.currency, currencyOut)

  const [singleHopOnly] = useUserSingleHopOnly()

  return useMemo(() => {
    if (currencyAmountIn && currencyOut && gasPriceToBeat && minerBribeMargin && allowedPairs.length > 0) {
      if (
        minTradeAmount &&
        minTradeAmount[TradeType.EXACT_INPUT] &&
        minTradeAmount[TradeType.EXACT_INPUT].greaterThan(currencyAmountIn)
      )
        return null
      if (singleHopOnly) {
        return (
          Trade.bestTradeExactIn(
            allowedPairs,
            currencyAmountIn,
            currencyOut,
            gasPriceToBeat.toString(),
            minerBribeMargin.toString(),
            {
              maxHops: 1,
              maxNumResults: 1
            }
          )[0] ?? null
        )
      }
      // search through trades with varying hops, find best trade out of them
      let bestTradeSoFar: Trade | null = null
      for (let i = 1; i <= MAX_HOPS; i++) {
        const currentTrade: Trade | null =
          Trade.bestTradeExactIn(
            allowedPairs,
            currencyAmountIn,
            currencyOut,
            gasPriceToBeat.toString(),
            minerBribeMargin.toString(),
            {
              maxHops: i,
              maxNumResults: 1
            }
          )[0] ?? null
        // if current trade is best yet, save it
        if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
          bestTradeSoFar = currentTrade
        }
      }
      return bestTradeSoFar
    }

    return null
  }, [allowedPairs, currencyAmountIn, currencyOut, singleHopOnly, gasPriceToBeat, minerBribeMargin, minTradeAmount])
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTradeExactOut(
  exchange: Exchange,
  minTradeAmount: MinTradeEstimate | null,
  currencyIn?: Currency,
  currencyAmountOut?: CurrencyAmount,
  gasPriceToBeat?: BigNumber,
  minerBribeMargin?: BigNumber
): Trade | null {
  const allowedPairs = useAllCommonPairs(exchange, currencyIn, currencyAmountOut?.currency)

  const [singleHopOnly] = useUserSingleHopOnly()

  return useMemo(() => {
    if (currencyIn && currencyAmountOut && gasPriceToBeat && minerBribeMargin && allowedPairs.length > 0) {
      if (
        minTradeAmount &&
        minTradeAmount[TradeType.EXACT_OUTPUT] &&
        minTradeAmount[TradeType.EXACT_OUTPUT].greaterThan(currencyAmountOut)
      )
        return null
      if (singleHopOnly) {
        return (
          Trade.bestTradeExactOut(
            allowedPairs,
            currencyIn,
            currencyAmountOut,
            gasPriceToBeat.toString(),
            minerBribeMargin.toString(),
            {
              maxHops: 1,
              maxNumResults: 1
            }
          )[0] ?? null
        )
      }
      // search through trades with varying hops, find best trade out of them
      let bestTradeSoFar: Trade | null = null
      for (let i = 1; i <= MAX_HOPS; i++) {
        const currentTrade =
          Trade.bestTradeExactOut(
            allowedPairs,
            currencyIn,
            currencyAmountOut,
            gasPriceToBeat.toString(),
            minerBribeMargin.toString(),
            {
              maxHops: i,
              maxNumResults: 1
            }
          )[0] ?? null
        if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
          bestTradeSoFar = currentTrade
        }
      }
      return bestTradeSoFar
    }
    return null
  }, [currencyIn, currencyAmountOut, allowedPairs, singleHopOnly, gasPriceToBeat, minerBribeMargin, minTradeAmount])
}

export function useIsTransactionUnsupported(currencyIn?: Currency, currencyOut?: Currency): boolean {
  const unsupportedTokens: { [address: string]: Token } = useUnsupportedTokens()
  const { chainId } = useActiveWeb3React()

  const tokenIn = wrappedCurrency(currencyIn, chainId)
  const tokenOut = wrappedCurrency(currencyOut, chainId)

  // if unsupported list loaded & either token on list, mark as unsupported
  if (unsupportedTokens) {
    if (tokenIn && Object.keys(unsupportedTokens).includes(tokenIn.address)) {
      return true
    }
    if (tokenOut && Object.keys(unsupportedTokens).includes(tokenOut.address)) {
      return true
    }
  }

  return false
}

export function useMinTradeAmount(
  currencyIn?: Currency,
  currencyOut?: Currency,
  gasPriceToBeat?: BigNumber,
  minerBribeMargin?: BigNumber,
  minTradeMargin?: BigNumber
): MinTradeEstimates {
  const SUSHIPairs = useAllCommonPairs(Exchange.SUSHI, currencyIn, currencyOut)
  const UNIPairs = useAllCommonPairs(Exchange.UNI, currencyIn, currencyOut)

  const uniMinTradeEstimate = useMemo(() => {
    if (!currencyIn || !currencyOut || !gasPriceToBeat || !minerBribeMargin || !minTradeMargin || !UNIPairs.length)
      return null
    return Trade.estimateMinTradeAmounts(
      UNIPairs,
      currencyIn,
      currencyOut,
      gasPriceToBeat.toString(),
      minerBribeMargin.toString(),
      minTradeMargin.toString()
    )
  }, [currencyIn, currencyOut, gasPriceToBeat, minerBribeMargin, minTradeMargin, UNIPairs])

  const sushiMinTradeEstimate = useMemo(() => {
    if (!currencyIn || !currencyOut || !gasPriceToBeat || !minerBribeMargin || !minTradeMargin || !SUSHIPairs.length)
      return null
    return Trade.estimateMinTradeAmounts(
      SUSHIPairs,
      currencyIn,
      currencyOut,
      gasPriceToBeat.toString(),
      minerBribeMargin.toString(),
      minTradeMargin.toString()
    )
  }, [currencyIn, currencyOut, gasPriceToBeat, minerBribeMargin, minTradeMargin, SUSHIPairs])
  return {
    [Exchange.UNI]: uniMinTradeEstimate,
    [Exchange.SUSHI]: sushiMinTradeEstimate,
    [Exchange.UNDEFINED]: null
  }
}
