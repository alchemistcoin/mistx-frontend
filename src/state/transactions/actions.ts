import { createAction } from '@reduxjs/toolkit'
import { ChainId } from '@alchemistcoin/sdk'
import { SwapReq } from '../../websocket/index'

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
}>('transactions/addTransaction')
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
  serializedSwap?: string
  serializedApprove?: string
  status: string
  message: string
}>('transactions/updateTransaction')

export const transactionError = createAction<{
  event: string
  message?: string
}>('transactions/transactionError')
