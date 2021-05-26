import { createAction } from '@reduxjs/toolkit'
import { ChainId, Trade } from '@alchemistcoin/sdk'
import { Diagnosis, Status, SwapReq, TransactionProcessed } from '../../websocket/index'

export interface SerializableTransactionReceipt {
  to: string
  from: string
  contractAddress: string
  transactionIndex: number
  blockHash: string
  transactionHash: string
  blockNumber: number
  status?: number
}

export const addTransaction = createAction<{
  chainId: ChainId
  hash: string
  from: string
  claim?: { recipient: string }
  summary?: string
  swap?: SwapReq
  trade?: Trade
}>('transactions/addTransaction')
export const clearCompletedTransactions = createAction<{ chainId: ChainId }>('transactions/clearCompletedTransactions')
export const clearAllTransactions = createAction<{ chainId: ChainId }>('transactions/clearAllTransactions')
export const finalizeTransaction = createAction<{
  chainId: ChainId
  hash: string
  receipt: SerializableTransactionReceipt
}>('transactions/finalizeTransaction')
export const checkedTransaction = createAction<{
  chainId: ChainId
  hash: string
  blockNumber: number
}>('transactions/checkedTransaction')

export const removeTransaction = createAction<{
  chainId: ChainId
  hash: string
}>('transactions/removeTransaction')

export const updateTransaction = createAction<{
  chainId: ChainId
  hash: string
  cancel?: Status | undefined
  status?: Status
  blockNumber?: number
  message?: string
  flashbotsResolution?: string
  mistxDiagnosis?: Diagnosis
  transaction?: TransactionProcessed
  updatedAt?: number
}>('transactions/updateTransaction')

export const transactionError = createAction<{
  event: string
  message?: string
}>('transactions/transactionError')
