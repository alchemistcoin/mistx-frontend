import React from 'react'
import styled from 'styled-components'
import NavExternalLinks from '../NavExternalLinks'

const HideLarge = styled.div`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
  `};
`

const FooterFrame = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
  top: 0;
  position: relative;
  padding: 1rem 1rem;
  z-index: 2;
`

const FooterRow = styled.div`
  display: flex;
`

export default function Header() {
  return (
    <FooterFrame>
      <FooterRow>
        <HideLarge>
          <NavExternalLinks header={false} />
        </HideLarge>
      </FooterRow>
    </FooterFrame>
  )
}
