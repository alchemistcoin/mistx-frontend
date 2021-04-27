import React from 'react'
import styled from 'styled-components'
import Settings from '../Settings'
import Row from '../Row'
import { TYPE } from '../../theme'
import { useTranslation } from 'react-i18next'

const StyledSwapHeader = styled.div`
  padding: 0 1rem;
  width: 100%;
  margin-bottom: 2rem;
  max-width: 420px;
  color: ${({ theme }) => theme.text2};
`

export default function SwapHeader() {
  const { t } = useTranslation();
  return (
    <StyledSwapHeader>
      <Row align="center" justify="center" style={{ height: '120px' }}>
        <TYPE.black fontSize="2.25rem" fontWeight="400">{t('Swap Tokens')}</TYPE.black>
        <Settings />
      </Row>
    </StyledSwapHeader>
  )
}
