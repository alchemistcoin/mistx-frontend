import React from 'react'
import styled from 'styled-components'
import { Text } from 'rebass'
import { CloseIcon } from '../../theme/components'
import { RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { ButtonYellow } from '../../components/Button'
import { useActiveWeb3React } from '../../hooks'

const Wrapper = styled.div`
  width: 100%;
`
const Section = styled(AutoColumn)`
  padding: 24px;
`

const BottomSection = styled(Section)`
  background-color: ${({ theme }) => theme.bg1};
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`

interface ConfirmationModalProps {
  onDismiss: () => void,
  onContinue: () => void,
}

export default function TransactionInformationModal({
  onDismiss,
  onContinue,
}: ConfirmationModalProps) {
  const { chainId } = useActiveWeb3React()

  if (!chainId) return null

  // confirmation screen
  return (
    <>
      <Wrapper>
        <Section>
          <RowBetween>
            <Text fontWeight={500} fontSize={20}>
              Signing Your Swap
            </Text>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
        </Section>
        <BottomSection gap="12px">
          <ButtonYellow onClick={onContinue}>Continue</ButtonYellow>
        </BottomSection>
      </Wrapper>
    </>
  )
}
