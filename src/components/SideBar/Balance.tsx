import React from 'react'
import styled from 'styled-components'
import { Ether } from '@alchemist-coin/mistx-core'
import { useMistBalance, useCurrencyBalance } from '../../state/wallet/hooks'

const StyledBalanceWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 20px;
  background: rgb(255 255 255 / 5%);
  border-radius: 18px;
  height: 90px;
`

const StyledBalance = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  width: 50%;

  &:first-child::after {
    content: '';
    position: absolute;
    width: 1px;
    height: 50px;
    background: rgb(170 170 170 / 30%);
    right: 0;
  }

  &:first-child {
    padding-right: 20px;
  }
  &:last-child {
    padding-left: 20px;
  }

  span {
    display: flex;
    width: 100%;
    opacity: 0.8;
    font-size: 16px;
  }
  div {
    display: flex;
    width: 100%;
    font-weight: 700;
  }
`

export interface SideBarProps {
  chainId: any
  account: any
}

export default function Balance({ chainId, account }: SideBarProps) {
  const mistBalance = useMistBalance(true)
  const ethBalance = useCurrencyBalance(account, Ether.onChain(chainId || 1))
  return (
    <StyledBalanceWrapper>
      <StyledBalance>
        <span>MIST</span>
        <div>{mistBalance}</div>
      </StyledBalance>
      <StyledBalance>
        <span>ETH</span>
        <div>{ethBalance?.toSignificant(6)}</div>
      </StyledBalance>
    </StyledBalanceWrapper>
  )
}
