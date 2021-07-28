import { ZERO_PERCENT, ONE_HUNDRED_PERCENT } from './../constants/index'
import { Trade, Percent, currencyEquals, Currency, TradeType } from '@alchemist-coin/mistx-core'

// returns whether tradeB is better than tradeA by at least a threshold percentage amount
export function isTradeBetter(
  tradeA: Trade<Currency, Currency, TradeType> | undefined,
  tradeB: Trade<Currency, Currency, TradeType> | undefined,
  minimumDelta: Percent = ZERO_PERCENT
): boolean | undefined {
  if (tradeA && !tradeB) return false
  if (tradeB && !tradeA) return true
  if (!tradeA || !tradeB) return undefined

  if (
    tradeA.tradeType !== tradeB.tradeType ||
    !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
    !currencyEquals(tradeB.outputAmount.currency, tradeB.outputAmount.currency)
  ) {
    throw new Error('Trades are not comparable')
  }

  if (minimumDelta.equalTo(ZERO_PERCENT)) {
    return tradeA.executionPrice.lessThan(tradeB.executionPrice)
  } else {
    return tradeA.executionPrice.asFraction
      .multiply(minimumDelta.add(ONE_HUNDRED_PERCENT))
      .lessThan(tradeB.executionPrice)
  }
}

//returns whether the given trade involves ETH as a Pair
export function isETHTrade(trade: Trade<Currency, Currency, TradeType> | undefined): boolean | undefined {
  if (!trade) {
    return undefined
  } else if (!trade.route.input.isNative && !trade.route.output.isNative) {
    return false
  }
  return true
}
