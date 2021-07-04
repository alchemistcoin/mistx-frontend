import { CurrencyAmount, JSBI, Currency, Ether } from '@alchemistcoin/sdk'
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

  if (currencyAmount.currency.isNative && wrapType !== WrapType.NOT_APPLICABLE) {
    const ETH = Ether.onChain(currencyAmount.currency.chainId)

    if (JSBI.greaterThan(currencyAmount.quotient, MIN_ETH)) {
      return CurrencyAmount.fromRawAmount(ETH, JSBI.subtract(currencyAmount.quotient, MIN_ETH))
    } else {
      return CurrencyAmount.fromRawAmount(ETH, JSBI.BigInt(0))
    }
  }
  return currencyAmount
}
