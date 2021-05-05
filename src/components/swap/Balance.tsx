import { Currency } from '@alchemistcoin/sdk'
import React from 'react'
import { darken } from 'polished'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import styled from 'styled-components'

const StyledLabelWrapper = styled.div`
  color: ${({ theme }) => theme.text1}
  display: flex;
  flex-direction: row;
  font-size: 1rem;
  width: auto;
  position: relative;
  align-items: flex-start;
  justify-content: space-between;
  margin: 0.5rem 0 0;
  width: 100%;

  /* ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `}; */
`

const StyledLabel = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  line-height: 1.4em;
  margin-bottom: 0.75rem;
  color: ${({ theme }) => theme.text4};
`

const StyledBalanceMax = styled.button`
  display: flex;
  width: 5rem;
  height: 28px;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.yellow1};
  border-radius: 14px;
  color: ${({ theme }) => theme.yellow1};
  cursor: pointer;
  font-size: 0.75rem;
  line-height: 2;
  font-weight: 500;
  justify-content: center;

  :hover,
  :focus {
    border: 1px solid ${({ theme }) => darken(0.1, theme.yellow1)};
    color: ${({ theme }) => darken(0.1, theme.yellow1)};
    outline: none;
  }
`

const StyledBalanceLabel = styled.div`
  font-weight: 500;
  margin-right: 0.25rem;
  color: ${({ theme }) => theme.text4}
`

const StyledBalance = styled.div`
  color: ${({ theme }) => theme.text4}
  display: flex;
  font-weight: 500;
  justify-content: flex-end;
`

const StyledBalanceAmount = styled.span`
  text-overflow: ellipsis;
  overflow: hidden;
`

interface SwapLabelProps {
  onMax?: () => void
  showMaxButton: boolean
  label?: string
  currency?: Currency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
  customBalanceText?: string
}

export default function Balance({ currency, onMax, showMaxButton }: SwapLabelProps) {
  const { account } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined);

  return (
    <StyledLabelWrapper>
      {account && currency && (
        <StyledLabel>
          <StyledBalanceLabel>Balance</StyledBalanceLabel>
          <StyledBalance>
            {selectedCurrencyBalance ? (
              <StyledBalanceAmount>{selectedCurrencyBalance?.toSignificant(6)}</StyledBalanceAmount>
            ): (
              <StyledBalanceAmount>0</StyledBalanceAmount>
            )}
          </StyledBalance>
        </StyledLabel>
      )}
      {account && currency && showMaxButton && <StyledBalanceMax onClick={onMax}>USE MAX</StyledBalanceMax>}
    </StyledLabelWrapper>
  )
}
