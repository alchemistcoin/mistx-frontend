import React from 'react'
import styled, { css } from 'styled-components'
import Balance from './Balance'
import Transactions from './transactions'
import { useActiveWeb3React } from '../../hooks'
import { StyledHeading } from './styled'
import { CloseIcon } from '../../theme'
import { useSideBarOpen } from '../../state/application/hooks'

const Container = styled.div<{ open?: boolean }>`
  position: fixed;
  display: flex;
  flex-direction: column;
  outline: transparent solid 2px;
  outline-offset: 2px;
  max-height: 100vh;
  background: #2a3645;
  color: inherit;
  width: 340px;
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
  padding: 40px 20px 20px;

  p {
    margin-top: 0;
  }
`

const StyledClose = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  svg {
    display: flex;
    position: relative;
    top: 10px;
  }
`
export interface SideBarProps {
  open: boolean
  toggleSideBar: any
}

export default function SideBar() {
  const { chainId, account } = useActiveWeb3React()
  const { toggleSideBar, sideBarOpen } = useSideBarOpen()
  return (
    <Container open={sideBarOpen}>
      <Wrapper>
        <StyledClose>
          <CloseIcon onClick={toggleSideBar} />
        </StyledClose>
        <StyledHeading>
          <h3>Balances</h3>
        </StyledHeading>
        {account ? <Balance chainId={chainId} account={account} /> : <p>Connect a wallet</p>}
        <Transactions />
      </Wrapper>
    </Container>
  )
}
