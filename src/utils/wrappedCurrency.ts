import { Currency, Ether, WETH } from '@alchemist-coin/mistx-core'

export function unwrappedToken(currency: Currency): Currency {
  if (currency.isNative) return currency

  if (currency.equals(WETH[currency.chainId])) return Ether.onChain(currency.chainId)
  return currency
}
