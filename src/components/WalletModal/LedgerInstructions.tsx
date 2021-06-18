import { ButtonYellow } from 'components/Button'
import React from 'react'
import { Text } from 'rebass'
import styled from 'styled-components'

const Wrapper = styled.div`
  padding: 1rem 2rem 2rem;
  position: relative;
`

const Title = styled.h5`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 2rem;
  text-align: center;
`

const List = styled.ul`
  list-style-type: none;
  margin-bottom: 2.5rem;
  padding: 0 1.5rem;
`

const ListItem = styled.li`
  margin-top: 1rem;

  &:first-child {
    margin-top: 0;
  }
`

export default function LedgerInstructions({ onSubmit }: { onSubmit: () => void }) {
  function handleSubmit() {
    onSubmit()
  }

  return (
    <Wrapper>
      <Title>Before proceeding, make sure...</Title>
      <List>
        <ListItem>1. Ledger Live app is closed</ListItem>
        <ListItem>{'2. "Contract data" is enabled on the device'}</ListItem>
        <ListItem>
          3. The device is plugged in via USB, <b>not</b> bluetooth
        </ListItem>
        <ListItem>4. The device is unlcoked and in the Ethereum app</ListItem>
      </List>
      <ButtonYellow onClick={handleSubmit}>
        <Text fontWeight="700" fontSize={20}>
          Continue
        </Text>
      </ButtonYellow>
    </Wrapper>
  )
}
