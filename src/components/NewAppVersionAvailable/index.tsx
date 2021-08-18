import React, { useEffect } from 'react'
import Modal from '../Modal'
import { useNewAppVersionAvailable } from '../../state/application/hooks'
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

export default function NewAppVersionAvailableModal() {
  const [newAppVersionAvailable] = useNewAppVersionAvailable()
  const refresh = () => window.location.reload()

  useEffect(() => {
    if (newAppVersionAvailable) {
      setTimeout(() => {
        refresh()
      }, 10000)
    }
  }, [newAppVersionAvailable])

  return (
    <Modal
      isOpen={newAppVersionAvailable}
      onDismiss={() => {
        // console.log(newAppVersionAvailable)
      }}
      maxHeight={100}
    >
      <Wrapper>
        <Section>
          <AutoColumn justify={'center'}>
            <Text fontWeight={500} fontSize={20}>
              New App Version Available!
            </Text>
            <Text fontSize={16} marginTop={10}>
              A new version of mistX is available, your browser will refresh in 10 seconds or click the button below to
              manually refresh.
            </Text>
            <ButtonWrapper>
              <Button onClick={() => refresh()}>Refresh</Button>
            </ButtonWrapper>
          </AutoColumn>
        </Section>
      </Wrapper>
    </Modal>
  )
}
