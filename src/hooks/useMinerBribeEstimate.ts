import { useMemo } from 'react'
import { useUserBribeMargin } from '../state/user/hooks'
import { BribeEstimate, Trade } from '@alchemist-coin/mistx-core'
import usePriorityFeePerGas from './usePriorityFeePerGas'

export default function useMinerBribeEstimate(customTipMargin?: number): BribeEstimate | null {
  const [userBribeMargin] = useUserBribeMargin()
  const userBribeMarginString = String(customTipMargin || userBribeMargin)
  const priorityFee = usePriorityFeePerGas()

  let priorityFeeString: string | null = null
  if (priorityFee) priorityFeeString = priorityFee.toString()
  return useMemo(() => {
    if (!priorityFeeString) return null
    const estimate = Trade.estimateBribeAmounts(priorityFeeString, userBribeMarginString)
    return estimate
  }, [priorityFeeString, userBribeMarginString])
}
