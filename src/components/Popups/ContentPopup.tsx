import React from 'react'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
  align-items: flex-start;
`

export default function ContentPopup({ message }: { message?: string }) {
  return (
    <RowNoFlex>
      <AutoColumn gap="8px">
        {message && (
          <TYPE.body fontSize=".875rem" mt=".5rem">
            {message}
          </TYPE.body>
        )}
      </AutoColumn>
    </RowNoFlex>
  )
}
