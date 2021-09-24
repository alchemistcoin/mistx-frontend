import React, { useState, useEffect } from 'react'
import { Trade, BribeEstimate, WETH, CurrencyAmount, Currency, TradeType } from '@alchemist-coin/mistx-core'
import useMinerBribeEstimate from '../../hooks/useMinerBribeEstimate'
import useUSDCPrice from '../../hooks/useUSDCPrice'
import useFeeDisplayCurrency from '../../hooks/useFeeDisplayCurrency'
import Circle from '../../assets/images/blue-loader.svg'
import { CustomLightSpinner } from '../../theme'
import { useWeb3React } from '@web3-react/core'
interface MinerTipPriceProps {
  trade: Trade<Currency, Currency, TradeType>
}

const MinerTipPrice = ({ trade }: MinerTipPriceProps) => {
  const { chainId } = useWeb3React()
  const [minerTipPrice, setMinerTipPrice] = useState<string | null>(null)
  const bribeEstimate: BribeEstimate | null = useMinerBribeEstimate()
  const ethUSDCPrice = useUSDCPrice(WETH[chainId || 1])
  const feeDisplayCurrency = useFeeDisplayCurrency()

  useEffect(() => {
    let label = '...'
    if (trade.minerBribe && ethUSDCPrice) {
      const minerTipAmount = CurrencyAmount.fromFractionalAmount(
        WETH[chainId || 1],
        trade.minerBribe.numerator,
        trade.minerBribe.denominator
      )
      label = `$${ethUSDCPrice.quote(minerTipAmount).toFixed(2)} (${Number(minerTipAmount.toSignificant(2))} ETH)`
    }
    setMinerTipPrice(label)
  }, [chainId, bribeEstimate, ethUSDCPrice, feeDisplayCurrency, trade.minerBribe])

  return <>{minerTipPrice ? minerTipPrice : <CustomLightSpinner src={Circle} alt="loader" size={'14px'} />}</>
}

export default MinerTipPrice
