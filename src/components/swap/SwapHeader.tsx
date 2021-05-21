import React from 'react'
import styled from 'styled-components'
import Settings from '../Settings'
import { TYPE } from '../../theme'
import { useTranslation } from 'react-i18next'

const StyledSwapHeader = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.text2};
  font-size: 2rem;
  display: flex;
  justify-content: space-between;
  padding: 0 1rem 0 1.5rem;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 1.5rem;
    padding: 0 0.25rem 0 0.5rem;
  `}
`

export default function SwapHeader() {
  const { t } = useTranslation()
  return (
    <StyledSwapHeader>
      <TYPE.black fontWeight="700">{t('Swap Tokens')}</TYPE.black>
      <Settings />
    </StyledSwapHeader>
  )
}
