import { Currency } from '@alchemistcoin/sdk'
import React from 'react'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import styled from 'styled-components'

const StyledLabelWrapper = styled.div<{
  placement: 'left' | 'right'
}>`
  background-color: ${({ theme }) => theme.bg6}
  border-radius: 1rem;
  color: ${({ theme }) => theme.text2}
  display: flex;
  flex-direction: column;
  font-size: .9375rem;
  justify-content: center;
  height: 100%;
  left: ${({ placement }) => placement === 'left' && 0};
  padding: 1rem;
  position: absolute;
  right: ${({ placement }) => placement === 'right' && 0};
  top: 0;
  transform: translateX(${({ placement }) => (placement === 'right' ? '100%' : '-100%')});
  width: 140px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const StyledLabel = styled.div`
  line-height: 1.4em;
  margin-bottom: 0.75rem;
  text-align: right;
`

const StyledBalanceMax = styled.button`
  height: 28px;
  background-color: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.yellow1};
  border-radius: 14px;
  color: ${({ theme }) => theme.yellow1};
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;

  :hover,
  :focus {
    border: 1px solid ${({ theme }) => theme.primary1};
    color: ${({ theme }) => theme.primary1};
    outline: none;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall``};
`

const StyledBalanceLabel = styled.div`
  font-weight: 300;
`

const StyledBalance = styled.div`
  color: ${({ theme }) => theme.text1}
  display: flex;
  font-weight: 700;
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
  placement: 'right' | 'left'
  id: string
  showCommonBases?: boolean
  customBalanceText?: string
}

export default function SwapLabel({ currency, onMax, placement, showMaxButton }: SwapLabelProps) {
  const { account } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  return (
    <StyledLabelWrapper placement={placement}>
      {account && currency && (
        <StyledLabel>
          <StyledBalanceLabel>BAL</StyledBalanceLabel>
          <StyledBalance>
            {selectedCurrencyBalance && (
              <StyledBalanceAmount>{selectedCurrencyBalance?.toSignificant(6)}</StyledBalanceAmount>
            )}
            &nbsp;{currency.symbol}
          </StyledBalance>
        </StyledLabel>
      )}
      {account && currency && showMaxButton && <StyledBalanceMax onClick={onMax}>USE MAX</StyledBalanceMax>}
    </StyledLabelWrapper>
  )
}
