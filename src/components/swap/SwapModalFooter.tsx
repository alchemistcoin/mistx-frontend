import { Trade, TradeType } from '@alchemistcoin/sdk'
import { SettingsHeader } from 'components/shared/header/styled'
import { darken } from 'polished'
import React, { useContext, useMemo, useState } from 'react'
import { Repeat } from 'react-feather'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { Field } from '../../state/swap/actions'
import { TYPE } from '../../theme'
import {
  computeSlippageAdjustedAmounts,
  computeTradePriceBreakdown,
  formatExecutionPrice,
  warningSeverity
} from '../../utils/prices'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import FormattedPriceImpact from './FormattedPriceImpact'
import { StyledBalanceMaxMini, SwapCallbackError } from './styleds'

const PriceWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg4};
  padding: 1rem 2rem 1rem 1.5rem;
`

const ConfirmButton = styled(ButtonError)`
  &:before {
    content: "";
    position: absolute;
    top: -45px;
    left: -1px;
    height: 44px;
    width: 44px;
    border-bottom-left-radius: 50%;
    box-shadow: 0 22px 0 0 ${({ theme }) => theme.primary2};
  }

  &:hover:before {
    box-shadow: 0 22px 0 0 ${({ theme }) => darken(.05, theme.primary2)};
  }

  &:after {
    content: "";
    position: absolute;
    top: -45px;
    right: -1px;
    height: 44px;
    width: 44px;
    border-bottom-right-radius: 50%;
    box-shadow: 0 22px 0 0 ${({ theme }) => theme.primary2};
  }

  &:hover:after {
    box-shadow: 0 22px 0 0 ${({ theme }) => darken(.05, theme.primary2)};
  }
`

export default function SwapModalFooter({
  trade,
  onConfirm,
  allowedSlippage,
  swapErrorMessage,
  disabledConfirm
}: {
  trade: Trade
  allowedSlippage: number
  onConfirm: () => void
  swapErrorMessage: string | undefined
  disabledConfirm: boolean
}) {
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const theme = useContext(ThemeContext)
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    allowedSlippage,
    trade
  ])
  const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const severity = warningSeverity(priceImpactWithoutFee)

  return (
    <>
      <PriceWrapper>
        <RowBetween align="center">
          <Text
            fontWeight={600}
            fontSize={20}
            color={theme.text1}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
            }}
          >
            {formatExecutionPrice(trade, showInverted)}
            <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
              <Repeat size={14} />
            </StyledBalanceMaxMini>
          </Text>
          <Text fontWeight={400} fontSize={14} color={theme.green2}>
            Current Price
          </Text>
        </RowBetween>
      </PriceWrapper>
      <AutoColumn gap="14px" style={{ padding: '2.5rem 1.5rem' }}>
        <SettingsHeader style={{ marginBottom: '.625rem' }}>
          <Text fontWeight={600} fontSize={20}>
            Breakdown
          </Text>
        </SettingsHeader>
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}
            </TYPE.black>
            <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
          </RowFixed>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={700}>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? '-'
                : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? '-'}
            </TYPE.black>
            <TYPE.black fontSize={14} marginLeft={'4px'} fontWeight={700}>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? trade.outputAmount.currency.symbol
                : trade.inputAmount.currency.symbol}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <AutoRow width="fit-content">
            <TYPE.black color={theme.text2} fontSize={14} fontWeight={400}>
              Price Impact
            </TYPE.black>
            <QuestionHelper text="The difference between the market price and your price due to trade size." />
          </AutoRow>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </RowBetween>
        <RowBetween>
          <AutoRow width="fit-content">
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              Liquidity Provider Fee
            </TYPE.black>
            <QuestionHelper text="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive." />
          </AutoRow>
          <TYPE.black fontSize={14} fontWeight={700}>
            {realizedLPFee ? realizedLPFee?.toSignificant(6) + ' ' + trade.inputAmount.currency.symbol : '-'}
          </TYPE.black>
        </RowBetween>
      </AutoColumn>

      <AutoRow>
        <ConfirmButton
          onClick={onConfirm}
          disabled={disabledConfirm}
          error={severity > 2}
          style={{
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
          id="confirm-swap-or-send"
        >
          <Text fontSize={20} fontWeight={700}>
            {severity > 2 ? 'Swap Anyway' : 'Confirm Swap'}
          </Text>
        </ConfirmButton>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}
