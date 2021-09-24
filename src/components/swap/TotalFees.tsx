import React, { useState, useEffect } from 'react'
import { Trade, WETH, Currency, TradeType, CurrencyAmount } from '@alchemist-coin/mistx-core'
import useUSDCPrice from '../../hooks/useUSDCPrice'
import useTotalFeesForTrade from 'hooks/useTotalFeesForTrade'
import { useWeb3React } from '@web3-react/core'

interface TotalFeesProps {
  trade: Trade<Currency, Currency, TradeType>
}

const TotalFees = ({ trade }: TotalFeesProps) => {
  const [minerTipPrice, setMinerTipPrice] = useState<string>('')
  const { chainId } = useWeb3React()
  const ethUSDCPrice = useUSDCPrice(WETH[chainId || 1])
  const { minerBribe } = useTotalFeesForTrade(trade)

  useEffect(() => {
    let label = '...'
    if (minerBribe && ethUSDCPrice) {
      const minerTipAmount = CurrencyAmount.fromFractionalAmount(
        WETH[chainId || 1],
        minerBribe.numerator,
        minerBribe.denominator
      )
      label = `$${ethUSDCPrice.quote(minerTipAmount).toFixed(2)} (${Number(minerBribe.toSignificant(2))} ETH)`
    }
    setMinerTipPrice(label)
  }, [chainId, minerBribe, ethUSDCPrice])
  return <>{minerTipPrice}</>
}

export default TotalFees
