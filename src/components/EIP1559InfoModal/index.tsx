import React, { useState, useEffect } from 'react'
import Modal from '../Modal'
import useIsEIP1559 from '../../hooks/useIsEIP1559'
import { Text } from 'rebass'
import styled from 'styled-components'
// import { RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { ButtonYellow } from '../../components/Button'

const Wrapper = styled.div`
  width: 100%;
`
const Section = styled(AutoColumn)`
  padding: 24px;
`
const ButtonWrapper = styled.div`
  padding: 20px 0;
`

const Button = styled(ButtonYellow)`
  margin-top: 15px;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text4};
  border-color: ${({ theme }) => theme.primary2};
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 8px;
`

export default function EIP1559InfoModal() {
  const hideEIP1559WarningModalPreference = localStorage.getItem('hideEIP1559WarningModalPreference') === 'true'
  const eip1559 = useIsEIP1559()
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  useEffect(() => {
    if (eip1559 && !hideEIP1559WarningModalPreference) {
      setModalOpen(true)
    } else {
      setModalOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eip1559])
  const hideModal = () => {
    setModalOpen(false)
  }
  const setWarningPreference = () => {
    localStorage.setItem('hideEIP1559WarningModalPreference', 'true')
    setModalOpen(false)
  }
  return (
    <Modal isOpen={modalOpen} onDismiss={hideModal} maxHeight={100}>
      <Wrapper>
        <Section>
          <AutoColumn justify={'center'}>
            <Text fontWeight={500} fontSize={20}>
              London Network Upgrade
            </Text>
            <Text fontSize={16} marginTop={10}>
              The long-anticipated London Network Upgrade has commenced.
            </Text>
            <Text fontSize={16} marginTop={10}>
              Due to the new &quot;Base Fee&quot; requirement, a small ETH balance is needed to make a swap on mistX.
            </Text>
            <ButtonWrapper>
              <Button onClick={setWarningPreference}>I understand</Button>
            </ButtonWrapper>
          </AutoColumn>
        </Section>
      </Wrapper>
    </Modal>
  )
}
