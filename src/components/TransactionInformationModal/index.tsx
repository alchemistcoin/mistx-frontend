import React from 'react'
import styled from 'styled-components'
import { Text } from 'rebass'
import { CloseIcon } from '../../theme/components'
import { RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { ButtonYellow } from '../../components/Button'
import { ExternalLink } from '../../theme'

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

const Button = styled(ButtonYellow)`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.text4};
  font-weight: 700;
`

interface ConfirmationModalProps {
  onDismiss: () => void,
  onContinue: () => void,
}

export default function TransactionInformationModal({
  onDismiss,
  onContinue,
}: ConfirmationModalProps) {
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
          <RowBetween margin='2rem 0 0'>
            <Text fontWeight={300} fontSize={16}>
              Due to a limitation with MetaMask you will see a red warning message before signing your transaction. This is nothing to worry about your funds are safe.
            </Text>
          </RowBetween>
          <RowBetween margin='1rem 0 0'>
            <Text fontWeight={300} fontSize={16}>
              <ExternalLink href="https://github.com/MetaMask/metamask-extension/issues/10914">Find out more</ExternalLink>
            </Text>
          </RowBetween>
        </Section>
        <BottomSection gap="12px">
          <Button onClick={onContinue}>Continue</Button>
        </BottomSection>
      </Wrapper>
    </>
  )
}
