import { CurrencyAmount, JSBI, Currency, Ether } from '@alchemist-coin/mistx-core'
import { WrapType } from 'hooks/useWrapCallback'
import { MISTX_DEFAULT_GAS_LIMIT } from '../constants'
import useBaseFeePerGas from '../hooks/useBaseFeePerGas'
/**
 * Given some token amount, return the max that can be spent of it
 * @param currencyAmount to return max of
 */
export function MaxAmountSpend(
  currencyAmount?: CurrencyAmount<Currency>,
  wrapType?: WrapType
): CurrencyAmount<Currency> | undefined {
  const baseFeePerGas = useBaseFeePerGas()
  if (!currencyAmount) return undefined
  if (currencyAmount.currency.isNative && baseFeePerGas) {
    const ETH = Ether.onChain(currencyAmount.currency.chainId)
    const minETH = JSBI.multiply(JSBI.BigInt(baseFeePerGas.toString()), JSBI.BigInt(MISTX_DEFAULT_GAS_LIMIT))
    if (JSBI.greaterThan(currencyAmount.quotient, minETH)) {
      return CurrencyAmount.fromRawAmount(ETH, JSBI.subtract(currencyAmount.quotient, minETH))
    } else {
      return CurrencyAmount.fromRawAmount(ETH, JSBI.BigInt(0))
    }
  }
  return currencyAmount
}
