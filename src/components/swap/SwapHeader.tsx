import React from 'react'
import styled from 'styled-components'
import Settings from '../Settings'
import { RowBetween } from '../Row'

const StyledSwapHeader = styled.div`
  padding: 0 1rem;
  width: 100%;
  max-width: 420px;
  color: ${({ theme }) => theme.text2};
`

export default function SwapHeader() {
  return (
    <StyledSwapHeader>
      <RowBetween>
        <Settings />
      </RowBetween>
    </StyledSwapHeader>
  )
}
