import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { darken } from 'polished'
import React, { useMemo } from 'react'
import { Activity } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { NetworkContextName } from '../../constants'
import useENSName from '../../hooks/useENSName'
import { useHasSocks } from '../../hooks/useSocksBalance'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useDarkModeManager } from '../../state/user/hooks'
import { isPendingTransaction, isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks'
import { TransactionDetails } from '../../state/transactions/reducer'
import { shortenAddress } from '../../utils'
import { ButtonSecondary } from '../Button'
import { ConnectIcon } from '../Icons'
import { colors as ThemeColors } from '../../theme'
import Loader from '../Loader'
import { RowBetween } from '../Row'
import WalletModal from '../WalletModal'

const Web3StatusGeneric = styled(ButtonSecondary)`
  ${({ theme }) => theme.flexRowNoWrap}
  background-color: none;
  width: 100%;
  align-items: center;
  padding: 0.5rem;
  border-radius: 36px;
  cursor: pointer;
  user-select: none;
  border-radius: 36px;

  :hover,
  :focus {
    outline: none;
    border: 1px solid ${({ theme }) => darken(0.05, theme.btnBorder)};
    box-shadow: none;
  }
`
const Web3StatusError = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.red1};
  border: 1px solid ${({ theme }) => theme.red1};
  color: ${({ theme }) => theme.white};
  font-weight: 500;

  :hover,
  :focus {
    background-color: ${({ theme }) => darken(0.1, theme.red1)};
  }
`

const Web3StatusConnect = styled(Web3StatusGeneric)<{ darkMode?: boolean }>`
  background-color: none;
  border: none;
  color: ${({ theme }) => (theme.darkMode ? theme.yellow1 : theme.text1)};
  border: 1px solid ${({ theme }) => (theme.darkMode ? theme.yellow1 : theme.text1)};
  font-weight: 500;

  :hover,
  :focus {
    border: 1px solid ${({ theme }) => darken(0.05, theme.darkMode ? theme.yellow1 : theme.text1)};
    color: ${({ theme }) => darken(0.05, theme.darkMode ? theme.yellow1 : theme.text1)};
  }
`

const Web3StatusConnected = styled(Web3StatusGeneric)<{ pending?: boolean }>`
  background-color: ${({ theme }) => (theme.darkMode ? theme.yellow1 : theme.text1)};
  border: 1px solid ${({ theme }) => (theme.darkMode ? theme.yellow1 : theme.text1)};
  color: ${({ theme }) => (theme.darkMode ? theme.text5 : theme.text1)};
  font-weight: 700;

  :hover,
  :focus {
    background-color: ${({ theme }) => darken(0.05, theme.yellow1)};

    :focus {
      border: 1px solid ${({ theme }) => darken(0.1, theme.darkMode ? theme.yellow1 : theme.text1)};
    }
  }
`

const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.25rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 600;
`

const NetworkIcon = styled(Activity)`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
`

// const StyledPowerIcon = styled(PowerIcon)`
//   margin-left: 0.5rem;
// `

const StyledConnectIconWrapper = styled.div`
  position: relative;
  display: flex;

  > svg {
    height: 14px;
  }
`

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

const SOCK = (
  <span role="img" aria-label="has socks emoji" style={{ marginTop: -4, marginBottom: -4 }}>
    🧦
  </span>
)

// eslint-disable-next-line react/prop-types
// function StatusIcon({ connector }: { connector: AbstractConnector }) {
//   if (!connector) return null
//   return <StyledPowerIcon fill="#292624" />
// }

function Web3StatusInner() {
  const { t } = useTranslation()
  const [darkMode] = useDarkModeManager()
  const { account, error } = useWeb3React()

  const colors = ThemeColors(darkMode)

  const { ENSName } = useENSName(account ?? undefined)

  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter(tx => isPendingTransaction(tx)).map(tx => tx.hash)

  const hasPendingTransactions = !!pending.length
  const hasSocks = useHasSocks()
  const toggleWalletModal = useWalletModalToggle()

  if (account) {
    return (
      <Web3StatusConnected id="web3-status-connected" onClick={toggleWalletModal} pending={hasPendingTransactions}>
        {hasPendingTransactions ? (
          <RowBetween>
            <Text>{pending?.length} Pending</Text> <Loader stroke={darkMode ? colors.text5 : colors.text1} />
          </RowBetween>
        ) : (
          <>
            {hasSocks ? SOCK : null}
            <Text>{ENSName || shortenAddress(account, 3)}</Text>
          </>
        )}
        {/* {!hasPendingTransactions && connector && <StatusIcon connector={connector} />} */}
      </Web3StatusConnected>
    )
  } else if (error) {
    return (
      <Web3StatusError onClick={toggleWalletModal}>
        <NetworkIcon />
        <Text>{error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error'}</Text>
      </Web3StatusError>
    )
  } else {
    return (
      <Web3StatusConnect id="connect-wallet" onClick={toggleWalletModal}>
        <Text>{t('Connect Wallet')}</Text>{' '}
        <StyledConnectIconWrapper>
          <ConnectIcon fill={darkMode ? colors.yellow1 : colors.text1} />
        </StyledConnectIconWrapper>
      </Web3StatusConnect>
    )
  }
}

export default function Web3Status() {
  const { active, account } = useWeb3React()
  const contextNetwork = useWeb3React(NetworkContextName)

  const { ENSName } = useENSName(account ?? undefined)

  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter(tx => isPendingTransaction(tx)).map(tx => tx.hash)
  const confirmed = sortedRecentTransactions.filter(tx => !pending.includes(tx.hash)).map(tx => tx.hash)

  if (!contextNetwork.active && !active) {
    return null
  }

  return (
    <>
      <Web3StatusInner />
      <WalletModal ENSName={ENSName ?? undefined} pendingTransactions={pending} confirmedTransactions={confirmed} />
    </>
  )
}
