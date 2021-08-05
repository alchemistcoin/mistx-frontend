import { CurrencyAmount, JSBI, Currency, Ether } from '@alchemist-coin/mistx-core'
import { WrapType } from 'hooks/useWrapCallback'
import { MIN_ETH } from '../constants'

/**
 * Given some token amount, return the max that can be spent of it
 * @param currencyAmount to return max of
 */
export function maxAmountSpend(
  currencyAmount?: CurrencyAmount<Currency>,
  wrapType?: WrapType
): CurrencyAmount<Currency> | undefined {
  if (!currencyAmount) return undefined
  console.log('max amount spend', currencyAmount.toExact(), MIN_ETH, wrapType)

  if (currencyAmount.currency.isNative) {
    const ETH = Ether.onChain(currencyAmount.currency.chainId)
    const minEthAmount = CurrencyAmount.fromRawAmount(ETH, MIN_ETH)
    console.log('min eth amount', minEthAmount.toExact())
    if (JSBI.greaterThan(currencyAmount.quotient, MIN_ETH)) {
      console.log('greater than')
      return CurrencyAmount.fromRawAmount(ETH, JSBI.subtract(currencyAmount.quotient, MIN_ETH))
    } else {
      console.log('not greater than')
      return CurrencyAmount.fromRawAmount(ETH, JSBI.BigInt(0))
    }
  }
  return currencyAmount
}
