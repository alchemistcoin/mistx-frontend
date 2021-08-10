import { Currency } from '@alchemist-coin/mistx-core'
import React from 'react'
import { darken, transparentize } from 'polished'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import styled from 'styled-components'

const StyledLabelWrapper = styled.div`
  color: ${({ theme }) => theme.text1}
  display: flex;
  flex-direction: row;
  font-size: 1rem;
  width: 100%;
  position: relative;
  align-items: center;
  justify-content: space-between;
  position: relative;
`

const StyledLabel = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  line-height: 1.4em;
  color: ${({ theme }) => theme.text4};
`

const StyledBalanceMax = styled.button`
  display: flex;
  padding: 0.35rem 0.35rem;
  background: ${({ theme }) => transparentize(0.9, theme.primary2)};
  border: 1px solid ${({ theme }) => theme.primary2};
  border-radius: 8px;
  color: ${({ theme }) => theme.primary2};
  cursor: pointer;
  font-size: 0.875rem;
  line-height: 1;
  font-weight: 400;
  justify-content: center;

  :hover,
  :focus {
    border: 1px solid ${({ theme }) => darken(0.1, theme.primary2)};
    color: ${({ theme }) => darken(0.1, theme.primary2)};
    outline: none;
  }
`

const StyledBalanceLabel = styled.div`
  font-weight: 400;
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.text3};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    overflow: hidden;
    width: 24px;
  `};
`

const StyledBalance = styled.div`
  color: ${({ theme }) => theme.text1}
  display: flex;
  font-weight: 400;
  justify-content: flex-end;
`

const StyledBalanceAmount = styled.span`
  text-overflow: ellipsis;
  overflow: hidden;
`
interface SwapLabelProps {
  onMax?: () => void
  showMaxButton: boolean
  currency?: Currency | null
}

export default function Balance({ currency, onMax, showMaxButton }: SwapLabelProps) {
  const { account } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  return (
    <StyledLabelWrapper>
      {account && currency && (
        <StyledLabel>
          <StyledBalanceLabel>Balance</StyledBalanceLabel>
          <StyledBalance>
            {selectedCurrencyBalance ? (
              <StyledBalanceAmount>{selectedCurrencyBalance?.toSignificant(6)}</StyledBalanceAmount>
            ) : (
              <StyledBalanceAmount>0</StyledBalanceAmount>
            )}
          </StyledBalance>
        </StyledLabel>
      )}
      {account && currency && showMaxButton && <StyledBalanceMax onClick={onMax}>max</StyledBalanceMax>}
    </StyledLabelWrapper>
  )
}
