import React, { useState, useEffect } from 'react'
import { BribeEstimate, WETH, CurrencyAmount } from '@alchemist-coin/mistx-core'
import useMinerBribeEstimate from '../../hooks/useMinerBribeEstimate'
import useUSDCPrice from '../../hooks/useUSDCPrice'
import useFeeDisplayCurrency from '../../hooks/useFeeDisplayCurrency'
type Props = {
  customTipMargin?: number
}
const MinerBribePrice = ({ customTipMargin }: Props) => {
  const [minerBribePrice, setMinerBribePrice] = useState<string>('')
  const bribeEstimate: BribeEstimate | null = useMinerBribeEstimate(customTipMargin)
  const ethUSDCPrice = useUSDCPrice(WETH[1])
  const feeDisplayCurrency = useFeeDisplayCurrency()

  useEffect(() => {
    let mounted = true
    let label = 'Fetching price...'
    if (mounted) {
      if (bribeEstimate && ethUSDCPrice) {
        const minBribeTokenAmount = CurrencyAmount.fromRawAmount(WETH[1], bribeEstimate.minBribe.quotient)
        const maxBribeTokenAmount = CurrencyAmount.fromRawAmount(WETH[1], bribeEstimate.maxBribe.quotient)
        if (feeDisplayCurrency === 'USD') {
          label = `$${ethUSDCPrice.quote(minBribeTokenAmount).toSignificant(2)} - $${ethUSDCPrice
            .quote(maxBribeTokenAmount)
            .toSignificant(2)}`
        } else {
          label = `${Number(minBribeTokenAmount.toSignificant(2))} - ${Number(maxBribeTokenAmount.toSignificant(2))}`
        }
      }
      setMinerBribePrice(label)
    }
    return () => {
      console.log('MinerBribePrice unmounting')
      mounted = false
    }
  }, [bribeEstimate, ethUSDCPrice, feeDisplayCurrency])
  return <>{minerBribePrice}</>
}

export default MinerBribePrice
