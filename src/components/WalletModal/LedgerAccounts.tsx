import { ButtonYellow, ButtonPrimary2Outlined } from 'components/Button'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Text } from 'rebass'
import styled from 'styled-components'
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
const WalletAction = styled(ButtonPrimary2Outlined)`
  width: fit-content;
  font-weight: 400;
  margin: auto;
  margin-bottom: 1.5rem;
  font-size: 0.825rem;
  padding: 4px 6px;

  :hover {
    cursor: pointer;
    text-decoration: none;
  }
`

export default function LedgerAccounts({ connector, onSubmit }: { connector: LedgerConnector; onSubmit: () => void }) {
  const mountedRef = useRef<boolean>(false)
  const [accounts, setAccounts] = useState<string[]>([])
  const [accountsPage, setAccountsPage] = useState<number>(0)
  const [accountsLoading, setAccountsLoading] = useState<boolean>(false)
  const [accountIndex, setAccountIndex] = useState<number>(connector.getAccountIndex())
  function handleSubmit() {
    connector.setAccountIndex(accountIndex)
    onSubmit()
  }
  const loadAccounts = useCallback(async () => {
    setAccountsLoading(true)
    const nextPage = accountsPage + 1
    const fetchedAccounts = await connector.getAccounts(nextPage)
    if (mountedRef.current) {
      setAccountsLoading(false)
      setAccounts([...accounts, ...fetchedAccounts])
      setAccountsPage(nextPage)
    }
  }, [accounts, accountsPage, connector])

  function formatAccount(account: string): string {
    return `${account.substring(0, 15)}...${account.substring(account.length - 4, account.length)}`
  }

  useEffect(() => {
    mountedRef.current = true
    loadAccounts()

    return () => {
      mountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Wrapper>
      <Title>Choose a Ledger Account</Title>
      <List>
        {accounts.map((account, i) => {
          return (
            <ListItem
              onClick={() => setAccountIndex(i)}
              className={`${i === accountIndex ? `active` : ``}`}
              key={`ledger-account-${i}`}
            >
              {formatAccount(account)}
            </ListItem>
          )
        })}
      </List>
      <WalletAction
        className={`${accountsLoading ? `disabled` : ``}`}
        onClick={loadAccounts}
        disabled={accountsLoading}
      >
        <Text fontWeight="700" fontSize={12}>
          {accountsLoading ? `Loading accounts...` : `Load more`}
        </Text>
      </WalletAction>
      <ButtonYellow onClick={handleSubmit}>
        <Text fontWeight="700" fontSize={20}>
          Continue
        </Text>
      </ButtonYellow>
    </Wrapper>
  )
}
