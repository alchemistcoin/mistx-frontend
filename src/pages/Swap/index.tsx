import React, { Suspense, useCallback, useContext, useMemo, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { CurrencyAmount, JSBI, Token, Trade, WETH, Currency, TradeType } from '@alchemistcoin/sdk'
import { Web3Provider } from '@ethersproject/providers'
// components
import AppBody from '../AppBody'
import AddressInputPanel from '../../components/AddressInputPanel'
import { ArrowDownCircled } from 'components/Icons'
import { AutoRow } from '../../components/Row'
import { ButtonError } from '../../components/Button'
// import { ClickableText } from './styleds'
import { GreyCard } from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import CurrencySelect from 'components/CurrencySelect'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import TransactionDiagnosis from 'components/TransactionDiagnosis'
// import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import {
  ArrowWrapper,
  BottomGrouping,
  PendingHeader,
  PendingWrapper,
  RelativeWrapper,
  SwapCallbackError,
  Wrapper,
  FeeWrapper,
  FeeInnerLeft,
  FeeInnerRight
} from '../../components/swap/styleds'
import QuestionHelper from '../../components/QuestionHelper'
// import TradePrice from '../../components/swap/TradePrice'
// import ProgressSteps from '../../components/ProgressSteps'
import SwapHeader from '../../components/swap/SwapHeader'
// hooks
import { useActiveWeb3React } from '../../hooks'
import { useCurrency, useAllTokens } from '../../hooks/Tokens'
import useUSDCPrice from '../../hooks/useUSDCPrice'
// import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import useENSAddress from '../../hooks/useENSAddress'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useSocketStatus, useWalletModalToggle } from '../../state/application/hooks'
import { useIsTransactionUnsupported } from 'hooks/Trades'
// state
import { Field } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState
} from '../../state/swap/hooks'
import {
  useExpertModeManager,
  useUserSlippageTolerance,
  // useUserTransactionTTL,
  useUserSingleHopOnly
} from '../../state/user/hooks'
import { useHasPendingTransactions } from 'state/transactions/hooks'
// constants
// import { INITIAL_ALLOWED_SLIPPAGE } from '../../constants'
// utils
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
// theme
import { darken } from 'polished'
import { LinkStyledButton, TYPE } from '../../theme'
import FATHOM_GOALS from '../../constants/fathom'

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

  svg path {
    fill: ${({ theme }) => (theme.darkMode ? theme.yellow1 : theme.bg6)};
  }
`

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

const StyledButtonYellow = styled(StyledButtonError)`
  font-size: 20px;
  font-weight: 700;
