import React from 'react'
import styled from 'styled-components'
import Settings from '../Settings'
import { TYPE } from '../../theme'
import { useTranslation } from 'react-i18next'

const StyledSwapHeader = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.text2};
  font-size: 2.25rem;
  display: flex;
  justify-content: center;
  height: 120px;
  margin-bottom: 3rem;
  max-width: 420px;
  padding: 0 1rem;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 1.5rem;
    height: 60px;
    margin-bottom: 2rem;
  `}
`

export default function SwapHeader() {
  const { t } = useTranslation()
  return (
    <StyledSwapHeader>
      <TYPE.black fontWeight="400">{t('Swap Tokens')}</TYPE.black>
      <Settings />
    </StyledSwapHeader>
  )
}
