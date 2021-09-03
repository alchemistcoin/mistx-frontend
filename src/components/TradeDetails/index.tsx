import React, { useContext, useMemo } from 'react'
import { Trade, TradeType, Percent, JSBI, Currency, WETH } from '@alchemist-coin/mistx-core'
import { useActiveWeb3React } from '../../hooks'
import styled, { ThemeContext } from 'styled-components/macro'
import { TYPE, CustomLightSpinner } from '../../theme'
import { BIPS_BASE } from '../../constants'
import { AutoColumn } from '../Column'
import { Row, RowBetween, RowFixed } from '../Row'
import SwapPath from './swapPath'
import { computeTradePriceBreakdown } from '../../utils/prices'
import FormattedPriceImpact from '../swap/FormattedPriceImpact'
import SwapPrice from '../swap/SwapPrice'
import MinerTipPrice from '../swap/MinerTipPrice'
import useUSDCPrice from '../../hooks/useUSDCPrice'
import { FeeRowBetween, Divider } from '../swap/styleds'
import useTotalFeesForTrade from 'hooks/useTotalFeesForTrade'
import Circle from '../../assets/images/light-loader.svg'
interface TradeDetailsProps {
  trade: Trade<Currency, Currency, TradeType>
  allowedSlippage: number
}

export const StyledFeeRowBetween = styled(FeeRowBetween)`
  &:before {
    top: 12px;
  }
`

