import { useMemo } from 'react'
import { useUserBribeMargin } from '../state/user/hooks'
import useLatestGasPrice from './useLatestGasPrice'
import { BribeEstimate, Trade } from '@alchemist-coin/mistx-core'

export default function useMinerBribeEstimate(customTipMargin?: number): BribeEstimate | null {
  const [userBribeMargin] = useUserBribeMargin()
  const userBribeMarginString = String(customTipMargin || userBribeMargin)
  const gasPrice = useLatestGasPrice()
  let gasPriceString: string | null = null
  if (gasPrice) gasPriceString = gasPrice.toString()
  return useMemo(() => {
    if (!gasPriceString) return null
    const estimate = Trade.estimateBribeAmounts(gasPriceString, userBribeMarginString)
    return estimate
  }, [gasPriceString, userBribeMarginString])
}
