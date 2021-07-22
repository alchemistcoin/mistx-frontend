import React, { useContext, useMemo, memo } from 'react'
import styled from 'styled-components'
import { Trade, TradeType, Percent, JSBI, Currency, WETH, CurrencyAmount } from '@alchemistcoin/sdk'
// import { BigNumber } from '@ethersproject/bignumber'
import { ThemeContext } from 'styled-components/macro'
import { TYPE } from '../../theme'
import { BIPS_BASE } from '../../constants'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'
import SwapPath from './swapPath'
import { computeTradePriceBreakdown } from '../../utils/prices'
import FormattedPriceImpact from '../swap/FormattedPriceImpact'
import MinerTipPrice from '../swap/MinerTipPrice'
import useEthPrice from '../../hooks/useEthPrice'
import useUsdPrice from '../../hooks/useUSDCPrice'

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.text3};
  margin: 10px 0;
`
const FeeRowBetween = styled(RowBetween)`
  position: relative;
  &:after {
    content: '';
    height: 13px;
    width: 1px;
    position: absolute;
    left: 8px;
    top: 0px;
    background-color: ${({ theme }) => theme.text2};
  }
  &:before {
    content: '';
    height: 1px;
    width: 8px;
    position: absolute;
    left: 8px;
    bottom: 11px;
    background-color: ${({ theme }) => theme.text2};
  }
`

interface TradeDetailsProps {
  trade: Trade<Currency, Currency, TradeType>
  allowedSlippage: number
}

export default memo(function TradeDetails({ trade, allowedSlippage }: TradeDetailsProps) {
  const theme = useContext(ThemeContext)

  const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const slippagePercent = new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE)

  const ethPrice = useEthPrice(trade.inputAmount.currency.wrapped)
  const usdLpPrice = useUsdPrice(realizedLPFee?.currency)
  let lpFeeInUSD = null
  if (usdLpPrice && realizedLPFee) {
    lpFeeInUSD = usdLpPrice.quote(realizedLPFee).toSignificant(4)
  }

  let realizedLPFeeInEth = 0
  if (ethPrice && realizedLPFee) {
    realizedLPFeeInEth = Number(ethPrice.quote(realizedLPFee?.wrapped).toSignificant(4))
  }

  const totalFeeInEth = Number(trade.minerBribe.toSignificant(4)) + realizedLPFeeInEth
  // const ethPriceUsd = useUsdPrice(WETH[1])
  const ethTotalFeeCurrencyAmmount = CurrencyAmount.fromFractionalAmount(WETH[1], totalFeeInEth, WETH[1].decimals)
  console.log('ethTotalFeeCurrencyAmmount', ethTotalFeeCurrencyAmmount)
  // const totalFeeInUsd = ethPriceUsd ? ethPriceUsd.quote(ethTotalFeeCurrencyAmmount).toSignificant(4) : null
  const totalFeeInUsd = 1;

  return !trade ? null : (
    <AutoColumn gap="6px">
      <RowBetween>
        <RowFixed marginRight={20}>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
            Total Fee
          </TYPE.black>
        </RowFixed>
        <TYPE.black textAlign="right" fontSize={14} color={theme.text1}>
          {totalFeeInEth} ETH {totalFeeInUsd && `$${totalFeeInUsd}`}
        </TYPE.black>
      </RowBetween>

      <FeeRowBetween paddingLeft={20}>
        <RowFixed marginRight={20}>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
            Liquidity Provider Fee
          </TYPE.black>
        </RowFixed>
        <TYPE.black textAlign="right" fontSize={14} color={theme.text1}>
          {realizedLPFee
            ? `${realizedLPFee.toSignificant(4)} ${realizedLPFee.currency && realizedLPFee.currency.symbol}`
            : '-'}
          {` $${lpFeeInUSD}`}
        </TYPE.black>
      </FeeRowBetween>

      <FeeRowBetween paddingLeft={20}>
        <RowFixed marginRight={20}>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
            Miner Tip
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
    </AutoColumn>
  )
})
