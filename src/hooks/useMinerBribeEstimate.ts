import { useMemo } from 'react'
import { useUserBribeMargin } from '../state/user/hooks'
import { BribeEstimate, Trade } from '@alchemist-coin/mistx-core'
import useLatestTipGasPrice from './useLatestGasPrice'

export default function useMinerBribeEstimate(customTipMargin?: number): BribeEstimate | null {
  const [userBribeMargin] = useUserBribeMargin()
  const userBribeMarginString = String(customTipMargin || userBribeMargin)
  const gasPrice = useLatestTipGasPrice()
  let gasPriceString: string | null = null
  if (gasPrice) gasPriceString = gasPrice.toString()
  return useMemo(() => {
    if (!gasPriceString) return null
    const estimate = Trade.estimateBribeAmounts(gasPriceString, userBribeMarginString)
    return estimate
  }, [gasPriceString, userBribeMarginString])
}
