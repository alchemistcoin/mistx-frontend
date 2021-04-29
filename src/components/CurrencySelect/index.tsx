import { Currency } from '@alchemistcoin/sdk'
import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'

import tokenHandSvg from '../../assets/svg/token_hand.svg'

const TokenSelectButton = styled.button`
  align-items: center;
  background-color: ${({ theme }) => theme.yellow1};
  border: 1px solid ${({ theme }) => theme.bg2};
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  font-weight: 700;
  font-size: 1.25rem;
  height: 110px;
  justify-content: center;
  width: 100%;

  :hover {
    background-color: ${({ theme }) => darken(0.05, theme.yellow1)};
  }
`

const TokenHandImage = styled.img`
  height: 1.875rem;
  margin-right: 1rem;
`

interface CurrencySelectProps {
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  otherCurrency?: Currency | null
  showCommonBases?: boolean
}

export default function CurrencySelect({
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
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
        // selected={!!currency}
        className="open-currency-select-button"
        onClick={() => {
          if (!disableCurrencySelect) {
            setModalOpen(true)
          }
        }}
      >
        <TokenHandImage src={tokenHandSvg} />
        Select a Token
      </TokenSelectButton>
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
    </>
  )
}
