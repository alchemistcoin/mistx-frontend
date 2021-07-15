import React, { useContext } from 'react'
import { TradeType } from '@alchemistcoin/sdk'
import { ThemeContext } from 'styled-components/macro'
import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'
import SwapPath from './swapPath'

interface TradeDetailsProps {
  trade?: any
  allowedSlippage: number
}

export default function TradeDetails({ trade, allowedSlippage }: TradeDetailsProps) {
  const theme = useContext(ThemeContext)

  //   const { realizedLPFee, priceImpact } = useMemo(() => {
  //     if (!trade) return { realizedLPFee: undefined, priceImpact: undefined }

  //     // const realizedLpFeePercent = computeRealizedLPFeePercent(trade)
  //     // const realizedLPFee = trade.inputAmount.multiply(realizedLpFeePercent)
  //     // const priceImpact = trade.priceImpact.subtract(realizedLpFeePercent)
  //     return { priceImpact, realizedLPFee }
  //   }, [trade])

  // const slippagePercent = {new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE)}

  console.log('- log ', trade)

  return !trade ? null : (
    <AutoColumn gap="8px">
      <RowBetween>
        <RowFixed>
          <TYPE.black fontSize={12} fontWeight={400} color={theme.text2}>
            Liquidity Provider Fee
          </TYPE.black>
        </RowFixed>
        {/* <TYPE.black textAlign="right" fontSize={12} color={theme.text1}>
          {realizedLPFee ? `${realizedLPFee.toSignificant(4)} ${realizedLPFee.currency.symbol}` : '-'}
        </TYPE.black> */}
      </RowBetween>

      <RowBetween>
        <RowFixed>
          <TYPE.black fontSize={12} fontWeight={400} color={theme.text2}>
            Route
          </TYPE.black>
        </RowFixed>
        <TYPE.black textAlign="right" fontSize={12} color={theme.text1}>
          <SwapPath trade={trade} />
        </TYPE.black>
      </RowBetween>

      <RowBetween>
        <RowFixed>
          <TYPE.black fontSize={12} fontWeight={400} color={theme.text2}>
            Price Impact
          </TYPE.black>
        </RowFixed>
        <TYPE.black textAlign="right" fontSize={12} color={theme.text1}>
          {/* <FormattedPriceImpact priceImpact={priceImpact} /> */}
        </TYPE.black>
      </RowBetween>

      <RowBetween>
        <RowFixed>
          <TYPE.black fontSize={12} fontWeight={400} color={theme.text2}>
            {trade.tradeType === TradeType.EXACT_INPUT ? `Minimum received` : `Maximum sent`}
          </TYPE.black>
        </RowFixed>
        {/* <TYPE.black textAlign="right" fontSize={12} color={theme.text1}>
          {trade.tradeType === TradeType.EXACT_INPUT
            ? `${trade.minimumAmountOut(allowedSlippage).toSignificant(6)} ${trade.outputAmount.currency.symbol}`
            : `${trade.maximumAmountIn(allowedSlippage).toSignificant(6)} ${trade.inputAmount.currency.symbol}`}
        </TYPE.black> */}
      </RowBetween>

      <RowBetween>
        <RowFixed>
          <TYPE.black fontSize={12} fontWeight={400} color={theme.text2}>
            Slippage tolerance
          </TYPE.black>
        </RowFixed>
        <TYPE.black textAlign="right" fontSize={12} color={theme.text1}>
          {(allowedSlippage / 100).toFixed(2)}%
        </TYPE.black>
      </RowBetween>
    </AutoColumn>
  )
}
