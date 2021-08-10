import { Trade, Token, TradeType, Price, Currency } from '@alchemist-coin/mistx-core'
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
import { FeeRowBetween } from '../swap/styleds'
import useTotalFeesForTrade from 'hooks/useTotalFeesForTrade'
import MinerTipPrice from '../swap/MinerTipPrice'

const PriceWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg4};
  padding: 1rem 2rem 1rem 1.5rem;
`

const StyledFeeRowBetween = styled(FeeRowBetween)`
  &:before {
    top: 12px;
  }
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

const StyledQuestionHelper = styled(QuestionHelper)`
  width: 20px;
  margin-left: 10px;
`

export default function SwapModalFooter({
  trade,
  onConfirm,
  allowedSlippage,
  swapErrorMessage,
  disabledConfirm,
  ethUSDCPrice
}: {
  trade: Trade<Currency, Currency, TradeType>
  allowedSlippage: number
  onConfirm: () => void
  swapErrorMessage: string | undefined
  disabledConfirm: boolean
  ethUSDCPrice: Price<Currency, Token> | undefined
}) {
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const theme = useContext(ThemeContext)
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    allowedSlippage,
    trade
  ])
  const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const severity = warningSeverity(priceImpactWithoutFee)
  const { totalFeeInEth, realizedLPFeeInEth, maxBaseFeeInEth, minBaseFeeInEth } = useTotalFeesForTrade(trade)

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
            <StyledQuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
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
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              Slippage Tolerance
            </TYPE.black>
            <StyledQuestionHelper text="Your transaction will revert if the price changes unfavorably by more than this percentage." />
          </RowFixed>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={700}>
              {`${(allowedSlippage / 100).toFixed(2)}%`}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <AutoRow width="fit-content">
            <TYPE.black color={theme.text2} fontSize={14} fontWeight={400}>
              Price Impact
            </TYPE.black>
            <StyledQuestionHelper text="The difference between the market price and your price due to trade size." />
          </AutoRow>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </RowBetween>

        <RowBetween>
          <AutoRow width="fit-content">
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              Total Fee
            </TYPE.black>
            <StyledQuestionHelper text="Total transaction fee" />
          </AutoRow>
          <TYPE.black fontSize={14} fontWeight={700}>
            {totalFeeInEth && ethUSDCPrice
              ? `$${ethUSDCPrice.quote(totalFeeInEth).toFixed(2)} (${totalFeeInEth.toSignificant(4)} ETH)`
              : '-'}
          </TYPE.black>
        </RowBetween>

        <StyledFeeRowBetween paddingLeft={20}>
          <AutoRow width="fit-content">
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              mistX Protection
            </TYPE.black>
            <StyledQuestionHelper text="A tip for the miner to accept the private transaction to avoid front-running and sandwich attacks." />
          </AutoRow>
          <TYPE.black fontSize={14} fontWeight={400}>
            <MinerTipPrice trade={trade} />
          </TYPE.black>
        </StyledFeeRowBetween>

        <StyledFeeRowBetween paddingLeft={20}>
          <AutoRow width="fit-content">
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              Network Fees
            </TYPE.black>
          </AutoRow>
        </StyledFeeRowBetween>

        <RowBetween paddingLeft={20} display="flex" flexDirection="column">
          <StyledFeeRowBetween paddingLeft={20} marginBottom={10}>
            <AutoRow width="fit-content">
              <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
                Liquidity Provider
              </TYPE.black>
              <StyledQuestionHelper text="A fee charged by the liquidity providers (Uniswap or Sushiswap) mistX gets 0% of this fee." />
            </AutoRow>
            <TYPE.black fontSize={14} fontWeight={500}>
              {ethUSDCPrice && realizedLPFeeInEth && `$${ethUSDCPrice.quote(realizedLPFeeInEth).toFixed(2)} `}
              {realizedLPFee
                ? '(' + realizedLPFee?.toSignificant(4) + ' ' + trade.inputAmount.currency.symbol + ')'
                : '-'}
            </TYPE.black>
          </StyledFeeRowBetween>

          <StyledFeeRowBetween paddingLeft={20} marginBottom={10}>
            <AutoRow width="fit-content">
              <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
                Base Fee
              </TYPE.black>
              <StyledQuestionHelper text="A fee charged for successful usage of ETH blockchain mistX gets 0% of this fee." />
            </AutoRow>
            <div>
              {ethUSDCPrice && minBaseFeeInEth !== undefined && maxBaseFeeInEth !== undefined ? (
                <>
                  <TYPE.black textAlign="right" fontSize={14} color={theme.text1} fontWeight={500}>
                    {`$${ethUSDCPrice.quote(minBaseFeeInEth).toFixed(2)}-${ethUSDCPrice
                      .quote(maxBaseFeeInEth)
                      .toFixed(2)}`}
                  </TYPE.black>
                  <div>
                    <TYPE.black textAlign="right" fontSize={14} color={theme.text1} fontWeight={500}>
                      {`(${minBaseFeeInEth.toSignificant(4)}-${maxBaseFeeInEth.toSignificant(4)} ETH)`}
                    </TYPE.black>
                  </div>
                </>
              ) : (
                'Loading'
              )}
            </div>
          </StyledFeeRowBetween>
        </RowBetween>
        {/*eip1559 && baseFeeInEth && ethUSDCPrice ? (
          <StyledFeeRowBetween paddingLeft={20}>
            <AutoRow width="fit-content">
              <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
                Base Fee
              </TYPE.black>
              <QuestionHelper text="The London hard fork (EIP 1559) requires a base fee for every transaction. The value shown is the maximum base fee you will pay for your transaction." />
            </AutoRow>
            <TYPE.black fontSize={14} fontWeight={700}>
              {`$${ethUSDCPrice.quote(baseFeeInEth).toFixed(2)} (${baseFeeInEth.toSignificant(4)} ETH)`}
            </TYPE.black>
          </StyledFeeRowBetween>
        ) : (
          <></>
        )*/}
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
