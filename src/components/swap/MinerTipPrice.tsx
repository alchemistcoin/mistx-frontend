import React, { useState, useEffect } from 'react'
import { Trade, BribeEstimate, WETH, CurrencyAmount, Currency, TradeType } from '@alchemist-coin/mistx-core'
import useMinerBribeEstimate from '../../hooks/useMinerBribeEstimate'
import useUSDCPrice from '../../hooks/useUSDCPrice'
import useFeeDisplayCurrency from '../../hooks/useFeeDisplayCurrency'

interface MinerTipPriceProps {
  trade: Trade<Currency, Currency, TradeType>
}

const MinerTipPrice = ({ trade }: MinerTipPriceProps) => {
  const [minerTipPrice, setMinerTipPrice] = useState<string>('')
  const bribeEstimate: BribeEstimate | null = useMinerBribeEstimate()
  const ethUSDCPrice = useUSDCPrice(WETH[1])
  const feeDisplayCurrency = useFeeDisplayCurrency()

  useEffect(() => {
    let label = '...'
    if (trade.minerBribe && ethUSDCPrice) {
      const minerTipAmount = CurrencyAmount.fromRawAmount(WETH[1], trade.minerBribe.quotient)
      label = `$${ethUSDCPrice.quote(minerTipAmount).toFixed(2)} (${Number(minerTipAmount.toSignificant(2))} ETH)`
    }
    setMinerTipPrice(label)
  }, [bribeEstimate, ethUSDCPrice, feeDisplayCurrency, trade.minerBribe])
  return <>{minerTipPrice}</>
}

export default MinerTipPrice
