import React from 'react'
import styled from 'styled-components'
import { ExternalLink } from '../../theme'
// components
import Polling from 'components/Header/Polling'
import ConnectionStatus from 'components/ConnectionStatus'

const FooterFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  bottom: 10px;
  padding: 1rem;
  padding-right: 88px; /* to account for chat widget */
  width: 100%;
  z-index: 0;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    bottom: 75px;
    padding: .5rem 0;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    align-items: flex-end;
    padding: 0 1rem;
  `};
`

const ConnectionsWrapper = styled.div`
  display: flex;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    align-items: flex-end;
    flex-direction: column;
  `};
`

const Row = styled.div`
  padding: 0;
  display: flex;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    align-items: flex-start;
    flex-direction: column;
    margin-bottom: .325rem;
  `};
`

const Link = styled(ExternalLink)`
  opacity: 0.6;
  transition: opacity 0.3s ease-in;
  margin-left: 30px;
  font-weight: 400;

  &:hover {
    opacity: 1;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: .875rem;
    margin-left: .5rem;
  `};
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
        <Polling />
        <ConnectionStatus />
      </ConnectionsWrapper>
    </FooterFrame>
  )
}
