import { ChainId, Token } from '@alchemist-coin/mistx-core'
import { createReducer } from '@reduxjs/toolkit'
import { WrapType } from 'hooks/useWrapCallback'
import { Diagnosis, Status, SwapReq, BundleProcessed, TransactionProcessed } from 'websocket'
import {
  addTransaction,
  checkedTransaction,
  clearCompletedTransactions,
  clearAllTransactions,
  finalizeTransaction,
  removeTransaction,
  updateTransaction,
  SerializableTransactionReceipt,
  serializeLegacyTransaction
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
  chainId?: ChainId
  hash: string
  approval?: { tokenAddress: string; spender: string }
  summary?: string
  claim?: { recipient: string }
  receipt?: SerializableTransactionReceipt
  processed?: BundleProcessed // swaps
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  deadline?: number
  from: string
  swap?: SwapReq
  blockNumber?: number // from transaction diagnosis
  status?: Status | string
  message?: string
  cancel?: Status | string
  flashbotsResolution?: string
  mistxDiagnosis?: Diagnosis
  updatedAt?: number
  inputAmount?: AmountDetails
  outputAmount?: AmountDetails
  wrapType?: WrapType
  legacyRawV1?: any
}

export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: TransactionDetails
  }
}

const LegacyStatusMap: { [key: string]: string } = {
  PENDING_TRANSACTION: 'PENDING_BUNDLE',
  FAILED_TRANSACTION: 'FAILED_BUNDLE',
  SUCCESSFUL_TRANSACTION: 'SUCCESSFUL_BUNDLE',
  CANCEL_TRANSACTION_SUCCESSFUL: 'CANCEL_BUNDLE_SUCCESSFUL',
  BUNDLE_NOT_FOUND: 'BUNDLE_NOT_FOUND'
}

const LegacyMessageMap: { [key: string]: string } = {
  PENDING_BUNDLE: '',
  FAILED_BUNDLE: '',
  SUCCESSFUL_BUNDLE: '',
  CANCEL_TRANSACTION_SUCCESSFUL: 'Bundle canceled successfully'
}

function SerializeLegacyTransaction(transaction: any): TransactionDetails | undefined {
  const { processed } = transaction
  if (processed && processed.serializedSwap) {
    const transactions: TransactionProcessed[] = []
    const bundleSerialized = processed.serializedApprove ? processed.serializedApprove : processed.serializedSwap
    if (processed.serializedApprove) {
      transactions.push({
        bundle: bundleSerialized,
        estimatedEffectiveGasPrice: 0,
        estimatedGas: 25000,
        serialized: processed.serializedApprove,
        raw: undefined
      })
    }
    transactions.push({
      bundle: bundleSerialized,
      estimatedEffectiveGasPrice: processed.estimatedEffectiveGasPrice,
      estimatedGas: processed.estimatedGas,
      serialized: processed.serializedSwap,
      raw: {
        amount0: processed.swap.amount0,
        amount1: processed.swap.amount1,
        path: processed.swap.path,
        to: processed.swap.to
      }
    })
    const serialized: TransactionDetails = {
      chainId: 1,
      hash: transaction.hash,
      summary: transaction.summary,
      addedTime: transaction.addedTime,
      updatedAt: transaction.updatedAt,
      from: transaction.from,
      status: LegacyStatusMap[transaction.status],
      inputAmount: transaction.inputAmount,
      outputAmount: transaction.outputAmount,
      lastCheckedBlockNumber: transaction.lastCheckedBlockNumber,
      message: LegacyMessageMap[LegacyStatusMap[transaction.status]],
      processed: {
        bribe: processed.bribe,
        serialized: bundleSerialized,
        chainId: 1,
        deadline: processed.swap.deadline,
        from: processed.from,
        sessionToken: processed.sessionToken,
        simulateOnly: false,
        timestamp: processed.timestamp,
        totalEstimatedEffectiveGasPrice: processed.estimatedEffectiveGasPrice,
        totalEstimatedGas: processed.estimatedGas,
        transactions: transactions
      },
      legacyRawV1: transaction
    }
    if (transaction.cancel) {
      serialized.cancel = LegacyStatusMap[transaction.cancel]
    }
    if (transaction.receipt) {
      serialized.receipt = transaction.receipt
    }
    return serialized
  } else {
    return undefined
  }
}

export const initialState: TransactionState = {}

export default createReducer(initialState, builder =>
  builder
    .addCase(
      addTransaction,
      (
        transactions,
        { payload: { chainId, from, hash, summary, claim, trade, wrapType, inputAmount, outputAmount, deadline } }
      ) => {
        const tx = transactions[chainId]?.[hash] as TransactionDetails
        if (tx && isPendingTransaction(tx)) {
          throw Error('Attempted to add existing transaction.')
        }

        const input = trade ? trade.inputAmount : inputAmount
        const output = trade ? trade.outputAmount : outputAmount

        const txs = transactions[chainId] ?? {}
        txs[hash] = {
          chainId,
          hash,
          summary,
          claim,
          deadline,
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
            bundle,
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
        if (bundle) tx.processed = bundle
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
    .addCase(serializeLegacyTransaction, (transactions, { payload: { legacyTransaction } }) => {
      const transaction = SerializeLegacyTransaction(legacyTransaction)
      if (transaction && transaction.chainId && transaction.hash) {
        const tx = transactions[transaction.chainId]?.[transaction.hash]
        if (!tx) {
          return
        }
        const txs = transactions[transaction.chainId] ?? {}
        txs[transaction.hash] = transaction
        transactions[transaction.chainId] = txs
      }
    })
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
