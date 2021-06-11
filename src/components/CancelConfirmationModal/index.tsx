import React from 'react'
import styled from 'styled-components'
import { Text } from 'rebass'
import { CloseIcon } from '../../theme/components'
import { RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { ButtonYellow } from '../Button'
import Modal from '../Modal'

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

interface CancelConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
}

export default function CancelConfirmationModal({ isOpen, onClose, onSubmit }: CancelConfirmationModalProps) {
  const hideModal = () => {
    onClose()
  }

  const cta = () => {
    onSubmit()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onDismiss={hideModal}>
      <Wrapper>
        <Section>
          <RowBetween>
            <Text fontWeight={500} fontSize={20}>
              Before we proceed
            </Text>
            <CloseIcon onClick={hideModal} />
          </RowBetween>
          <RowBetween margin="0.5rem 0 0" flexDirection="column">
            <Text fontWeight={300} fontSize={16}>
              Submitting this attempt does not guarantee your original transaction will be cancelled.
              If the cancellation attempt is successful, you <b>will not</b> be charged any fee.
            </Text>
          </RowBetween>
        </Section>
        <BottomSection gap="12px">
          <Button onClick={cta}>Continue</Button>
        </BottomSection>
      </Wrapper>
    </Modal>
  )
}
