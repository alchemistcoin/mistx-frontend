import { createReducer } from '@reduxjs/toolkit'
import { Status, TransactionProcessed } from 'websocket'
import {
  addTransaction,
  checkedTransaction,
  clearCompletedTransactions,
  clearAllTransactions,
  finalizeTransaction,
  removeTransaction,
  updateTransaction,
  SerializableTransactionReceipt
} from './actions'

const now = () => new Date().getTime()

export interface TransactionDetails {
  hash: string
  approval?: { tokenAddress: string; spender: string }
  summary?: string
  claim?: { recipient: string }
  receipt?: SerializableTransactionReceipt
  processed?: TransactionProcessed
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  from: string
  message?: string
  status?: Status
  cancel?: Status
}

export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: TransactionDetails
  }
}

export const initialState: TransactionState = {}

export default createReducer(initialState, builder =>
  builder
    .addCase(addTransaction, (transactions, { payload: { chainId, from, hash, summary, claim } }) => {
      const tx = transactions[chainId]?.[hash]
      if (tx && tx.status === Status.PENDING_TRANSACTION) {
        throw Error('Attempted to add existing transaction.')
      }

      const txs = transactions[chainId] ?? {}
      txs[hash] = { hash, summary, claim, from, addedTime: now() }
      transactions[chainId] = txs
    })
    .addCase(removeTransaction, (transactions, { payload: { chainId, hash } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      const { [hash]: any, ...txs } = transactions[chainId] ?? {}

      transactions[chainId] = txs
    })
    .addCase(
      updateTransaction,
      (transactions, { payload: { chainId, transaction, hash, status, message, cancel } }) => {
        const tx = transactions[chainId]?.[hash]
        if (!tx) {
          return
        }
        // todo: update the transaction
        if (transaction) tx.processed = transaction
        if (status) tx.status = status
        tx.cancel = cancel
        tx.message = message

        const txs = transactions[chainId] ?? {}
        txs[hash] = tx

        transactions[chainId] = txs
      }
    )
    .addCase(clearCompletedTransactions, (transactions, { payload: { chainId } }) => {
      if (!transactions[chainId]) return

      let currentTransaction
      transactions[chainId] = Object.keys(transactions[chainId]).reduce(
        (
          newTransactions: { [txHash: string]: TransactionDetails },
          currentHash: string
        ): { [txHash: string]: TransactionDetails } => {
          currentTransaction = transactions[chainId][currentHash]
          if (
            currentTransaction.status === Status.PENDING_TRANSACTION || // socket transaction
            (typeof currentTransaction.status === 'undefined' && !currentTransaction.receipt)
          ) {
            // wrapped/unwrapped
            newTransactions[currentHash] = currentTransaction
          }

          return newTransactions
        },
        {}
      )
    })
    .addCase(clearAllTransactions, (transactions, { payload: { chainId } }) => {
      if (!transactions[chainId]) return
      transactions[chainId] = {}
    })
    .addCase(checkedTransaction, (transactions, { payload: { chainId, hash, blockNumber } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      if (!tx.lastCheckedBlockNumber) {
        tx.lastCheckedBlockNumber = blockNumber
      } else {
        tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber)
      }
    })
    .addCase(finalizeTransaction, (transactions, { payload: { hash, chainId, receipt } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      tx.receipt = receipt
      tx.confirmedTime = now()
    })
)
