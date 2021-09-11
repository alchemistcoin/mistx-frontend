import React, { Suspense, useState, useCallback } from 'react'
import { Currency, Pair, Token } from '@alchemist-coin/mistx-core'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { darken } from 'polished'
import { Text } from 'rebass'
// hooks
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import { Field } from '../../state/swap/actions'
import useTheme from '../../hooks/useTheme'
// components
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween } from '../Row'
import { TYPE, ExternalLink } from '../../theme'
import { Input as NumericalInput } from '../NumericalInput'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import { ArrowIcon } from '../Icons'
import QuestionHelper from '../QuestionHelper'
import Balance from '../swap/Balance'

function getShortSymbol(symbol: string) {
  return `${symbol.slice(0, 4)}...${symbol.slice(symbol.length - 5, symbol.length)}`
}

const InputRow = styled.div<{
  value: string
}>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  flex: ${({ value }) => (value.length > 0 ? 20 : 6)};
`

const CurrencySelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
`

const CurrencySelect = styled.button<{ selected: boolean }>`
  align-items: center;
  background: transparent;
  border: none;
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.text1)};
  cursor: pointer;
  font-weight: 500;
  height: 4.2rem;
  border-radius: 12px;
  flex: 4;
  outline: none;
  user-select: none;
  padding: 0.5rem 0.5rem;

  :focus,
  :hover {
    background-color: ${({ selected, theme }) => (selected ? '#242d3d' : '#242d3d')};
  }
`

const CurrencyDisplay = styled.div`
  display: flex;
  width: 100%;
  flex-grow: 1;
  color: ${({ theme }) => theme.text1};
  font-weight: 600;
  justify-content: center;
`
export const IconArrowWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 100%;
  border: 1px solid ${({ theme }) => theme.primary2};
  height: 20px;
  width: 20px;
`

const StyledExternalLink = styled(ExternalLink)`
  display: flex;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text5};
  font-size: 1rem;
  font-weight: 600;

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.2, theme.text5)};
    text-decoration: none;

    ${IconArrowWrapper} {
      background: '#242d3d';
    }
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `}
`

const ExecutionPrice = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-right: 0.5rem;
  margin-top: 0.375rem;
  padding: 0 0.75rem;
`

const StyledExternalWrapper = styled.div`
  display: flex;
  margin: 0.65rem 0 0 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text1};

  :hover,
  :focus {
    span div {
      background: '#242d3d';
    }
`

const StyledExternalLinkEl = styled.span`
  display: flex;
  margin: 0 0 0 0.75rem;
  color: ${({ theme }) => theme.text1};

  svg {
    display: flex;
    height: 8px;
    width: auto;
    position: relative;

    path {
      stroke: ${({ theme }) => (theme.darkMode ? theme.primary2 : theme.text1)};
    }
  }
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  display: none;
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem 0 1rem;

  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-direction: row;
  position: relative;
`

const StyledDropDownContainer = styled.div`
  margin: 0 0 0 1rem;
  display: flex;
  border-radius: 100%;
  border: 1px solid ${({ theme }) => theme.primary2};
  height: 20px;
  width: 20px;
  justify-content: center;
`

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  display: flex;
  width: 8px;
  height: auto;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.primary2 : theme.primary2)};
    stroke-width: 1.5px;
  }
`

const InputPanel = styled.div<{ hideInput?: boolean }>`
  position: relative;
  z-index: 1;
`
const InputPanelWapper = styled.div<{ hideInput?: boolean }>`
  width: 100%;
  padding: 0 0 0 20px;
  ${({ theme }) => theme.flexColumnNoWrap}
`
const InputPanelContainer = styled.div<{ hideInput?: boolean }>`
  width: 100%;
  padding: 0.5rem 0.75rem;
  ${({ theme }) => theme.flexColumnNoWrap}
  border-radius: 10px;
  background: #242d3d;
`

const Container = styled.div`
  align-items: center;
  background-color: inherit;
  display: flex;
`

const StyledTokenName = styled.span<{
  active?: boolean
  value: string
}>`
  margin: 0 0.25rem;
  font-size:  ${({ active }) => (active ? '18px' : '16px')};
  right: 4.25rem;
  opacity: ${({ value }) => (value.length > 0 ? 0 : 1)}
  position: absolute;
  transition: opacity .3s, transform .3s;
  ${({ value }) => value.length > 0 && 'transform: translateX(100%);'}
`

const StyledBalanceMax = styled.button`
  background-color: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.yellow1};
  border-radius: 0.5rem;
  color: ${({ theme }) => theme.yellow1};
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  height: 28px;
  margin-right: 0.5rem;

  :hover,
  :focus {
    border: 1px solid ${({ theme }) => theme.primary1};
    color: ${({ theme }) => theme.primary1};
    outline: none;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0.5rem;
  `};
`

const CurrencySearchModal = React.lazy(() => import('../SearchModal/CurrencySearchModal'))

const StyledNumericalInput = styled(NumericalInput)`
  // padding-left: 0.25rem;
