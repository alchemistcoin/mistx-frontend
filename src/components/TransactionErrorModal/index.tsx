import React, { useState } from 'react'
import styled from 'styled-components'
import { Text } from 'rebass'
import { useDispatch } from 'react-redux'
import { RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { ButtonYellow } from '../Button'
import Modal from '../Modal'
import FATHOM_GOALS from '../../constants/fathom'
import { setOpenModal } from '../../state/application/actions'
import { modalContent } from '../HardwareWalletModal'

const Wrapper = styled.div`
  width: 100%;
`
const Section = styled(AutoColumn)`
  padding: 24px;
`
const StyledInput = styled.input`
  cursor: pointer;
  margin-right: 0.5rem;
`
const StyledLabel = styled.label`
  cursor: pointer;
`

const BottomSection = styled.div`
  background-color: ${({ theme }) => theme.bg1};
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  > div {
    padding: 0 50px;
  }
  button {
    margin: 0 10px;
    padding: 10px 14px;
  }
`

const Button = styled(ButtonYellow)`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.text4};
  font-weight: 700;
`

export default function HardwareWalletModal() {
  const dispatch = useDispatch()
  const [hideModalPref, setHideModalPref] = useState<boolean>(false)
  const [showInfo, setShowInfo] = useState<boolean>(false)

  const hideModal = () => {
    dispatch(setOpenModal(null))
  }

  const toggleModalPref = (e: any) => {
    if (e.target.checked) {
      localStorage.setItem('hideMMHardwareModal', 'true')
      setHideModalPref(true)
    } else {
      localStorage.removeItem('hideMMHardwareModal')
      setHideModalPref(false)
    }
  }

  const CTAYes = () => {
    if (window.fathom) {
      window.fathom.trackGoal(FATHOM_GOALS.SWAP_ERROR_MM_HARDWARE_YES, 0)
    }
    setShowInfo(true)
  }

  const CTANo = () => {
    hideModal()
    if (window.fathom) {
      window.fathom.trackGoal(FATHOM_GOALS.SWAP_ERROR_MM_HARDWARE_NO, 0)
    }
  }

  return (
    <Modal isOpen={true} onDismiss={() => ''}>
      <Wrapper>
        {showInfo ? (
          modalContent(hideModal, hideModal)
        ) : (
          <>
            <Section>
              <RowBetween>
                <Text fontWeight={500} fontSize={20}>
                  Transaction Failed
                </Text>
              </RowBetween>
              <RowBetween margin="0.5rem 0 0" flexDirection="column">
                <Text fontWeight={300} fontSize={16} marginBottom="1rem">
                  <div>We noticed you are using MetaMask and encounted an error.</div>
                </Text>
              </RowBetween>
              <RowBetween margin="0.5rem 0 0">
                <Text fontWeight={600} fontSize={16} marginBottom="1rem">
                  <div>Are you using a hardware wallet?</div>
                </Text>
              </RowBetween>
              <RowBetween margin="1.5rem 0 0">
                <Text fontWeight={300} fontSize={16}>
                  <StyledInput
                    type="checkbox"
                    id="hideWarningModal"
                    name="hideWarningModal"
                    checked={hideModalPref}
                    onChange={(e: any) => toggleModalPref(e)}
                  />
                  <StyledLabel htmlFor="hideWarningModal">Dont show this message next time</StyledLabel>
                </Text>
              </RowBetween>
            </Section>
            <BottomSection>
              <RowBetween display="flex">
                <Button onClick={CTAYes}>Yes</Button>
                <Button onClick={CTANo}>No</Button>
              </RowBetween>
            </BottomSection>
          </>
        )}
      </Wrapper>
    </Modal>
  )
}
