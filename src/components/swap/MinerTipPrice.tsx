import React, { useState, useEffect } from 'react'
import { Trade, BribeEstimate, WETH, TokenAmount } from '@alchemistcoin/sdk'
import useMinerBribeEstimate from '../../hooks/useMinerBribeEstimate'
import useUSDCPrice from '../../hooks/useUSDCPrice'
import useFeeDisplayCurrency from '../../hooks/useFeeDisplayCurrency'

interface MinerTipPriceProps {
  trade: Trade
}

const MinerTipPrice = ({ trade }: MinerTipPriceProps) => {
  const [minerTipPrice, setMinerTipPrice] = useState<string>('')
  const bribeEstimate: BribeEstimate | null = useMinerBribeEstimate()
  const ethUSDCPrice = useUSDCPrice(WETH[1])
  const feeDisplayCurrency = useFeeDisplayCurrency()

  useEffect(() => {
    let label = '...'
    if (trade.minerBribe && ethUSDCPrice) {
      const minerTipAmount = new TokenAmount(WETH[1], trade.minerBribe.raw)
      if (feeDisplayCurrency === 'USD') {
        label = `$${ethUSDCPrice.quote(minerTipAmount).toSignificant(2)}`
      } else {
        label = `${Number(minerTipAmount.toSignificant(2))} ETH`
      }
    }
    setMinerTipPrice(label)
  }, [bribeEstimate, ethUSDCPrice, feeDisplayCurrency, trade.minerBribe])
  return <>{minerTipPrice}</>
}

export default MinerTipPrice
