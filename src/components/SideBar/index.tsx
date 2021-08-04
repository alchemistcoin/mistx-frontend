import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { darken, rem } from 'polished'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'
import { useAllTransactions } from '../../state/transactions/hooks'
import Transactions from './transactions'

const Container = styled.div<{ open?: boolean }>`
  position: fixed;
  display: flex;
  flex-direction: column;
  outline: transparent solid 2px;
  outline-offset: 2px;
  /* z-index: var(--chakra-zIndices-modal); */
  max-height: 100vh;
  background: #2a3645;
  color: inherit;
  /* box-shadow: var(--chakra-shadows-dark-lg);
  max-width: var(--chakra-sizes-xs); */
  // right: 0px;
  width: 320px;
  left: 100%;
  top: 0px;
  bottom: 0px;
  transition: transform 0.25s ease;
  will-change: transform;
  // transform: translateX(-100%);
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
  height: 100%;
  width: 100%;
  padding: 20px 0;
`

export interface SideBarProps {
  open: boolean
  toggleSideBar: any
}

export default function SideBar({ open }: SideBarProps) {
  const allTransactions = useAllTransactions()
  console.log('allTransactions', allTransactions)
  return (
    <Container open={open}>
      <Wrapper>
        <Transactions transactions={allTransactions} />
      </Wrapper>
    </Container>
  )
}