`

const StyledQuestionHelper = styled(QuestionHelper)`
  width: 20px;
  margin-left: 10px;
  svg {
    circle,
    path {
      fill: #fff;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`
interface CurrencyInputPanelProps {
  value: string
  rawValue: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  isDependent?: boolean
  showCommonBases?: boolean
  customBalanceText?: string
  type: Field
}

export default function CurrencyInputPanel({
  value,
  rawValue,
  onUserInput,
  onMax,
  showMaxButton,
  onCurrencySelect,
  currency,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  showCommonBases,
  customBalanceText,
  type,
  isDependent
}: CurrencyInputPanelProps) {
  const { t } = useTranslation()

  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const theme = useTheme()

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <InputPanel id={id}>
      {!hideInput && account && (
        <LabelRow>
          <RowBetween>
            <span>
              {/* Max Button */}
              {currency && showMaxButton && type === Field.INPUT && (
                <StyledBalanceMax onClick={onMax}>MAX x</StyledBalanceMax>
              )}
              {/* Currency Balance */}
              <TYPE.body
                onClick={onMax}
                color={theme.text2}
                fontWeight={500}
                fontSize={14}
                style={{ display: 'inline', cursor: 'pointer' }}
              >
                {!hideBalance && !!currency && selectedCurrencyBalance
                  ? (customBalanceText ?? 'Balance: ') + selectedCurrencyBalance?.toSignificant(6)
                  : ' -'}
              </TYPE.body>
            </span>
          </RowBetween>
        </LabelRow>
      )}
      <Container>
        {/* Currency Select Button */}
        <CurrencySelectWrapper>
          <CurrencySelect
            selected={!!currency}
            className="open-currency-select-button"
            onClick={() => {
              setModalOpen(true)
            }}
          >
            <Aligner>
              {pair && (
                <StyledTokenName className="pair-name-container" value={value}>
                  {pair?.token0.symbol}:{pair?.token1.symbol}
                </StyledTokenName>
              )}
              {pair ? (
                <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
              ) : currency ? (
                <CurrencyLogo currency={currency} size={'36px'} />
              ) : null}
              <StyledDropDownContainer>
                <StyledDropDown selected={!!currency} />
              </StyledDropDownContainer>
            </Aligner>
          </CurrencySelect>
          <CurrencyDisplay>
            {currency && currency instanceof Token ? (
              <StyledExternalLink id={`stake-nav-link`} href={`https://etherscan.io/address/${currency.address}`}>
                <StyledExternalWrapper>
                  {(currency?.symbol && currency.symbol.length > 20
                    ? getShortSymbol(currency.symbol)
                    : currency?.symbol) || t('selectToken')}{' '}
                  <StyledExternalLinkEl>
                    <IconArrowWrapper>
                      <ArrowIcon />
                    </IconArrowWrapper>
                  </StyledExternalLinkEl>
                </StyledExternalWrapper>
              </StyledExternalLink>
            ) : (
              <StyledExternalWrapper>
                {(currency?.symbol && currency.symbol.length > 20
                  ? currency.symbol.slice(0, 4) +
                    '...' +
                    currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                  : currency?.symbol) || t('selectToken')}
              </StyledExternalWrapper>
            )}
          </CurrencyDisplay>
        </CurrencySelectWrapper>
        {/* Amount Input */}
        <InputPanelWapper>
          <InputPanelContainer>
            <InputRow style={hideInput ? { padding: '0' } : {}} value={value}>
              {!hideInput && (
                <>
                  <StyledNumericalInput
                    className="token-amount-input"
                    fontSize="2.2rem"
                    value={value}
                    onUserInput={val => {
                      onUserInput(val)
                    }}
                    align="right"
                  />
                </>
              )}
            </InputRow>
            {account && <Balance currency={currency} onMax={onMax} showMaxButton={type === Field.INPUT} />}
          </InputPanelContainer>
          {isDependent && rawValue ? (
            <ExecutionPrice>
              <Text color={theme.text2} fontSize="12px" style={{ display: 'flex', alignItems: 'center' }}>
                {type === Field.INPUT ? 'Amount' : 'Amount'} (excl. fee)
                <StyledQuestionHelper
                  text={`${type === Field.INPUT ? 'Input' : 'Output'} amount without the mistX protection fee.`}
                  small
                />
              </Text>
              <Text fontWeight={600}>&nbsp;{rawValue}</Text>
            </ExecutionPrice>
          ) : null}
        </InputPanelWapper>
      </Container>
      {onCurrencySelect && modalOpen && (
        <Suspense fallback={null}>
          <CurrencySearchModal
            onDismiss={handleDismissSearch}
            onCurrencySelect={onCurrencySelect}
            selectedCurrency={currency}
            otherSelectedCurrency={otherCurrency}
            showCommonBases={showCommonBases}
          />
        </Suspense>
      )}
    </InputPanel>
  )
}
