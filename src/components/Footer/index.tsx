import React from 'react'
import styled from 'styled-components'
import NavExternalLinks from '../NavExternalLinks'

const FooterFrame = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
  top: 0;
  position: relative;
  padding: 1rem 1rem;
  z-index: 0;
`

const FooterRow = styled.div`
  display: flex;
`

export default function Footer({ style }: { style?: object }) {
  return (
    <FooterFrame style={style}>
      <FooterRow>
        <NavExternalLinks header={false} />
      </FooterRow>
    </FooterFrame>
  )
}
