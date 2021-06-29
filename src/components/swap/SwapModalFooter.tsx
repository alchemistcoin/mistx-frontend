import { Trade, TradeType, Price, TokenAmount, WETH } from '@alchemistcoin/sdk'
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
import useUSDCPrice from '../../utils/useUSDCPrice'
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
  &:disabled {
    background-color: #485361;

    &:before,
    &:after {
      box-shadow: 0 22px 0 0 #485361;
    }

    &:hover:before,
    &:hover:after {
      box-shadow: 0 22px 0 0 #485361;
    }
  }

  &:before,
  &:after {
    box-shadow: 0 22px 0 0 ${({ theme }) => theme.primary2};
    content: '';
    height: 44px;
    position: absolute;
    top: -45px;
    width: 44px;
  }

  &:before {
    border-bottom-left-radius: 50%;
    left: -1px;
  }

  &:after {
    border-bottom-right-radius: 50%;
    right: -1px;
  }

  &:focus:before,
  &:focus:after,
  &:hover:before,
  &:hover:after {
    box-shadow: 0 22px 0 0 ${({ theme }) => darken(0.05, theme.primary2)};
  }

  &:active:before,
  &:active:after {
    box-shadow: 0 22px 0 0 ${({ theme }) => darken(0.1, theme.primary2)};
  }
`

export default function SwapModalFooter({
  trade,
  onConfirm,
  allowedSlippage,
  swapErrorMessage,
  disabledConfirm,
  ethUSDCPrice
}: {
  trade: Trade
  allowedSlippage: number
  onConfirm: () => void
  swapErrorMessage: string | undefined
  disabledConfirm: boolean
  ethUSDCPrice: Price | undefined
}) {
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const theme = useContext(ThemeContext)
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    allowedSlippage,
    trade
  ])
  const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const severity = warningSeverity(priceImpactWithoutFee)
  const minerBribeEth = new TokenAmount(WETH[1], trade.minerBribe.raw)
  const tokenUSDCPrice = useUSDCPrice(
    trade.tradeType === TradeType.EXACT_INPUT
      ? slippageAdjustedAmounts[Field.INPUT]?.currency
      : slippageAdjustedAmounts[Field.OUTPUT]?.currency
  )

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
              display: 'flex'
            }}
          >
            {formatExecutionPrice(trade, showInverted)}
            <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)} style={{ marginRight: '.5rem' }}>
              <Repeat size={14} />
            </StyledBalanceMaxMini>
          </Text>
          <Text fontWeight={400} fontSize={14} color={theme.green2} style={{ whiteSpace: 'nowrap' }}>
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
            {ethUSDCPrice ? (
              <>
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
              </>
            ) : (
              <TYPE.black fontSize={14} fontWeight={700}>
                Loading...
              </TYPE.black>
            )}
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
            &nbsp;&nbsp;
            {realizedLPFee && ethUSDCPrice
              ? '(' +
                tokenUSDCPrice
                  ?.divide(ethUSDCPrice || '0x1')
                  .multiply(realizedLPFee)
                  .toSignificant(2) +
                ' ETH)'
              : '-'}
          </TYPE.black>
        </RowBetween>
        <RowBetween>
          <AutoRow width="fit-content">
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              Transaction Fee
            </TYPE.black>
            <QuestionHelper text="A tip for the miner to accept the transaction." />
          </AutoRow>
          <TYPE.black fontSize={14} fontWeight={700}>
            {ethUSDCPrice
              ? `$ ${ethUSDCPrice.quote(minerBribeEth).toSignificant(4)} (${minerBribeEth.toSignificant(2)} ETH)`
              : `Loading...`}
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
            borderTopRightRadius: 0
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
