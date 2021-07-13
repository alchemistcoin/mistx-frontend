import React, { useState } from 'react'
import styled from 'styled-components'
import { CheckCircle, Triangle } from 'react-feather'

import { useActiveWeb3React } from '../../hooks'
import { getEtherscanLink } from '../../utils'
import { ExternalLink } from '../../theme'
import {
  isPendingTransaction,
  isSuccessfulTransaction,
  useAllTransactions,
  useTransactionCanceller
} from '../../state/transactions/hooks'
import { RowFixed } from '../Row'
import Loader from '../Loader'
import { Status, STATUS_LOCALES } from '../../websocket/index'
import { truncateStringMiddle } from '../../utils/truncateString'
import { useTranslation } from 'react-i18next'
import { darken } from 'polished'

const TransactionHeaderText = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.text1};
  display: flex;
  font-weight: 600;
  font-size: 0.825rem;
  margin-right: 0.5rem;
  margin-bottom: 0.25rem;
`

const TransactionStatusText = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.text2};
  display: flex;
  font-weight: 500;
  font-size: 0.825rem;
  margin-right: 0.5rem;
  margin-bottom: 0.25rem;
  border-bottom: 1px solid #6c7383;
  padding-bottom: 1rem;
  margin-bottom: 0.5rem;
`

const TransactionWrapper = styled.div`
  position: relative;
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;

  &:last-child ${TransactionStatusText} {
    border-bottom: 0;
  }
`

const TransactionState = styled(ExternalLink)<{ pending: boolean; success?: boolean }>`
  border-radius: 0.5rem;
  text-decoration: none !important;
  flex: 1;

  :hover .transaction-status-text {
    color: ${({ theme }) => theme.text1};
    text-decoration: underline;
  }
`

const CancelButton = styled.button`
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.primary2};
  border-radius: 1rem;
  color: ${({ theme }) => theme.primary2};
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  margin: 1rem 0.5rem 0;
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
  position: absolute;
  top: 5px;
  right: 5px;

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
  const isCancelled = tx?.cancel === Status.CANCEL_BUNDLE_SUCCESSFUL
  const pending = !isCancelled && tx && isPendingTransaction(tx)
  const canCancel = pending && typeof tx?.status !== 'undefined'
  const success = tx && isSuccessfulTransaction(tx)
  const cancelTransaction = useTransactionCanceller()
  const [cancelClicked, setCancelClicked] = useState(false)

  const Row = (
    <RowFixed flex="1" align="left" flexDirection="column">
      <TransactionHeaderText className="transaction-status-text">
        {summary ?? truncateStringMiddle(hash, 6, 7)}
        {success ? ' ↗' : ''}
      </TransactionHeaderText>
      <TransactionStatusText className="transaction-status-text">
        {tx.status && STATUS_LOCALES[tx.status]}
        {tx.status !== (Status.PENDING_BUNDLE || Status.BUNDLE_NOT_FOUND) && ` - ${tx.message}`}
      </TransactionStatusText>
    </RowFixed>
  )

  function handleCancelClick() {
    if (!chainId) return
    if (!tx?.processed) return
    setCancelClicked(true)
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
      {success ? (
        <TransactionState href={getEtherscanLink(chainId, hash, 'transaction')} pending={pending} success={success}>
          {Row}
        </TransactionState>
      ) : (
        Row
      )}
      {canCancel && (
        <CancelButton disabled={cancelClicked} onClick={handleCancelClick}>
          {t('Cancel')}
        </CancelButton>
      )}
      <IconWrapper pending={pending} success={success}>
        {success ? <CheckCircle size="16" /> : pending ? <Loader /> : <Triangle size="16" />}
      </IconWrapper>
    </TransactionWrapper>
  )
}
