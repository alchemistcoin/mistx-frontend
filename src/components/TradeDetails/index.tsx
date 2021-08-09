import React, { useContext, useMemo } from 'react'
import { Trade, TradeType, Percent, JSBI, Currency, WETH, Exchange } from '@alchemist-coin/mistx-core'
import { useActiveWeb3React } from '../../hooks'
import { ThemeContext } from 'styled-components/macro'
import { TYPE } from '../../theme'
import { BIPS_BASE } from '../../constants'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'
import SwapPath from './swapPath'
import { computeTradePriceBreakdown } from '../../utils/prices'
import FormattedPriceImpact from '../swap/FormattedPriceImpact'
import SwapPrice from '../swap/SwapPrice'
import MinerTipPrice from '../swap/MinerTipPrice'
import useUSDCPrice from '../../hooks/useUSDCPrice'
import { FeeRowBetween, Divider } from '../swap/styleds'
import useTotalFeesForTrade from 'hooks/useTotalFeesForTrade'
interface TradeDetailsProps {
  trade: Trade<Currency, Currency, TradeType>
  allowedSlippage: number
}

export default function TradeDetails({ trade, allowedSlippage }: TradeDetailsProps) {
  const { chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)
  const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const slippagePercent = new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE)
  const ethUSDCPrice = useUSDCPrice(WETH[chainId || 1])

  const { realizedLPFeeInEth, baseFeeInEth } = useTotalFeesForTrade(trade)

  return !trade ? null : (
    <AutoColumn gap="6px">
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
            {trade.tradeType === TradeType.EXACT_INPUT ? `Min received` : `Max sent`}
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
            Slippage tolerance
          </TYPE.black>
        </RowFixed>
        <TYPE.black textAlign="right" fontSize={14} color={theme.text1}>
          {(allowedSlippage / 100).toFixed(2)}%
        </TYPE.black>
      </RowBetween>
      <Divider />
      <RowBetween>
        <RowFixed marginRight={20}>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
            mistX Fees
          </TYPE.black>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <RowFixed marginRight={20}>
          <TYPE.black fontSize={12} fontWeight={400} color={theme.text1} lineHeight="14px">
          Protection from front-running attacks, cancellation fees, and failure costs.
          </TYPE.black>
        </RowFixed>
      </RowBetween>

      <FeeRowBetween paddingLeft={20}>
        <RowFixed marginRight={20}>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
            mistX Protection
          </TYPE.black>
        </RowFixed>
        <TYPE.black textAlign="right" fontSize={14} color={theme.text1}>
          <MinerTipPrice trade={trade} />
        </TYPE.black>
      </FeeRowBetween>
      <Divider />
      <RowBetween>
        <RowFixed marginRight={20}>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
            Network Fees
          </TYPE.black>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <RowFixed marginRight={20}>
          <TYPE.black fontSize={12} fontWeight={400} color={theme.text1} lineHeight="14px">
            Fees charged by the liquidity providers (Uniswap or Sushiswap) and the usage of ETH blockchain. You would pay these fees even if you were not using mistX
          </TYPE.black>
        </RowFixed>
      </RowBetween>

      <FeeRowBetween paddingLeft={20}>
        <RowFixed marginRight={20}>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
            {trade.exchange === Exchange.UNI ? 'Uniswap' : 'Sushiswap'} LP Fee
          </TYPE.black>
        </RowFixed>
        <TYPE.black textAlign="right" fontSize={14} color={theme.text1}>
          {realizedLPFee && realizedLPFeeInEth && ethUSDCPrice
            ? `$${ethUSDCPrice.quote(realizedLPFeeInEth).toFixed(2)} (${realizedLPFee.toSignificant(
                4
              )} ${realizedLPFee.currency && realizedLPFee.currency.symbol})`
            : '-'}
        </TYPE.black>
      </FeeRowBetween>
      {baseFeeInEth && ethUSDCPrice ? (
        <FeeRowBetween paddingLeft={20}>
          <RowFixed marginRight={20}>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              ETH Base Fee
            </TYPE.black>
          </RowFixed>
          <TYPE.black textAlign="right" fontSize={14} color={theme.text1}>
            {`< $${ethUSDCPrice.quote(baseFeeInEth).toFixed(2)} (${baseFeeInEth.toSignificant(4)} ETH)`}
          </TYPE.black>
        </FeeRowBetween>
      ) : (
        <></>
      )}

      {/*eip1559 && baseFeeInEth && ethUSDCPrice ? (
        <FeeRowBetween paddingLeft={20}>
          <RowFixed marginRight={20}>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              Base Fee
            </TYPE.black>
          </RowFixed>
          <TYPE.black textAlign="right" fontSize={14} color={theme.text1}>
            {`$${ethUSDCPrice.quote(baseFeeInEth).toFixed(2)} (${baseFeeInEth.toSignificant(4)} ETH)`}
          </TYPE.black>
        </FeeRowBetween>
      ) : (
        <></>
      )*/}
    </AutoColumn>
  )
}
