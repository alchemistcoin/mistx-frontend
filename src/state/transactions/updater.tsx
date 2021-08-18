import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveWeb3React } from '../../hooks'
import { useAddPopup, useBlockNumber } from '../application/hooks'
import { AppDispatch, AppState } from '../index'
import { checkedTransaction, finalizeTransaction, serializeLegacyTransaction } from './actions'
import FATHOM_GOALS from '../../constants/fathom'

export function shouldCheck(
  lastBlockNumber: number,
  tx: { addedTime: number; receipt?: {}; lastCheckedBlockNumber?: number }
): boolean {
  if (tx.receipt) return false
  if (!tx.lastCheckedBlockNumber) return true
  const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber
  if (blocksSinceCheck < 1) return false
  const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60
  if (minutesPending > 60) {
    // every 10 blocks if pending for longer than an hour
    return blocksSinceCheck > 9
  } else if (minutesPending > 5) {
    // every 3 blocks if pending more than 5 minutes
    return blocksSinceCheck > 2
  } else {
    // otherwise every block
    return true
  }
}

function isLegacyTransaction(transaction: any): boolean {
  if (
    transaction.processed &&
    !transaction.processed.id &&
    (transaction.processed.serializedSwap || transaction.processed.serialized)
  )
    return true
  return false
}

export default function Updater(): null {
  const { chainId, library } = useActiveWeb3React()

  const lastBlockNumber = useBlockNumber()

  const [checkedForLegacyTransactions, setCheckedForLegacyTransactions] = useState<boolean>(false)
  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector<AppState, AppState['transactions']>(state => state.transactions)

  const transactions = useMemo(() => {
    return chainId ? state[chainId] ?? {} : {}
  }, [chainId, state])

  // show popup on confirm
  const addPopup = useAddPopup()

  // Serialize legacy transactions to new format once
  useEffect(() => {
    if (!checkedForLegacyTransactions && Object.keys(transactions).length) {
      Object.keys(transactions).forEach(key => {
        const transaction = transactions[key]
        if (isLegacyTransaction(transaction)) {
          dispatch(serializeLegacyTransaction({ legacyTransaction: transaction }))
        }
      })
      setCheckedForLegacyTransactions(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions])

  useEffect(() => {
    if (!chainId || !library || !lastBlockNumber) return

    Object.keys(transactions)
      .filter(hash => shouldCheck(lastBlockNumber, transactions[hash]))
      .forEach(hash => {
        library
          .getTransactionReceipt(hash)
          .then(receipt => {
            if (receipt) {
              dispatch(
                finalizeTransaction({
                  chainId,
                  hash,
                  receipt: {
                    blockHash: receipt.blockHash,
                    blockNumber: receipt.blockNumber,
                    contractAddress: receipt.contractAddress,
                    from: receipt.from,
                    status: receipt.status,
                    to: receipt.to,
                    transactionHash: receipt.transactionHash,
                    transactionIndex: receipt.transactionIndex
                  }
                })
              )
              if (
                transactions[hash] &&
                transactions[hash].inputAmount?.currency.symbol === 'ETH' &&
                transactions[hash].outputAmount?.currency.symbol === 'WETH' &&
                window.fathom
              ) {
                window.fathom.trackGoal(FATHOM_GOALS.WRAP_COMPLETE, 0)
              }
              if (
                transactions[hash] &&
                transactions[hash].inputAmount?.currency.symbol === 'WETH' &&
                transactions[hash].outputAmount?.currency.symbol === 'ETH' &&
                window.fathom
              ) {
                window.fathom.trackGoal(FATHOM_GOALS.UNWRAP_COMPLETE, 0)
              }
            } else {
              dispatch(checkedTransaction({ chainId, hash, blockNumber: lastBlockNumber }))
            }
          })
          .catch(error => {
            console.error(`failed to check transaction hash: ${hash}`, error)
          })
      })
  }, [chainId, library, transactions, lastBlockNumber, dispatch, addPopup])

  return null
}
