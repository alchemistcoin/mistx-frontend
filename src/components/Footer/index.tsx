import React from 'react'
import styled from 'styled-components'
import NavExternalLinks from '../NavExternalLinks'
import { ExternalLink } from '../../theme'
import { ReactComponent as AlchemistLogo } from '../../assets/images/alchemist_logo.svg'

const FooterFrame = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
  position: absolute;
  bottom: 10px;
  padding: 1rem 1rem;
  z-index: 0;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    bottom: 75px;
    padding: 1rem 1rem 0;
  `};
`

const FooterWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-column-gap: 5px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 0;
  `};
`

const Row = styled.div`
  grid-column-start: 1;
  grid-column: span 2 / span 2;
  padding-left: 130px;
  display: flex;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding-left: 0;
    grid-column: none;
    justify-content: flex-end;
  `};

  a {
    opacity: 0.6;
    transition: all 0.3s ease-in;
    margin-right: 30px;
    font-weight: 400;
    &:hover {
      opacity: 1;
    }
    ${({ theme }) => theme.mediaWidth.upToMedium`
      margin-right: 0;
      margin-left: 30px;
    `};
  }
`

const FooterRight = styled.div`
  display: flex;
  grid-column: span 2 / span 2;
  justify-content: flex-end;
  padding-right: 75px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `}

  > div {
    display: flex;
    flex-direction: row;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    flex-direction: row;
    border-radius: 20px;
    padding: 6px 8px;
    border: 1px solid #535d63;
    text-decoration: none;
    font-weight: 300;
    font-size: 14px;

    &:hover,
    &:focus {
      text-decoration: none;
    }

    > div {
      width: 22px;
      display: flex;
      margin-right: 12px;

      svg {
        width: 100%;
        height: auto;
      }
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
        <FooterRight>
          <div>
            <div>
              <AlchemistLogo />
            </div>{' '}
            an alchemist product
          </div>
        </FooterRight>
      </FooterWrapper>
    </FooterFrame>
  )
}
