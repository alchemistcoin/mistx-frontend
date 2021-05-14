import React from 'react'
import styled from 'styled-components'
import { CheckCircle, Triangle } from 'react-feather'

import { useActiveWeb3React } from '../../hooks'
import { getEtherscanLink } from '../../utils'
import { ExternalLink } from '../../theme'
import { useAllTransactions, useTransactionCanceller } from '../../state/transactions/hooks'
import { RowFixed } from '../Row'
import Loader from '../Loader'
import { Status } from '../../websocket/index'
import { truncateStringMiddle } from '../../utils/truncateString'
import { useTranslation } from 'react-i18next'
import { darken } from 'polished'

const TransactionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const TransactionStatusText = styled.div`
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  :hover {
    text-decoration: underline;
  }
`

const TransactionState = styled(ExternalLink)<{ pending: boolean; success?: boolean }>`
  text-decoration: none !important;
  border-radius: 0.5rem;
  padding: 0.25rem 0rem;
  flex: 1;
  font-weight: 500;
  font-size: 0.825rem;
  color: ${({ theme }) => theme.text3};

  :hover {
    color: ${({ theme }) => theme.text1};
  }
`

const StatusText = styled.div<{ cancelled?: boolean }>`
  color: ${({ theme }) => theme.primary2}
  font-size: .75rem;
  font-weight: 600;
  margin: 0 .5rem;
`

const CancelButton = styled.button`
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.primary2};
  border-radius: 1rem;
  color: ${({ theme }) => theme.primary2};
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  margin: 0 0.5rem;
  padding: 0.125rem 0.25rem;
  width: auto;

  &:hover {
    border-color: ${({ theme }) => darken(0.05, theme.primary2)};
    color: ${({ theme }) => darken(0.05, theme.primary2)};
  }

  &:disabled {
    border-color: ${({ theme }) => theme.bg1};
    color: ${({ theme }) => theme.bg1};
    cursor: default;
  }
`

const IconWrapper = styled.div<{ pending: boolean; success?: boolean }>`
  color: ${({ pending, success, theme }) => (pending ? theme.primary2 : success ? theme.green1 : theme.red1)};
  display: flex;

  path {
    stroke: ${({ pending, success, theme }) => (pending ? theme.primary2 : success ? theme.green1 : theme.red1)};
  }
`

export default function Transaction({ hash }: { hash: string }) {
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()
  const allTransactions = useAllTransactions()

  const tx = allTransactions?.[hash]
  const summary = tx?.summary
  const isCancelled = tx?.cancel === Status.CANCEL_TRANSACTION_SUCCESSFUL
  const pending =
    !isCancelled && (tx?.status === Status.PENDING_TRANSACTION || (!tx?.receipt && typeof tx?.status === 'undefined'))
  const canCancel = pending && typeof tx?.status !== 'undefined'
  const success = tx && (tx.status === Status.SUCCESSFUL_TRANSACTION || tx.receipt?.status === 1)
  const cancelTransaction = useTransactionCanceller()

  function handleCancelClick() {
    if (!chainId) return
    if (!tx?.processed) return

    cancelTransaction(
      {
        chainId,
        hash
      },
      {
        transaction: tx.processed
      }
    )
  }

  if (!chainId) return null

  return (
    <TransactionWrapper>
      <TransactionState href={getEtherscanLink(chainId, hash, 'transaction')} pending={pending} success={success}>
        <RowFixed>
          <TransactionStatusText>{summary ?? truncateStringMiddle(hash, 6, 7)} ↗</TransactionStatusText>
        </RowFixed>
      </TransactionState>
      {canCancel && (
        <CancelButton disabled={tx?.cancel === Status.CANCEL_TRANSACTION_PENDING} onClick={handleCancelClick}>
          {t('Cancel')}
        </CancelButton>
      )}
      {isCancelled && <StatusText>Cancelled</StatusText>}
      <IconWrapper pending={pending} success={success}>
        {success ? <CheckCircle size="16" /> : pending ? <Loader /> : <Triangle size="16" />}
      </IconWrapper>
    </TransactionWrapper>
  )
}
