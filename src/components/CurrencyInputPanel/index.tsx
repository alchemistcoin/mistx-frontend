import { Currency, Pair, Token } from '@alchemistcoin/sdk'
import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { darken, lighten } from 'polished'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween } from '../Row'
import { TYPE, ExternalLink } from '../../theme'
import { Input as NumericalInput } from '../NumericalInput'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import { useActiveWeb3React } from '../../hooks'
import { ArrowIcon } from '../Icons'
import Balance from 'components/swap/Balance'
import { Field } from '../../state/swap/actions'
import { useTranslation } from 'react-i18next'
import useTheme from '../../hooks/useTheme'

const InputRow = styled.div<{
  selected: boolean
  value: string
}>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  flex: ${({ value }) => (value.length > 0 ? 20 : 6)};
`

const CurrencySelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  // margin: 1.5rem 0 0 0;
  position: relative;
  z-index: 1;
`

const CurrencySelect = styled.button<{ selected: boolean }>`
  align-items: center;
  background-color: ${({ selected, theme }) => (selected ? lighten(0.1, theme.bg6) : lighten(0.1, theme.bg6))};
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
    background-color: ${({ selected, theme }) => (selected ? lighten(0.15, theme.bg6) : lighten(0.15, theme.bg6))};
  }
`

const CurrencyDisplay = styled.div`
  display: flex;
  width: 100%;
  flex-grow: 1;
  color: ${({ theme }) => theme.text1};
`

const StyledExternalLink = styled(ExternalLink)`
  display: flex;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text5};
  font-size: 1rem;
  font-weight: 500;

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.2, theme.text5)};
    text-decoration: none;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `}
`

export const StyledExternalWrapper = styled.div`
  display: flex;
  width: 100%;
  padding-left: 0.15rem;
  margin: 0.5rem 0 0 0;
  color: ${({ theme }) => theme.text1};
`

export const StyledExternalLinkEl = styled.span`
  display: flex;
  margin: 0.25rem 0 0 0.5rem;
  color: ${({ theme }) => theme.text1};

  svg {
    path {
      stroke: ${({ theme }) => (theme.darkMode ? theme.white : theme.text1)};
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

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.5rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  }
`

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '0')};
  position: relative;
  z-index: 1;
`

const Container = styled.div<{ hideInput: boolean }>`
  align-items: baseline;
  // border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
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

const StyledNumericalInput = styled(NumericalInput)`
  height: 2.2rem;
  padding-left: 0.25rem;
`
interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
  customBalanceText?: string
  type: Field
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  showCommonBases,
  customBalanceText,
  type
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
              {currency && showMaxButton && type === Field.INPUT && (
                <StyledBalanceMax onClick={onMax}>MAX</StyledBalanceMax>
              )}
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
      <Container hideInput={hideInput}>
        <CurrencySelectWrapper>
          <CurrencySelect
            selected={!!currency}
            className="open-currency-select-button"
            onClick={() => {
              if (!disableCurrencySelect) {
                setModalOpen(true)
              }
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
              {!disableCurrencySelect && <StyledDropDown selected={!!currency} />}
            </Aligner>
          </CurrencySelect>
          <CurrencyDisplay>
            {currency && currency instanceof Token ? (
              <StyledExternalLink id={`stake-nav-link`} href={`https://etherscan.io/address/${currency.address}`}>
                <StyledExternalWrapper>
                  {(currency && currency.symbol && currency.symbol.length > 20
                    ? currency.symbol.slice(0, 4) +
                      '...' +
                      currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                    : currency?.symbol) || t('selectToken')}{' '}
                  <StyledExternalLinkEl>
                    <ArrowIcon />
                  </StyledExternalLinkEl>
                </StyledExternalWrapper>
              </StyledExternalLink>
            ) : (
              <StyledExternalWrapper>
                {(currency && currency.symbol && currency.symbol.length > 20
                  ? currency.symbol.slice(0, 4) +
                    '...' +
                    currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                  : currency?.symbol) || t('selectToken')}
              </StyledExternalWrapper>
            )}
          </CurrencyDisplay>
        </CurrencySelectWrapper>
        <InputRow style={hideInput ? { padding: '0' } : {}} selected={disableCurrencySelect} value={value}>
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
      </Container>
      {account && <Balance currency={currency} onMax={onMax} showMaxButton={type === Field.INPUT} />}
      {!disableCurrencySelect && onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
        />
      )}
    </InputPanel>
  )
}
