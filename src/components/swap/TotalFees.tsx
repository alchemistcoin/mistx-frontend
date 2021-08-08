import React, { useState, useEffect } from 'react'
import { Trade, WETH, Currency, TradeType } from '@alchemist-coin/mistx-core'
import useUSDCPrice from '../../hooks/useUSDCPrice'
import useTotalFeesForTrade from 'hooks/useTotalFeesForTrade'

interface TotalFeesProps {
  trade: Trade<Currency, Currency, TradeType>
}

const TotalFees = ({ trade }: TotalFeesProps) => {
  const [minerTipPrice, setMinerTipPrice] = useState<string>('')
  const ethUSDCPrice = useUSDCPrice(WETH[1])
  const { totalFeeInEth } = useTotalFeesForTrade(trade)

  useEffect(() => {
    let label = '...'
    if (totalFeeInEth && ethUSDCPrice) {
      label = `$${ethUSDCPrice.quote(totalFeeInEth).toFixed(2)} (${Number(totalFeeInEth.toSignificant(2))} ETH)`
    }
    setMinerTipPrice(label)
  }, [totalFeeInEth, ethUSDCPrice])
  return <>{minerTipPrice}</>
}

export default TotalFees