`

// Lazy Load
const NetworkWarningModal = React.lazy(() => import('components/NetworkWarningModal'))
const TokenWarningModal = React.lazy(() => import('components/TokenWarningModal'))
const ConfirmInfoModal = React.lazy(() => import('components/swap/ConfirmInfoModal'))
const ConfirmSwapModal = React.lazy(() => import('components/swap/ConfirmSwapModal'))
const HardwareWalletModal = React.lazy(() => import('components/HardwareWalletModal'))

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

  // Server Connection Status
  const webSocketConnected = useSocketStatus()

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // for expert mode
  // const toggleSettings = useToggleSettingsMenu()
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()

  // get user transaction deadline TTL, in minutes
  // const [transactionTTL] = useUserTransactionTTL()

  // ETH/USDC Price
  const ethUSDCPrice = useUSDCPrice(WETH[1])

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    v2Trade,
    currencyBalances,
    parsedAmount,
    // minTradeAmounts,
    currencies,
    inputError: swapInputError,
    minAmountError: swapMinAmountError
  } = useDerivedSwapInfo()
  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const { address: recipientAddress } = useENSAddress(recipient)

  const trade = showWrap ? undefined : v2Trade

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
      }

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const isValid = !swapInputError
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

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

  // Modals
  const [showInfoModal, setShowInfoModal] = useState(false)
  const handleInfoModalDismiss = () => setShowInfoModal(false)

  const displayConfirmModal = () => {
    setShowInfoModal(false)
    setShowConfirmModal(true)
  }

  const hideWarningModalPerference =
    !(library as Web3Provider).provider.isMetaMask || localStorage.getItem('hideWarningModal')

  // const handleInfoModalContinue = () => {
  //   setShowInfoModal(false);
  //   setSwapState({
  //     tradeToConfirm: trade,
  //     attemptingTxn: false,
  //     swapErrorMessage: undefined,
  //     txHash: undefined
  //   })
  // };

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
  }

  const route = trade?.route
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )
  const noRoute = !route

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

  const maxAmountInput: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalances[Field.INPUT], wrapType)
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    recipient
    //transactionTTL
  )

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const [singleHopOnly] = useUserSingleHopOnly()

  const hasPendingTransactions = useHasPendingTransactions()

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    if (!swapCallback) {
      return
    }
    setSwapState({ tradeToConfirm, swapErrorMessage: undefined, attemptingTxn: true, txHash: undefined })
    swapCallback()
      .then(hash => {
        setShowInfoModal(false)
        setSwapState({ tradeToConfirm, swapErrorMessage: undefined, attemptingTxn: false, txHash: hash })

        ReactGA.event({
          category: 'Swap',
          action:
            recipient === null
              ? 'Swap w/o Send'
              : (recipientAddress ?? recipient) === account
              ? 'Swap w/o Send + recipient'
              : 'Swap w/ Send',
          label: [trade?.inputAmount?.currency?.symbol, trade?.outputAmount?.currency?.symbol, 'v2'].join('/')
        })
        ReactGA.event({
          category: 'Routing',
          action: singleHopOnly ? 'Swap with multihop disabled' : 'Swap with multihop enabled'
        })
        if (window.fathom) {
          window.fathom.trackGoal(FATHOM_GOALS.SWAP_INTENT, 0)
        }
      })
      .catch(error => {
        setShowInfoModal(false)
        setSwapState({
          tradeToConfirm,
          swapErrorMessage: error.message,
          attemptingTxn: false,
          txHash: undefined
        })
      })
  }, [priceImpactWithoutFee, swapCallback, tradeToConfirm, recipient, recipientAddress, account, trade, singleHopOnly])

  // errors
  // const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  // const showApproveFlow =
  //   !swapInputError &&
  //   (approval === ApprovalState.NOT_APPROVED ||
  //     approval === ApprovalState.PENDING ||
  //     (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
  //   !(priceImpactSeverity > 3 && !isExpertMode)

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

  const swapIsUnsupported = useIsTransactionUnsupported(currencies?.INPUT, currencies?.OUTPUT)

  const swapButtonAction = () => {
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

  return (
    <>
      <Suspense fallback={null}>
        <NetworkWarningModal />
        <TokenWarningModal
          isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
          tokens={importTokensNotInDefault}
          onConfirm={handleConfirmTokenWarning}
          onDismiss={handleDismissTokenWarning}
        />
        <ConfirmInfoModal
          isOpen={showInfoModal}
          onDismiss={handleInfoModalDismiss}
          onConfirm={displayConfirmModal}
          trade={trade}
          attemptingTxn={attemptingTxn}
        />
        <ConfirmSwapModal
          isOpen={showConfirmModal}
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
          ethUSDCPrice={ethUSDCPrice}
        />
        <HardwareWalletModal metaMaskConnected={metaMaskConnected} />
      </Suspense>
      {hasPendingTransactions ? (
        <AppBody>
          <PendingHeader>Transaction In Progress</PendingHeader>
          <PendingWrapper>
            <TransactionDiagnosis />
          </PendingWrapper>
        </AppBody>
      ) : (
        <AppBody>
          <SwapHeader />
          <Wrapper id="swap-page">
            <SwapWrapper>
              <AutoColumn>
                <InputWrapper>
                  {currencies[Field.INPUT] ? (
                    <CurrencyInputPanel
                      value={formattedAmounts[Field.INPUT]}
                      showMaxButton={!atMaxAmountInput}
                      currency={currencies[Field.INPUT]}
                      onUserInput={handleTypeInput}
                      onMax={handleMaxInput}
                      onCurrencySelect={handleInputSelect}
                      otherCurrency={currencies[Field.OUTPUT]}
                      type={Field.INPUT}
                      id="swap-currency-input"
                    />
                  ) : (
                    <CurrencySelect onCurrencySelect={handleInputSelect} />
                  )}
                </InputWrapper>
                <StyledAutoRow
                  justify={isExpertMode ? 'space-between' : 'center'}
                  style={{ margin: '0.5rem 0 0.5rem', padding: '0 1rem' }}
                >
                  <ArrowWrapper
                    clickable
                    color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.primary1 : theme.text2}
                    onClick={() => {
                      //setApprovalSubmitted(false) // reset 2 step UI for approvals
                      onSwitchTokens()
                    }}
                  >
                    <ArrowDownCircled data-test="arrow-down" />
                  </ArrowWrapper>
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
                        onUserInput={handleTypeOutput}
                        showMaxButton={false}
                        currency={currencies[Field.OUTPUT]}
                        onCurrencySelect={handleOutputSelect}
                        otherCurrency={currencies[Field.INPUT]}
                        type={Field.OUTPUT}
                        id="swap-currency-output"
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
                      <ArrowWrapper clickable={false}>
                        <ArrowDownCircled data-test="arrow-down" />
                      </ArrowWrapper>
                      <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                        - Remove send
                      </LinkStyledButton>
                    </AutoRow>
                    <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
                  </>
                ) : null}

                {trade && trade.minerBribe ? (
                  <>
                    <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                      <FeeWrapper>
                        <FeeInnerLeft>
                          Transaction fee:
                          <span>
                            {ethUSDCPrice
                              ? `$ ${ethUSDCPrice
                                  .quote(CurrencyAmount.fromRawAmount(WETH[1], trade.minerBribe.quotient))
                                  .toSignificant(4)} (${trade.minerBribe.toSignificant(2)} ETH)`
                              : `${trade.minerBribe.toSignificant(2)} ETH`}
                          </span>
                        </FeeInnerLeft>
                        <FeeInnerRight>
                          <QuestionHelper text="A tip for the miner to accept the transaction. You can change this in the settings." />
                        </FeeInnerRight>
                      </FeeWrapper>
                    </AutoRow>
                  </>
                ) : null}

                {/* showWrap
                     ? null
                     : (
                     <Card padding={showWrap ? '.25rem 1rem 0 1rem' : '0px'} borderRadius={'20px'}>
                       <AutoColumn gap="8px" style={{ padding: '0 16px' }}>
                         {Boolean(trade) && (
                           <RowBetween align="center">
                             <Text fontWeight={500} fontSize={14} color={theme.text2}>
                               Price
                             </Text>
                             <TradePrice
                               price={trade?.executionPrice}
                               showInverted={showInverted}
                               setShowInverted={setShowInverted}
                             />
                           </RowBetween>
                         )}
                         {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
                           <RowBetween align="center">
                             <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                               Slippage Tolerance
                             </ClickableText>
                             <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                               {allowedSlippage / 100}%
                             </ClickableText>
                           </RowBetween>
                         )}
                       </AutoColumn>
                     </Card>
                   )*/}
              </AutoColumn>

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
                      onClick={swapButtonAction}
                      id="swap-button"
                      disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                      error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
                    >
                      <Text fontSize={20} fontWeight={700}>
                        {swapInputError
                          ? swapInputError
                          : priceImpactSeverity > 3 && !isExpertMode
                          ? `Price Impact Too High`
                          : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                      </Text>
                    </StyledButtonError>
                  )}
                  {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}

                </BottomGrouping>
              )}
            </SwapWrapper>
          </Wrapper>
        </AppBody>
      )}
      {!swapIsUnsupported ? null : ( // <AdvancedSwapDetailsDropdown trade={trade} /> // todo: decide what to do with extra details
        <UnsupportedCurrencyFooter show={swapIsUnsupported} currencies={[currencies.INPUT, currencies.OUTPUT]} />
      )}
    </>
  )
}
