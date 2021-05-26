import React from 'react'
import styled from 'styled-components'
import { Text } from 'rebass'
import { CloseIcon } from '../../theme/components'
import { RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { ButtonYellow } from '../../components/Button'
import Image from '../../assets/images/eth_sign_warning.png'

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

const StyledLabel = styled.label`
  cursor: pointer;
`

const StyledInput = styled.input`
  cursor: pointer;
  margin-right: 0.5rem;
`

const ImageWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 0 0 1.5rem;
  height: 100%;
  height: 14rem;

  img {
    display: flex;
    height: 100%;
  }
`

interface ConfirmationModalProps {
  onDismiss: () => void
  onContinue: () => void
}

export default function TransactionInformationModal({ onDismiss, onContinue }: ConfirmationModalProps) {
  const toggleModalPerference = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      localStorage.setItem('hideWarningModal', 'true')
    } else {
      localStorage.removeItem('hideWarningModal')
    }
  }

  return (
    <>
      <Wrapper>
        <Section>
          <RowBetween>
            <Text fontWeight={500} fontSize={20}>
              Heads up!
            </Text>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
          <RowBetween margin="0.5rem 0 0" flexDirection="column">
            <ImageWrapper>
              <img src={Image} alt="metamask warning" />
            </ImageWrapper>
            <Text fontWeight={300} fontSize={16}>
              mistX is completely free of Gas Fees, and uses an extra layer of security called MEV. Metamask is still
              due to update to the new security measures and will prompt a Signature request and a warning. This is an
              expected behaviour. Please press on Sign when the popup appears.
            </Text>
          </RowBetween>
          <RowBetween margin="1.5rem 0 0">
            <Text fontWeight={300} fontSize={16}>
              <StyledInput
                type="checkbox"
                id="hideWarningModal"
                name="hideWarningModal"
                onChange={toggleModalPerference}
              />
              <StyledLabel htmlFor="hideWarningModal">Dont show this message next time</StyledLabel>
            </Text>
          </RowBetween>
        </Section>
        <BottomSection gap="12px">
          <Button onClick={onContinue}>I understand</Button>
        </BottomSection>
      </Wrapper>
    </>
  )
}
