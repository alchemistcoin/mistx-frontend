import React from 'react'
import styled from 'styled-components'
import { ExternalLink } from '../../theme'
// components
import GasTracker from '../Header/GasTracker'
import Polling from 'components/Header/Polling'
import ConnectionStatus from 'components/ConnectionStatus'

const FooterFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  bottom: 10px;
  padding: 1rem;
  padding-right: 100px; /* to account for chat widget */
  width: 100%;
  z-index: 0;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    bottom: 75px;
    padding: .5rem 0;
    padding-right: 1.25rem
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    align-items: flex-end;
    padding: 0 1rem;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    position: relative;
  `};
`

const ConnectionsWrapper = styled.div`
  align-items: center;
  display: grid;
  grid-auto-flow: column;
  column-gap: 1.5rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    align-items: end;
    column-gap: 0;
    grid-auto-flow: row;
    justify-items: end;
    margin-bottom: .5rem;
    row-gap: .5rem;
  `};
`

const Row = styled.div`
  align-items: center;
  display: flex;
  padding: 0;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    align-items: flex-start;
    flex-direction: column;
    margin-bottom: .325rem;
  `};
`

const Link = styled(ExternalLink)`
  opacity: 0.6;
  margin-left: 30px;
  font-weight: 400;

  &:hover {
    opacity: 1;
    text-decoration: none;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: .875rem;
    margin-left: 0rem;
  `};
`

const StyledGasTracker = styled(GasTracker)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`

export default function Footer({ style }: { style?: object }) {
  return (
    <FooterFrame style={style}>
      <Row>
        <Link href="https://docs.alchemist.wtf/mistx" title="Docs">
          Docs
        </Link>
        <Link href="https://dune.xyz/alchemistcoin/MistX-Dashboard" title="Analytics">
          Analytics
        </Link>
        <Link href="https://discord.com/invite/alchemist" title="Discord">
          Discord
        </Link>
      </Row>
      <ConnectionsWrapper>
        <StyledGasTracker />
        <Polling />
        <ConnectionStatus />
      </ConnectionsWrapper>
    </FooterFrame>
  )
}
