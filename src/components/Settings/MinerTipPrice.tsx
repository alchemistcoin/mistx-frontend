import React, { useState, useEffect } from 'react'
import { BribeEstimate, WETH, TokenAmount } from '@alchemistcoin/sdk'
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
      const minBribeTokenAmount = new TokenAmount(WETH[1], bribeEstimate.minBribe.raw)
      const maxBribeTokenAmount = new TokenAmount(WETH[1], bribeEstimate.maxBribe.raw)
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
