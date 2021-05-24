import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ChainId, CurrencyAmount } from '@alchemistcoin/sdk'
import { useActiveWeb3React } from '../../hooks'
import { AppDispatch, AppState } from '../index'
import { addTransaction, removeTransaction, updateTransaction } from './actions'
import { TransactionDetails } from './reducer'
import { useAddPopup } from 'state/application/hooks'
import { Diagnosis, emitTransactionCancellation, Status, TransactionProcessed } from 'websocket'

interface TransactionResponseIdentifier {
  chainId: ChainId
  hash: string
  serializedApprove?: string
  serializedSwap?: string
}

interface TransactionResponseUnsentData {
  summary?: string
  approval?: {
    tokenAddress: string
    spender: string
  }
  claim?: {
    recipient: string
  }
  inputAmount?: CurrencyAmount
  outputAmount?: CurrencyAmount
}

// helper that can take a ethers library transaction response and add it to the list of transactions
export function useTransactionAdder(): (
  response: TransactionResponseIdentifier,
  customData?: TransactionResponseUnsentData
) => void {
  const { chainId, account } = useActiveWeb3React()
  const addPopup = useAddPopup()
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (
      response: TransactionResponseIdentifier,
      {
        summary,
        claim,
        inputAmount,
        outputAmount
      }: {
        summary?: string
        claim?: { recipient: string }
        approval?: { tokenAddress: string; spender: string }
        inputAmount?: CurrencyAmount
        outputAmount?: CurrencyAmount
      } = {}
    ) => {
      if (!account) return
      if (!chainId) return

      const { hash } = response
      if (!hash) {
        throw Error('No transaction hash found.')
      }
      dispatch(
        addTransaction({
          hash,
          from: account,
          chainId: chainId ?? response.chainId,
          summary,
          claim,
          inputAmount,
          outputAmount
        })
      )
      addPopup(
        {
          txn: {
            hash,
            pending: true,
            success: false,
            summary
          }
        },
        hash
      )
    },
    [addPopup, dispatch, chainId, account]
  )
}

export function useTransactionUpdater(): (
  response: TransactionResponseIdentifier,
  customData?: {
    transaction?: TransactionProcessed
    status?: Status
    message?: string
    blockNumber?: number
    flashbotsResolution?: string
    mistxDiagnosis?: Diagnosis
  }
) => void {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    async (
      response: TransactionResponseIdentifier,
      {
        transaction,
        message,
        status,
        blockNumber,
        flashbotsResolution,
        mistxDiagnosis
      }: {
        transaction?: TransactionProcessed
        message?: string
        status?: Status
        blockNumber?: number
        flashbotsResolution?: string
        mistxDiagnosis?: Diagnosis
      } = {}
    ) => {
      // update state differently for Transaction Cancellation
      if (status?.includes('CANCEL')) {
        dispatch(
          updateTransaction({
            hash: response.hash,
            chainId: response.chainId,
            transaction,
            cancel: status,
            status:
              status === Status.CANCEL_TRANSACTION_SUCCESSFUL
                ? Status.FAILED_TRANSACTION
                : status === Status.CANCEL_TRANSACTION_FAILED && message?.includes('already completed')
                ? Status.SUCCESSFUL_TRANSACTION
                : undefined,
            message
          })
        )
      } else {
        // normal state update for transaction changes
        dispatch(
          updateTransaction({
            hash: response.hash,
            chainId: response.chainId,
            transaction,
            status,
            message,
            blockNumber,
            flashbotsResolution,
            mistxDiagnosis,
            updatedAt: new Date().getTime()
          })
        )
      }
    },
    [dispatch]
  )
}

export function useTransactionCanceller() {
  const { account } = useActiveWeb3React()
  return useCallback(
    async (
      response: TransactionResponseIdentifier,
      {
        transaction,
        message,
        status
      }: {
        transaction: TransactionProcessed
        message?: string
        status?: string
      }
    ) => {
      if (!account) return

      emitTransactionCancellation({
        chainId: transaction.chainId,
        serializedSwap: transaction.serializedSwap,
        serializedApprove: transaction.serializedApprove,
        swap: transaction.swap,
        bribe: transaction.bribe,
        routerAddress: transaction.routerAddress,
        estimatedEffectiveGasPrice: transaction.estimatedEffectiveGasPrice,
        estimatedGas: transaction.estimatedGas,
        from: account
      })
    },
    [account]
  )
}

export function useTransactionRemover(): (response: { chainId: ChainId; hash: string }) => void {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (response: { chainId: ChainId; hash: string }) => {
      dispatch(
        removeTransaction({
          chainId: response.chainId,
          hash: response.hash
        })
      )
    },
    [dispatch]
  )
}

// returns all the transactions for the current chain
export function useAllTransactions(): { [txHash: string]: TransactionDetails } {
  const { chainId } = useActiveWeb3React()

  const state = useSelector<AppState, AppState['transactions']>(state => state.transactions)

  return chainId ? state[chainId] ?? {} : {}
}

export function useIsTransactionPending(transactionHash?: string): boolean {
  const transactions = useAllTransactions()

  if (!transactionHash || !transactions[transactionHash]) return false

  const transaction = transactions[transactionHash]

  return (
    transaction.status === Status.PENDING_TRANSACTION ||
    (typeof transaction.status === 'undefined' && !transaction.receipt)
  )
}

export function isPendingTransaction(tx: TransactionDetails): boolean {
  return !!(tx.status !== Status.FAILED_TRANSACTION && tx.status !== Status.SUCCESSFUL_TRANSACTION && !tx.receipt)
}

export function usePendingTransactions(): { [txHash: string]: TransactionDetails } {
  const transactions = useAllTransactions()

  return useMemo(() => {
    let transaction: TransactionDetails
    return Object.keys(transactions).reduce((txs: { [txHash: string]: TransactionDetails }, hash: string) => {
      transaction = transactions[hash]
      if (isPendingTransaction(transaction)) {
        txs[hash] = transaction
      }
      return txs
    }, {})
  }, [transactions])
}

export function useHasPendingTransactions(): boolean {
  const transactions = useAllTransactions()

  return useMemo(() => {
    let transaction: TransactionDetails
    console.log('transactions', transactions)
    return Object.keys(transactions).some(hash => {
      transaction = transactions[hash]
      return isPendingTransaction(transaction)
    })
  }, [transactions])
}

export function isSuccessfulTransaction(tx: TransactionDetails): boolean {
  return !!(tx.status === Status.SUCCESSFUL_TRANSACTION || tx.receipt?.status === 1)
}

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param tx to check for recency
 */
export function isTransactionRecent(tx: TransactionDetails): boolean {
  return new Date().getTime() - tx.addedTime < 86_400_000
}

// returns whether a token has a pending approval transaction
export function useHasPendingApproval(tokenAddress: string | undefined, spender: string | undefined): boolean {
  const allTransactions = useAllTransactions()
  return useMemo(
    () =>
      typeof tokenAddress === 'string' &&
      typeof spender === 'string' &&
      Object.keys(allTransactions).some(hash => {
        const tx = allTransactions[hash]
        if (!tx) return false
        if (tx.receipt) {
          return false
        } else {
          const approval = tx.approval
          if (!approval) return false
          return approval.spender === spender && approval.tokenAddress === tokenAddress && isTransactionRecent(tx)
        }
      }),
    [allTransactions, spender, tokenAddress]
  )
}
