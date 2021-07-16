import React from 'react'
import Modal from '../Modal'
import { useNewAppVersionAvailable } from '../../state/application/hooks'
import { Text } from 'rebass'
import styled from 'styled-components'
// import { RowBetween } from '../Row'
import { AutoColumn } from '../Column'

const Wrapper = styled.div`
  width: 100%;
`
const Section = styled(AutoColumn)`
  padding: 24px;
`

export default function TokenWarningModal() {
  const [newAppVersionAvailable] = useNewAppVersionAvailable()
  return (
    <Modal
      isOpen={newAppVersionAvailable}
      onDismiss={() => {
        console.log(newAppVersionAvailable)
      }}
      maxHeight={100}
    >
      <Wrapper>
        <Section>
          <AutoColumn justify={'center'}>
            <Text fontWeight={500} fontSize={20}>
              New App Version Available!
            </Text>
            <Text fontSize={16}>Please refresh the page to continue using mistX</Text>
          </AutoColumn>
        </Section>
      </Wrapper>
    </Modal>
  )
}
