import { Currency, CurrencyAmount, TokenAmount, Price, Token, Exchange } from '@alchemistcoin/sdk'
import { useMemo } from 'react'
import { USDC } from '../constants'
import { useTradeExactOut } from './Trades'
import { useActiveWeb3React } from './'
import { BigNumber } from '@ethersproject/bignumber'
// USDC amount used when calculating spot price for a given currency.
// The amount is large enough to filter low liquidity pairs.
const usdcCurrencyAmount = new TokenAmount(USDC, BigNumber.from(100_000e6).toString())

/**
 * Returns the price in USDC of the input currency
 * @param currency currency to compute the USDC price of
 */
export default function useUSDCPrice(currency?: Currency): Price | undefined {
  const { chainId } = useActiveWeb3React()

  const v2USDCTrade = useTradeExactOut(
    Exchange.UNI,
    null,
    currency,
    chainId === 1 ? usdcCurrencyAmount : undefined,
    BigNumber.from(0),
    BigNumber.from(0)
  )

  return useMemo(() => {
    if (!currency || !chainId) {
      return undefined
    }

    // return some fake price data for non-mainnet
    if (chainId !== 1) {
      const fakeUSDC = new Token(chainId, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'fUSDC', 'Fake USDC')
      return new Price(
        currency,
        fakeUSDC,
        BigNumber.from(10 ** Math.max(0, currency.decimals - 6)).toString(),
        BigNumber.from(15 * 10 ** Math.max(6 - currency.decimals, 0)).toString()
      )
    }

    // handle usdc
    if (currency === USDC) {
      return new Price(USDC, USDC, '1', '1')
    }

    // use v2 price if available, v3 as fallback
    if (v2USDCTrade) {
      const { numerator, denominator } = v2USDCTrade.route.midPrice
      return new Price(currency, USDC, denominator, numerator)
    }

    return undefined
  }, [chainId, currency, v2USDCTrade])
}

export function useUSDCValue(currencyAmount: CurrencyAmount | undefined | null) {
  const price = useUSDCPrice(currencyAmount?.currency)

  return useMemo(() => {
    if (!price || !currencyAmount) return null
    try {
      return price.quote(currencyAmount)
    } catch (error) {
      return null
    }
  }, [currencyAmount, price])
}
