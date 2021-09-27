import React, { Suspense, useCallback, useContext, useMemo, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import styled, { ThemeContext } from 'styled-components'
import { CurrencyAmount, Token, Trade, Currency, TradeType } from '@alchemist-coin/mistx-core'
import { Web3Provider } from '@ethersproject/providers'
// components
import AppBody from '../AppBody'
import AddressInputPanel from '../../components/AddressInputPanel'
import { ArrowDownCircled } from 'components/Icons'
import { AutoRow } from '../../components/Row'
// import { ClickableText } from './styleds'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import CurrencySelect from 'components/CurrencySelect'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import TransactionDiagnosis from 'components/TransactionDiagnosis'
// import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import { ArrowWrapper, PendingHeader, PendingWrapper, RelativeWrapper, Wrapper } from '../../components/swap/styleds'
// import QuestionHelper from '../../components/QuestionHelper'
// import TradePrice from '../../components/swap/TradePrice'
// import ProgressSteps from '../../components/ProgressSteps'
import SwapHeader from '../../components/swap/SwapHeader'
// hooks
import { useActiveWeb3React } from '../../hooks'
import { useCurrency, useAllTokens } from '../../hooks/Tokens'
// import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
// state
import { Field } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState
} from '../../state/swap/hooks'
import { useExpertModeManager, useUserSlippageTolerance } from '../../state/user/hooks'
import { useHasPendingTransactions } from 'state/transactions/hooks'
import { useTransactionErrorModalOpen } from 'state/application/hooks'
// constants
// import { INITIAL_ALLOWED_SLIPPAGE } from '../../constants'
// utils
import { MaxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown } from '../../utils/prices'
// theme
import { LinkStyledButton } from '../../theme'
import FATHOM_GOALS from '../../constants/fathom'
import SwapFooter from '../../components/swap/SwapFooter'

const SwapWrapper = styled.div`
  background: #2a3645;
  border-radius: 24px;
`

const InputWrapper = styled.div`
  padding: 1.5rem 1rem;
`

const OutputWrapper = styled.div`
  padding: 1rem;
`

const SelectWrapper = styled.div`
  padding: 1rem;
`
const StyledAutoRow = styled(AutoRow)`
  position: relative;

  &:before {
    content: '';
    z-index: 2;
    position: absolute;
    top: 50%;
    width: auto;
    right: 1rem;
    left: 1rem;
    height: 1px;
    background: ${({ theme }) => theme.border2};
  }

  > * {
    z-index: 3;
  }
`

const StyledArrowWrapper = styled(ArrowWrapper)`
  align-items: center;

  > svg {
    fill: ${({ theme }) => (theme.darkMode ? theme.yellow1 : theme.bg6)};
  }
`

// Lazy Load
const NetworkWarningModal = React.lazy(() => import('components/NetworkWarningModal'))
const TokenWarningModal = React.lazy(() => import('components/TokenWarningModal'))
const ConfirmInfoModal = React.lazy(() => import('components/swap/ConfirmInfoModal'))
const ConfirmSwapModal = React.lazy(() => import('components/swap/ConfirmSwapModal'))
const HardwareWalletModal = React.lazy(() => import('components/HardwareWalletModal'))
const TransactionErrorModal = React.lazy(() => import('components/TransactionErrorModal'))

