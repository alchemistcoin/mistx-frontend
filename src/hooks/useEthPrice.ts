import { Currency, CurrencyAmount, Price, Token, Exchange, WETH } from '@alchemistcoin/sdk'
import { useMemo } from 'react'
import { useTradeExactOut } from './Trades'
import { useActiveWeb3React } from './'
import { BigNumber } from '@ethersproject/bignumber'
// ETH amount used when calculating spot price for a given currency.
// The amount is large enough to filter low liquidity pairs.
const ethCurrencyAmount = CurrencyAmount.fromRawAmount(WETH[1], BigNumber.from(100_000e6).toString())

/**
 * Returns the price in ETH of the input currency
 * @param Token currency to compute the ETH price of
 */
export default function useETHPrice(currency?: Token): Price<Currency, Token> | undefined {
  const { chainId } = useActiveWeb3React()

  const v2ETHTrade = useTradeExactOut(
    Exchange.UNI,
    null,
    currency,
    chainId === 1 ? ethCurrencyAmount : undefined,
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
    // if (currency === USDC) {
    //   return new Price(USDC, USDC, '1', '1')
    // }

    // use v2 price if available, v3 as fallback
    if (v2ETHTrade) {
      const { numerator, denominator } = v2ETHTrade.route.midPrice
      return new Price(currency, WETH[1], denominator, numerator)
    }

    return undefined
  }, [chainId, currency, v2ETHTrade])
}

// export function useUSDCValue(currencyAmount: CurrencyAmount<Currency> | undefined | null) {
//   const price = useETHPrice(currencyAmount?.currency)

//   return useMemo(() => {
//     if (!price || !currencyAmount) return null
//     try {
//       return price.quote(currencyAmount)
//     } catch (error) {
//       return null
//     }
//   }, [currencyAmount, price])
// }
