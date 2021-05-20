import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Text } from 'rebass'
import { RowBetween } from '../Row'
import { AutoColumn, ColumnCenter } from '../Column'
import { CloseIcon } from '../../theme/components'
import Loader from '../Loader'

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 60px 0;
`

const Wrapper = styled.div`
  width: 100%;
`
const Section = styled(AutoColumn)`
  padding: 24px;
`

const ConfirmationPendingContent = ({ onDismiss, pendingText }: { onDismiss: () => void; pendingText: string }) => {
  const theme = useContext(ThemeContext)

  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <div />
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <ConfirmedIcon>
          <Loader stroke={theme.text3} size="80px" />
          {/* <CustomLightSpinner src={Circle} alt="loader" size={'90px'} /> */}
        </ConfirmedIcon>
        <AutoColumn gap="12px" justify={'center'}>
          <Text fontWeight={500} fontSize={20}>
            Waiting For Confirmation
          </Text>
          <AutoColumn gap="12px" justify={'center'}>
            <Text fontWeight={600} fontSize={14} color="" textAlign="center">
              {pendingText}
            </Text>
          </AutoColumn>
          <Text fontSize={12} color={theme.text2} textAlign="center">
            Confirm this transaction in your wallet
          </Text>
        </AutoColumn>
      </Section>
    </Wrapper>
  )
}

export default ConfirmationPendingContent
