import { ChainId, Token } from '@alchemistcoin/sdk'
import { createReducer } from '@reduxjs/toolkit'
import { WrapType } from 'hooks/useWrapCallback'
import { Diagnosis, Status, SwapReq, TransactionProcessed } from 'websocket'
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
import { isPendingTransaction } from './hooks'

const now = () => new Date().getTime()
export interface CurrencyDetails {
  chainId?: ChainId
  address?: string
  decimals: number
  symbol?: string
  name?: string
}
export interface AmountDetails {
  currency: CurrencyDetails
  value: string
}
export interface TransactionDetails {
  hash: string
  approval?: { tokenAddress: string; spender: string }
  summary?: string
  claim?: { recipient: string }
  receipt?: SerializableTransactionReceipt
  processed?: TransactionProcessed // swaps
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  from: string
  swap?: SwapReq
  blockNumber?: number // from transaction diagnosis
  status?: Status
  message?: string
  cancel?: Status
  flashbotsResolution?: string
  mistxDiagnosis?: Diagnosis
  updatedAt?: number
  inputAmount?: AmountDetails
  outputAmount?: AmountDetails
  wrapType?: WrapType
}

export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: TransactionDetails
  }
}

export const initialState: TransactionState = {}

export default createReducer(initialState, builder =>
  builder
    .addCase(
      addTransaction,
      (
        transactions,
        { payload: { chainId, from, hash, summary, claim, trade, wrapType, inputAmount, outputAmount } }
      ) => {
        const tx = transactions[chainId]?.[hash] as TransactionDetails
        if (tx && isPendingTransaction(tx)) {
          throw Error('Attempted to add existing transaction.')
        }

        const input = trade ? trade.inputAmount : inputAmount
        const output = trade ? trade.outputAmount : outputAmount

        const txs = transactions[chainId] ?? {}
        txs[hash] = {
          hash,
          summary,
          claim,
          from,
          addedTime: now(),
          wrapType,
          inputAmount: input
            ? {
                currency: {
                  chainId: input.currency instanceof Token ? input.currency.chainId : undefined,
                  address: input.currency instanceof Token ? input.currency.address : undefined,
                  decimals: input.currency.decimals,
                  symbol: input.currency.symbol,
                  name: input.currency.name
                },
                value: input.toSignificant(4)
              }
            : undefined,
          outputAmount: output
            ? {
                currency: {
                  chainId: output.currency instanceof Token ? output.currency.chainId : undefined,
                  address: output.currency instanceof Token ? output.currency.address : undefined,
                  decimals: output.currency.decimals,
                  symbol: output.currency.symbol,
                  name: output.currency.name
                },
                value: output.toSignificant(4)
              }
            : undefined
        }
        transactions[chainId] = txs
      }
    )
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
      (
        transactions,
        {
          payload: {
            chainId,
            transaction,
            hash,
            blockNumber,
            flashbotsResolution,
            mistxDiagnosis,
            status,
            message,
            cancel,
            updatedAt
          }
        }
      ) => {
        const tx = transactions[chainId]?.[hash]
        if (!tx) {
          return
        }
        // todo: update the transaction
        if (transaction) tx.processed = transaction
        if (status) tx.status = status
        if (blockNumber) tx.blockNumber = blockNumber
        if (flashbotsResolution) tx.flashbotsResolution = flashbotsResolution
        if (mistxDiagnosis) tx.mistxDiagnosis = mistxDiagnosis
        if (updatedAt) tx.updatedAt = updatedAt

        if (cancel) tx.cancel = cancel
        tx.message = message
        tx.updatedAt = updatedAt

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
          currentTransaction = transactions[chainId][currentHash] as TransactionDetails
          if (isPendingTransaction(currentTransaction)) {
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
