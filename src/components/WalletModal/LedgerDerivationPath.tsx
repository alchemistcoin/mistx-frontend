import { ButtonYellow } from 'components/Button'
import React, { useState } from 'react'
import { Text } from 'rebass'
import styled from 'styled-components'
import Loader from '../Loader'
import { LedgerConnector } from '@web3-react/ledger-connector'

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
  margin: auto;
  margin-bottom: 1rem;
  padding: 0;
  max-width: 15rem;
  max-height: 11rem;
  overflow: scroll;
`

const ListItem = styled.li`
  margin-top: 0.2rem;
  padding: 0.3rem 0;
  font-family: monospace;
  text-align: center;
  cursor: pointer;
  border-radius: 6px;
  border: 1px solid transparent;
  &:first-child {
    margin-top: 0;
  }
  &:hover {
    background-color: ${({ theme }) => theme.bg3};
  }
  &.active {
    border: 1px solid ${({ theme }) => theme.primary2};
    background-color: ${({ theme }) => theme.bg3};
  }
`

const paths: string[] = [`44'/60'/x'/0/0`, `44'/60'/0'/x`]

export default function LedgerAccounts({ connector, onSubmit }: { connector: LedgerConnector; onSubmit: () => void }) {
  const [path, setPath] = useState<string>(paths[0])
  const [loading, setLoading] = useState<boolean>(false)
  async function handleSubmit() {
    setLoading(true)
    await connector.setDerivationPath(path)
    onSubmit()
  }

  return (
    <Wrapper>
      <Title>Select a derivation path</Title>
      <List>
        {paths.map((p, i) => {
          return (
            <ListItem
              onClick={() => setPath(p)}
              className={`${p === path ? `active` : ``}`}
              key={`ledger-account-derivation-path${i}`}
            >
              {p}
            </ListItem>
          )
        })}
      </List>
      <ButtonYellow onClick={handleSubmit} disabled={loading}>
        {loading ? (
          <Loader />
        ) : (
          <Text fontWeight="700" fontSize={20}>
            Continue
          </Text>
        )}
      </ButtonYellow>
    </Wrapper>
  )
}
