import React, { useContext } from 'react'
import { Currency, CurrencyAmount, JSBI, Trade, TradeType } from '@alchemist-coin/mistx-core'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { darken } from 'polished'
import { TYPE } from '../../theme'
// actions
import { Field } from '../../state/swap/actions'
// hooks
import { useActiveWeb3React } from '../../hooks'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useIsTransactionUnsupported } from '../../hooks/Trades'
import { useSocketStatus, useWalletModalToggle } from '../../state/application/hooks'
import { useDerivedSwapInfo, useSwapState } from '../../state/swap/hooks'
import { useExpertModeManager, useUserSingleHopOnly, useUserSlippageTolerance } from '../../state/user/hooks'
// utils
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
// components
import { ButtonError } from '../Button'
import { GreyCard } from '../Card'
import { Info } from '../Icons'
import MinerTipPrice from './MinerTipPrice'
import { AutoRow } from '../Row'
import { BottomGrouping, SwapCallbackError, FeeWrapper, FeeInnerLeft, FeeInnerRight } from './styleds'
import { MouseoverTooltipContent } from '../Tooltip'
import TradeDetails from '../TradeDetails'

const StyledButtonError = styled(ButtonError)<{ disabled: boolean }>`
  border-radius: 0 0 20px 20px;
  padding: 1.375rem 0;
  background-color: ${({ theme }) => theme.primary2};

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
    box-shadow: 0 22px 0 0 ${({ error, theme }) => (error ? theme.red1 : theme.primary2)};
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
    box-shadow: 0 22px 0 0 ${({ error, theme }) => (error ? darken(0.05, theme.red1) : darken(0.05, theme.primary2))};
  }

  &:active:before,
  &:active:after {
    box-shadow: 0 22px 0 0 ${({ error, theme }) => (error ? darken(0.1, theme.red1) : darken(0.1, theme.primary2))};
  }
`

const StyledButtonYellow = styled(StyledButtonError)`
  font-size: 20px;
  font-weight: 700;
`

const InfoWrapper = styled.div`
  svg {
    circle,
    path {
      fill: ${({ theme }) => theme.primary2};
    }
  }
`

interface SwapFooterProps {
  onSwapIntent: () => void
  parsedAmounts: {
    INPUT: CurrencyAmount<Currency> | undefined
    OUTPUT: CurrencyAmount<Currency> | undefined
  }
  swapCallbackError: string | null
  swapErrorMessage: string | undefined
  trade: Trade<Currency, Currency, TradeType> | undefined
}

export default function SwapFooter({
  onSwapIntent,
  swapCallbackError,
  swapErrorMessage,
  parsedAmounts,
  trade
}: SwapFooterProps) {
  const theme = useContext(ThemeContext)

  const { account } = useActiveWeb3React()
  const { independentField, typedValue } = useSwapState()
  const {
    currencies,
    inputError: swapInputError,
    minAmountError: swapMinAmountError
  } = useDerivedSwapInfo()
  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )
  // Server Connection Status
  const webSocketConnected = useSocketStatus()
  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()
  const swapIsUnsupported = useIsTransactionUnsupported(currencies?.INPUT, currencies?.OUTPUT)
  const [singleHopOnly] = useUserSingleHopOnly()
  const [allowedSlippage] = useUserSlippageTolerance()
  const [isExpertMode] = useExpertModeManager()

  const isValid = !swapInputError
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const noRoute = !trade?.route
  const userHasSpecifiedInputOutput = !!(
    currencies[Field.INPUT] &&
    currencies[Field.OUTPUT] &&
    parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)
  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  function handleSwapIntent() {
    onSwapIntent()
  }

  return (
    <>
      {trade && trade.minerBribe ? (
        <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
          <FeeWrapper>
            <FeeInnerLeft>
              <Text
                style={{
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                  display: 'flex',
                  paddingRight: 10
                }}
              >
                Miner Tip:&nbsp;
                <Text fontWeight={500} fontSize={14} color={theme.text2}>
                  <MinerTipPrice trade={trade} />
                </Text>
              </Text>
            </FeeInnerLeft>
            <FeeInnerRight>
              <MouseoverTooltipContent content={<TradeDetails trade={trade} allowedSlippage={allowedSlippage} />}>
                <InfoWrapper>
                  <Info />
                </InfoWrapper>
              </MouseoverTooltipContent>
            </FeeInnerRight>
          </FeeWrapper>
        </AutoRow>
      ) : null}
      {currencies[Field.INPUT] && currencies[Field.OUTPUT] && (
        <BottomGrouping>
          {!webSocketConnected ? (
            <GreyCard style={{ textAlign: 'center' }}>
              <TYPE.main fontSize={20} fontWeight={700}>
                Server Disconnected
              </TYPE.main>
            </GreyCard>
          ) : swapIsUnsupported ? (
            <StyledButtonYellow disabled={true}>
              <TYPE.main mb="4px">Unsupported Asset</TYPE.main>
            </StyledButtonYellow>
          ) : !account ? (
            <StyledButtonYellow disabled={false} onClick={toggleWalletModal}>
              Connect Wallet
            </StyledButtonYellow>
          ) : showWrap ? (
            <StyledButtonYellow disabled={Boolean(wrapInputError)} onClick={onWrap}>
              <Text fontSize={20} fontWeight={700}>
                {wrapInputError ??
                  (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
              </Text>
            </StyledButtonYellow>
          ) : noRoute && userHasSpecifiedInputOutput && !swapMinAmountError ? (
            <GreyCard style={{ textAlign: 'center' }}>
              <TYPE.main mb="4px">Insufficient liquidity for this trade.</TYPE.main>
              {singleHopOnly && <TYPE.main mb="4px">Try enabling multi-hop trades.</TYPE.main>}
            </GreyCard>
          ) : (
            <StyledButtonError
              onClick={handleSwapIntent}
              id="swap-button"
              disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
            >
              <Text fontSize={20} fontWeight={700}>
                {swapInputError
                  ? swapInputError
                  : priceImpactSeverity > 3 && !isExpertMode
                  ? `Price Impact Too High`
                  : `Swap`}
              </Text>
            </StyledButtonError>
          )}
          {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
        </BottomGrouping>
      )}
    </>
  )
}
