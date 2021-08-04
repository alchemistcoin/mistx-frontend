import { createAction } from '@reduxjs/toolkit'
import { ChainId, CurrencyAmount, Trade, Currency, TradeType } from '@alchemist-coin/mistx-core'
import { Diagnosis, Status, SwapReq, BundleProcessed } from '../../websocket/index'
import { WrapType } from 'hooks/useWrapCallback'

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
  trade?: Trade<Currency, Currency, TradeType>
  wrapType?: WrapType
  inputAmount?: CurrencyAmount<Currency>
  outputAmount?: CurrencyAmount<Currency>
  deadline?: number
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
  cancel?: Status | string | undefined
  status?: Status | string
  blockNumber?: number
  message?: string
  flashbotsResolution?: string
  mistxDiagnosis?: Diagnosis
  bundle?: BundleProcessed
  updatedAt?: number
}>('transactions/updateTransaction')

export const serializeLegacyTransaction = createAction<{
  legacyTransaction: any
}>('transactions/serializeLegacyTransaction')

export const transactionError = createAction<{
  event: string
  message?: string
}>('transactions/transactionError')
