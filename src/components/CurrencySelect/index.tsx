import { Currency } from '@alchemist-coin/mistx-core'
import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import tokenHandSvg from '../../assets/svg/token_hand.svg'

const TokenSelectButton = styled.button`
  align-items: center;
  background-color: ${({ theme }) => theme.yellow1};
  border: 1px solid ${({ theme }) => theme.bg2};
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  font-weight: 700;
  font-size: 1.1rem;
  height: 4.5rem;
  justify-content: space-between;
  width: 100%;
  padding: 0 1rem;

  :hover {
    background-color: ${({ theme }) => darken(0.05, theme.yellow1)};
  }
`

const TokenHandImage = styled.img`
  height: 1.5rem;
  margin-right: 1rem;
`

const DownArrow = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 100%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
`

const StyledDropDown = styled(DropDown)`
  display: flex;
  width: 10px;
  height: auto;

  path {
    stroke: ${({ theme }) => theme.text5};
    stroke-width: 2.5px;
  }
`

const TokenSelectButtonWrapper = styled.div`
  display: flex;
`
interface CurrencySelectProps {
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  otherCurrency?: Currency | null
  showCommonBases?: boolean
}

export default function CurrencySelect({
  onCurrencySelect,
  currency,
  otherCurrency,
  showCommonBases
}: CurrencySelectProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <>
      <TokenSelectButton
        className="open-currency-select-button"
        onClick={() => {
          setModalOpen(true)
        }}
      >
        <TokenSelectButtonWrapper>
          <TokenHandImage width="24px" height="24px" src={tokenHandSvg} />
          Select a Token first
        </TokenSelectButtonWrapper>
        <DownArrow>
          <StyledDropDown />
        </DownArrow>
      </TokenSelectButton>
      {onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
        />
      )}
    </>
  )
}
