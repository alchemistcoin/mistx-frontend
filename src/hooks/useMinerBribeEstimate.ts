import { useMemo } from 'react'
import { useUserBribeMargin } from '../state/user/hooks'
import useLatestGasPrice from './useLatestGasPrice'
import { BribeEstimate, Trade } from '@alchemistcoin/sdk'

export default function useMinerBribeEstimate(): BribeEstimate | null {
  const [userBribeMargin] = useUserBribeMargin()
  const userBribeMarginString = String(userBribeMargin)
  const gasPrice = useLatestGasPrice()
  let gasPriceString: string | null = null
  if (gasPrice) gasPriceString = gasPrice.toString()
  return useMemo(() => {
    if (!gasPriceString) return null
    return Trade.estimateBribeAmounts(gasPriceString, userBribeMarginString)
  }, [gasPriceString, userBribeMarginString])
}
