import React, { useState, useEffect } from 'react'
import { BribeEstimate, WETH, CurrencyAmount } from '@alchemistcoin/sdk'
import useMinerBribeEstimate from '../../hooks/useMinerBribeEstimate'
import useUSDCPrice from '../../hooks/useUSDCPrice'
import useFeeDisplayCurrency from '../../hooks/useFeeDisplayCurrency'

const MinerBribePrice = () => {
  const [minerBribePrice, setMinerBribePrice] = useState<string>('')
  const bribeEstimate: BribeEstimate | null = useMinerBribeEstimate()
  const ethUSDCPrice = useUSDCPrice(WETH[1])
  const feeDisplayCurrency = useFeeDisplayCurrency()

  useEffect(() => {
    let label = 'Fetching price...'
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
  }, [bribeEstimate, ethUSDCPrice, feeDisplayCurrency])
  return <>{minerBribePrice}</>
}

export default MinerBribePrice
