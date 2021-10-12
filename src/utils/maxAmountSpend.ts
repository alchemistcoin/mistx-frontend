import { CurrencyAmount, JSBI, Currency, Ether, Trade, TradeType, Token } from '@alchemist-coin/mistx-core'
import { WrapType } from 'hooks/useWrapCallback'
import { MISTX_DEFAULT_GAS_LIMIT } from '../constants'
import useBaseFeePerGas from '../hooks/useBaseFeePerGas'
import { MIN_ETH } from '../constants'
import { useGasLimitForPath } from 'hooks/useGasLimit'
import { calculateGasMargin } from 'utils'
import { BigNumber } from '@ethersproject/bignumber'

/**
 * Given some token amount, return the max that can be spent of it
 * @param currencyAmount to return max of
 */
export function MaxAmountSpend(
  currencyAmount?: CurrencyAmount<Currency>,
  wrapType?: WrapType,
  trade?: Trade<Currency, Currency, TradeType>
): CurrencyAmount<Currency> | undefined {
  const { maxBaseFeePerGas } = useBaseFeePerGas()
  const gasLimit = useGasLimitForPath(trade?.route.path.map((t: Token) => t.address))

  if (!currencyAmount) return undefined
  const ETH = Ether.onChain(currencyAmount.currency.chainId)
  if (wrapType !== WrapType.NOT_APPLICABLE) {
    if (JSBI.greaterThan(currencyAmount.quotient, MIN_ETH)) {
      return CurrencyAmount.fromRawAmount(ETH, JSBI.subtract(currencyAmount.quotient, MIN_ETH))
    } else {
      return CurrencyAmount.fromRawAmount(ETH, JSBI.BigInt(0))
    }
  } else if (currencyAmount.currency.isNative && maxBaseFeePerGas) {
    const minETH = JSBI.multiply(
      JSBI.BigInt(maxBaseFeePerGas.toString()),
      JSBI.BigInt((gasLimit && calculateGasMargin(BigNumber.from(gasLimit)).toString()) || MISTX_DEFAULT_GAS_LIMIT)
    )
    if (JSBI.greaterThan(currencyAmount.quotient, minETH)) {
      return CurrencyAmount.fromRawAmount(ETH, JSBI.subtract(currencyAmount.quotient, minETH))
    } else {
      return CurrencyAmount.fromRawAmount(ETH, JSBI.BigInt(0))
    }
  }
  return currencyAmount
}