export default function TradeDetails({ trade, allowedSlippage }: TradeDetailsProps) {
  const { chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)
  const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const slippagePercent = new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE)
  const ethUSDCPrice = useUSDCPrice(WETH[chainId || 1])

  const { realizedLPFeeInEth, baseFeeInEth, maxBaseFeeInEth, maxTotalFeeInEth, totalFeeInEth } = useTotalFeesForTrade(trade)

  return !trade ? null : (
    <AutoColumn gap="6px" width="20rem">
      <RowBetween>
        <RowFixed marginRight={20}>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
            Swap
          </TYPE.black>
        </RowFixed>
        <TYPE.black textAlign="right" fontSize={14} color={theme.text1}>
          <SwapPath trade={trade} />
        </TYPE.black>
      </RowBetween>
      <RowBetween>
        <RowFixed marginRight={20}>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
            Swap Price
          </TYPE.black>
        </RowFixed>
        <TYPE.black textAlign="right" fontSize={14} color={theme.text1}>
          <SwapPrice trade={trade} />
        </TYPE.black>
      </RowBetween>

      <RowBetween>
        <RowFixed marginRight={20}>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
            {trade.tradeType === TradeType.EXACT_INPUT ? `Minimum received` : `Maximum sent`}
          </TYPE.black>
        </RowFixed>
        <TYPE.black textAlign="right" fontSize={14} color={theme.text1}>
          {trade.tradeType === TradeType.EXACT_INPUT
            ? `${trade.minimumAmountOut(slippagePercent).toSignificant(6)} ${trade.outputAmount.currency.symbol}`
            : `${trade.maximumAmountIn(slippagePercent).toSignificant(6)} ${trade.inputAmount.currency.symbol}`}
        </TYPE.black>
      </RowBetween>

      <RowBetween>
        <RowFixed marginRight={20}>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
            Price Impact
          </TYPE.black>
        </RowFixed>
        <TYPE.black textAlign="right" fontSize={14} color={theme.text1}>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </TYPE.black>
      </RowBetween>

      <RowBetween>
        <RowFixed marginRight={20}>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
            Slippage Tolerance
          </TYPE.black>
        </RowFixed>
        <TYPE.black textAlign="right" fontSize={14} color={theme.text1}>
          {(allowedSlippage / 100).toFixed(2)}%
        </TYPE.black>
      </RowBetween>
      <Divider />
      <RowBetween>
        <RowFixed marginRight={0} marginBottom="10px">
          <TYPE.black fontSize={16} fontWeight={600} color={theme.text2}>
            Fee Breakdown
          </TYPE.black>
        </RowFixed>
      </RowBetween>

      <RowBetween align="flex-start" flexDirection="column" width="100%">
        <Row marginRight={0} justify="space-between" width="100%" marginBottom={'4px'}>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2} lineHeight="18px">
            mistX Protection
          </TYPE.black>
          <TYPE.black textAlign="right" fontSize={14} color={theme.text1}>
            <MinerTipPrice trade={trade} />
          </TYPE.black>
        </Row>
      </RowBetween>

      <RowBetween align="flex-start" flexDirection="column" width="100%">
        <Row marginRight={0} justify="space-between" width="100%" marginBottom={'4px'}>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2} lineHeight="18px">
            Liquidity Provider
          </TYPE.black>
          <TYPE.black textAlign="right" fontSize={14} color={theme.text1}>
            {realizedLPFee && realizedLPFeeInEth && ethUSDCPrice
              ? `$${ethUSDCPrice.quote(realizedLPFeeInEth).toFixed(2)} (${realizedLPFee.toSignificant(
                  3
                )} ${realizedLPFee.currency && realizedLPFee.currency.symbol})`
              : '-'}
          </TYPE.black>
        </Row>
      </RowBetween>

      <RowBetween align="flex-start" flexDirection="column" width="100%">
        <Row marginRight={0} justify="space-between" width="100%" marginBottom={'0px'}>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2} lineHeight="18px">
            Base Fee (Estimated)
          </TYPE.black>
          <TYPE.black textAlign="right" fontSize={14} color={theme.text1}>
            {ethUSDCPrice && baseFeeInEth && `$${ethUSDCPrice.quote(baseFeeInEth).toFixed(2)} `}
            {baseFeeInEth ? (
              '(' + baseFeeInEth?.toSignificant(3) + ' ETH)'
            ) : (
              <CustomLightSpinner src={Circle} alt="loader" size={'15px'} />
            )}
          </TYPE.black>
        </Row>
      </RowBetween>

      <RowBetween align="flex-start" flexDirection="column" width="100%" style={{ opacity: 0.4 }}>
        <Row marginRight={0} justify="space-between" width="100%" marginBottom={'4px'}>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2} lineHeight="18px">
            ┗ Max Base Fee
          </TYPE.black>
          <TYPE.black textAlign="right" fontSize={14} color={theme.text1}>
            {ethUSDCPrice && maxBaseFeeInEth && `≤ $${ethUSDCPrice.quote(maxBaseFeeInEth).toFixed(2)} `}
            {maxBaseFeeInEth ? (
              '(' + maxBaseFeeInEth?.toSignificant(3) + ' ETH)'
            ) : (
              <CustomLightSpinner src={Circle} alt="loader" size={'15px'} />
            )}
          </TYPE.black>
        </Row>
      </RowBetween>

      <RowBetween align="flex-start" flexDirection="column" width="100%">
        <Row marginRight={0} justify="space-between" width="100%" marginBottom={'4px'}>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2} lineHeight="18px">
            Total (Estimated)
          </TYPE.black>
          <TYPE.black textAlign="right" fontSize={14} color={theme.text1}>
            {ethUSDCPrice && totalFeeInEth && baseFeeInEth && `$${ethUSDCPrice.quote(totalFeeInEth).toFixed(2)} `}
            {totalFeeInEth && baseFeeInEth ? (
              '(' + totalFeeInEth?.toSignificant(3) + ' ETH)'
            ) : (
              <CustomLightSpinner src={Circle} alt="loader" size={'15px'} />
            )}
          </TYPE.black>
        </Row>
        <Row marginRight={0} justify="space-between" width="100%" marginBottom={'4px'} style={{ opacity: 0.4 }}>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2} lineHeight="18px" />
          <TYPE.black textAlign="right" fontSize={14} color={theme.text1}>
            {ethUSDCPrice && maxTotalFeeInEth && baseFeeInEth && `≤ $${ethUSDCPrice.quote(maxTotalFeeInEth).toFixed(2)} `}
            {maxTotalFeeInEth && baseFeeInEth ? (
              '(' + maxTotalFeeInEth?.toSignificant(3) + ' ETH)'
            ) : (
              <CustomLightSpinner src={Circle} alt="loader" size={'15px'} />
            )}
          </TYPE.black>
        </Row>
      </RowBetween>
    </AutoColumn>
  )
}
