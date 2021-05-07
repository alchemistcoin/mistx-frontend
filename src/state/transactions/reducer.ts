import { createReducer } from '@reduxjs/toolkit'
import { Status, SwapReq } from 'websocket'
import {
  addTransaction,
  checkedTransaction,
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
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  from: string
  swap?: SwapReq
  message?: string
  status?: string
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
      const tx = transactions[chainId]?.[hash];
      if (tx && (tx.status === Status.PENDING_TRANSACTION) ) {
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
    .addCase(updateTransaction, (transactions, { payload: { chainId, hash, status } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      // todo: update the transaction
      tx.status = status

      const txs = transactions[chainId] ?? {}
      txs[hash] = tx

      transactions[chainId] = txs
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