export default function Swap({ history }: RouteComponentProps) {
  const loadedUrlParams = useDefaultsFromURLSearch()

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId)
  ]
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !Boolean(token.address in defaultTokens)
    })

  const { account, library } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  // Check if a metamask account is connected
  const metaMaskConnected: any = account && account?.length > 0 && library?.connection.url === 'metamask'

  // for expert mode
  // const toggleSettings = useToggleSettingsMenu()
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    v2Trade,
    currencyBalances,
    parsedAmount,
    // minTradeAmounts,
    currencies,
    rawAmount
  } = useDerivedSwapInfo()
  const { wrapType } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE

  const trade = showWrap ? undefined : v2Trade

  const parsedAmounts = useMemo(
    () =>
      showWrap
        ? {
            [Field.INPUT]: parsedAmount,
            [Field.OUTPUT]: parsedAmount
          }
        : {
            [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
            [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
          },
    [independentField, parsedAmount, showWrap, trade]
  )

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
    history.push('/exchange/')
  }, [history])

  // modal and loading
  const [{ tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    tradeToConfirm: Trade<Currency, Currency, TradeType> | undefined
    swapErrorMessage: string | undefined
    attemptingTxn: boolean
    txHash: string | undefined
  }>({
    tradeToConfirm: undefined,
    swapErrorMessage: undefined,
    attemptingTxn: false,
    txHash: undefined
  })
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false)
  const transactionErrorModalOpen = useTransactionErrorModalOpen()
  const [showInfoModal, setShowInfoModal] = useState(false)
  const handleInfoModalDismiss = () => setShowInfoModal(false)

  const displayConfirmModal = () => {
    setShowInfoModal(false)
    setShowConfirmModal(true)
  }

  const hideWarningModalPerference =
    !(library as Web3Provider).provider.isMetaMask || localStorage.getItem('hideWarningModal')

  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: showWrap
        ? parsedAmounts[independentField]?.toExact() ?? ''
        : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
    }),
    [independentField, dependentField, showWrap, typedValue, parsedAmounts]
  )

  // check whether the user has approved the router on the input token
  // const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  // const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  // useEffect(() => {
  //   if (approval === ApprovalState.PENDING) {
  //     setApprovalSubmitted(true)
  //   }
  // }, [approval, approvalSubmitted])

  const maxAmountInput: CurrencyAmount<Currency> | undefined = MaxAmountSpend(currencyBalances[Field.INPUT], wrapType, trade)
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    recipient
    //transactionTTL
  )

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )

  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const hasPendingTransactions = useHasPendingTransactions()

  const handleSwap = useCallback(async () => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) return
    if (!swapCallback) return

    setSwapState({ tradeToConfirm, swapErrorMessage: undefined, attemptingTxn: true, txHash: undefined })

    try {
      const hash = await swapCallback()

      setShowInfoModal(false)
      setShowConfirmModal(false)
      setSwapState({ tradeToConfirm, swapErrorMessage: undefined, attemptingTxn: false, txHash: hash })

      if (window.fathom) {
        window.fathom.trackGoal(FATHOM_GOALS.SWAP_INTENT, 0)
      }
    } catch (error) {
      setShowInfoModal(false)
      setSwapState({
        tradeToConfirm,
        swapErrorMessage: error.message,
        attemptingTxn: false,
        txHash: undefined
      })
    }
  }, [priceImpactWithoutFee, swapCallback, tradeToConfirm])

  const handleConfirmDismiss = useCallback(() => {
    setShowConfirmModal(false)
    setSwapState({ tradeToConfirm, attemptingTxn, swapErrorMessage: undefined, txHash: undefined })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, attemptingTxn, txHash })
  }, [attemptingTxn, swapErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    inputCurrency => {
      //setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  const handleOutputSelect = useCallback(outputCurrency => onCurrencySelection(Field.OUTPUT, outputCurrency), [
    onCurrencySelection
  ])

  const onSwapIntent = () => {
    if (!hideWarningModalPerference) {
      setShowInfoModal(true)
    } else {
      setShowConfirmModal(true)
    }
    // if (isExpertMode) {
    //   handleSwap()
    // } else {
    //   if (hideWarningModalPerference) {
    //     setShowConfirmModal(true)
    //   } else {
    //     setSwapState({
    //       tradeToConfirm: trade,
    //       swapErrorMessage: undefined,
    //       attemptingTxn: false,
    //       txHash: undefined
    //     })
    //     setShowConfirmModal(true)
    //   }
    // }
  }

  // console.log('-------------------')
  // console.log('price impact', trade?.priceImpact.toSignificant(6))
  // console.log('miner bribe', trade?.minerBribe.toSignificant(6))
  // console.log('input amount', trade?.inputAmount.toSignificant(6))
  // console.log('output amount', trade?.outputAmount.toSignificant(6))
  // console.log('execution price', trade?.executionPrice.toSignificant(6))
  // console.log('mid price', trade?.nextMidPrice.toSignificant(6))
  // console.log('path', trade?.route.path)
  // console.log('min amounts', minTradeAmounts)
  // console.log('min trade amount', minTradeAmounts[0]?.[0].toExact())
  // console.log('trade', trade)

  // const bribeEstimate = useMinerBribeEstimate()
  // console.log(
  //   'bribe estimate min/max',
  //   bribeEstimate?.minBribe.toSignificant(6),
  //   bribeEstimate?.maxBribe.toSignificant(6)
  // )

  const showTokenWarningModal = importTokensNotInDefault.length > 0 && !dismissTokenWarning

  return (
    <>
      <Suspense fallback={null}>
        <NetworkWarningModal />
        {showTokenWarningModal && (
          <TokenWarningModal
            tokens={importTokensNotInDefault}
            onConfirm={handleConfirmTokenWarning}
            onDismiss={handleDismissTokenWarning}
          />
        )}
        {showInfoModal && (
          <ConfirmInfoModal
            onDismiss={handleInfoModalDismiss}
            onConfirm={displayConfirmModal}
            trade={trade}
            attemptingTxn={attemptingTxn}
          />
        )}
        {showConfirmModal && (
          <ConfirmSwapModal
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
          />
        )}
        <HardwareWalletModal metaMaskConnected={metaMaskConnected} />
        {transactionErrorModalOpen && <TransactionErrorModal />}
      </Suspense>
      {hasPendingTransactions ? (
        <AppBody>
          <PendingHeader>Transaction In Progress</PendingHeader>
          <PendingWrapper>
            <TransactionDiagnosis />
          </PendingWrapper>
        </AppBody>
      ) : (
        <>
          <AppBody>
            <SwapHeader />
            <Wrapper id="swap-page">
              <SwapWrapper>
                <InputWrapper>
                  {currencies[Field.INPUT] ? (
                    <CurrencyInputPanel
                      value={formattedAmounts[Field.INPUT]}
                      rawValue={rawAmount?.toSignificant(6) || ''}
                      showMaxButton={!atMaxAmountInput}
                      currency={currencies[Field.INPUT]}
                      onUserInput={handleTypeInput}
                      onMax={handleMaxInput}
                      onCurrencySelect={handleInputSelect}
                      otherCurrency={currencies[Field.OUTPUT]}
                      type={Field.INPUT}
                      id="swap-currency-input"
                      isDependent={dependentField === Field.INPUT}
                    />
                  ) : (
                    <CurrencySelect onCurrencySelect={handleInputSelect} />
                  )}
                </InputWrapper>
                <StyledAutoRow
                  justify={isExpertMode ? 'space-between' : 'center'}
                  style={{ margin: '0.5rem 0 0.5rem', padding: '0 1rem' }}
                >
                  <StyledArrowWrapper
                    clickable
                    color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.primary1 : theme.text2}
                    onClick={() => {
                      //setApprovalSubmitted(false) // reset 2 step UI for approvals
                      onSwitchTokens()
                    }}
                  >
                    <ArrowDownCircled data-test="arrow-down" />
                  </StyledArrowWrapper>
                  {recipient === null && !showWrap && isExpertMode ? (
                    <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                      + Add a send (optional)
                    </LinkStyledButton>
                  ) : null}
                </StyledAutoRow>
                {currencies[Field.OUTPUT] ? (
                  <OutputWrapper>
                    <RelativeWrapper>
                      <CurrencyInputPanel
                        value={formattedAmounts[Field.OUTPUT]}
                        rawValue={rawAmount?.toSignificant(6) || ''}
                        onUserInput={handleTypeOutput}
                        showMaxButton={false}
                        currency={currencies[Field.OUTPUT]}
                        onCurrencySelect={handleOutputSelect}
                        otherCurrency={currencies[Field.INPUT]}
                        type={Field.OUTPUT}
                        id="swap-currency-output"
                        isDependent={dependentField === Field.OUTPUT}
                      />
                    </RelativeWrapper>
                  </OutputWrapper>
                ) : (
                  <SelectWrapper>
                    <CurrencySelect onCurrencySelect={handleOutputSelect} />
                  </SelectWrapper>
                )}

                {recipient !== null && !showWrap ? (
                  <>
                    <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                      <StyledArrowWrapper clickable={false}>
                        <ArrowDownCircled data-test="arrow-down" />
                      </StyledArrowWrapper>
                      <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                        - Remove send
                      </LinkStyledButton>
                    </AutoRow>
                    <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
                  </>
                ) : null}
                <SwapFooter
                  onSwapIntent={onSwapIntent}
                  parsedAmounts={parsedAmounts}
                  swapCallbackError={swapCallbackError}
                  swapErrorMessage={swapErrorMessage}
                  trade={trade}
                />
              </SwapWrapper>
            </Wrapper>
          </AppBody>
        </>
      )}
      <UnsupportedCurrencyFooter currencies={[currencies.INPUT, currencies.OUTPUT]} />
    </>
  )
}
