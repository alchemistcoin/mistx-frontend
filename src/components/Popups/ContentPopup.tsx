import React, { useContext } from 'react'
import { ThumbsUp } from 'react-feather'
import styled, { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
  align-items: flex-start;
`

export default function TransactionPopup({ message }: { message?: string }) {
  const theme = useContext(ThemeContext)

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16, marginTop: 8 }}>
        <ThumbsUp color={theme.text1} size={24} />
      </div>
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
