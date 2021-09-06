import React from 'react'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import { useTranslation } from 'react-i18next'

const StyledSpacer = styled.div`
  display: flex;
  margin-bottom: 40px;
`

const StyledNoticeBanner = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.text2};
  font-size: 2rem;
  display: flex;
  justify-content: space-between;
  padding: 0 1rem 0 1.5rem;
  position: absolute;
  top: 150px;
  width: 80%;
`

export default function NoticeBanner() {
  const { t } = useTranslation()
  return (
    <>
      <StyledSpacer />
      <StyledNoticeBanner>
        <TYPE.black fontWeight="500" fontSize="14px">
          {t(
            'mistX runs in limited mode due to an outage on the flashbots relay. You can trade safely but more transactions will expire than usual. If so, you can try again and try to up the miner payment (mistX protection)'
          )}
        </TYPE.black>
      </StyledNoticeBanner>
    </>
  )
}
