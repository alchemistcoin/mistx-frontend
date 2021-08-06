import React from 'react'
import styled from 'styled-components'
import NavExternalLinks from '../NavExternalLinks'
import { ExternalLink } from '../../theme'

const FooterFrame = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
  position: absolute;
  bottom: 0;
  padding: 1rem 1rem;
  z-index: 0;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    bottom: 75px;
  `};
`

const FooterWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr repeat(3, auto) 1fr;
  grid-column-gap: 5px;
  justify-items: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 0;
    display: flex;
  `};
`

const Row = styled.div`
  grid-column-start: 1;
  a {
    opacity: 0.6;
    transition: all 0.3s ease-in;
    margin-right: 30px;
    &:hover {
      opacity: 1;
    }
  }
`

export default function Footer({ style }: { style?: object }) {
  return (
    <FooterFrame style={style}>
      <FooterWrapper>
        <Row>
          <ExternalLink href="https://docs.alchemist.wtf/mistx" title="Docs">
            Docs
          </ExternalLink>
          <ExternalLink href="https://dune.xyz/alchemistcoin/MistX-Dashboard" title="Analytics">
            Analytics
          </ExternalLink>
        </Row>
        <NavExternalLinks header={false} />
      </FooterWrapper>
    </FooterFrame>
  )
}
