import React from 'react'
import styled, { css } from 'styled-components'
import Transactions from './transactions'
import { useMistBalance } from '../../state/wallet/hooks'
import { StyledHeading } from './styled'
import { CloseIcon } from '../../theme'

const Container = styled.div<{ open?: boolean }>`
  position: fixed;
  display: flex;
  flex-direction: column;
  outline: transparent solid 2px;
  outline-offset: 2px;
  max-height: 100vh;
  background: #2a3645;
  color: inherit;
  width: 320px;
  left: 100%;
  top: 0px;
  bottom: 0px;
  transition: transform 0.25s ease;
  will-change: transform;
  transform: translateX(0);
  overflow-y: scroll;
  z-index: 9999;

  ${props =>
    props.open
      ? css`
          transform: translateX(-100%);
          box-shadow: -0.125rem 0 5rem 0 rgba(0, 0, 0, 0.6);
        `
      : ``};
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 20px;
`

const StyledBalanceWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  background: rgb(255 255 255 / 5%);
  border-radius: 18px;
  margin-bottom: 20px;
`

export interface SideBarProps {
  open: boolean
  toggleSideBar: any
}

export default function SideBar({ open, toggleSideBar }: SideBarProps) {
  const mistBalance = useMistBalance()
  return (
    <Container open={open}>
      <Wrapper>
        <CloseIcon onClick={toggleSideBar} />
        <StyledHeading>
          <h3>Balances</h3>
        </StyledHeading>
        <StyledBalanceWrapper>{mistBalance} MIST</StyledBalanceWrapper>
        <Transactions />
      </Wrapper>
    </Container>
  )
}
