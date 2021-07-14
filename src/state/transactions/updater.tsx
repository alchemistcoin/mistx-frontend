import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveWeb3React } from '../../hooks'
import { useAddPopup, useBlockNumber } from '../application/hooks'
import { AppDispatch, AppState } from '../index'
import { checkedTransaction, finalizeTransaction } from './actions'
import FATHOM_GOALS from '../../constants/fathom'
import { TransactionDetails } from './reducer'
import { TransactionProcessed } from '../../websocket'

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

// {
// 	"hash": "0xb336a3bff6d8d3b6a27b5050a0d4dabe87db21da5d7bb13df32adf397370d88d",
// 	"summary": "Swap 0.0909 ETH for 4.02 MIST",
// 	"from": "0x9cB6b7BBfb0A95458766c5DBdfdc4515c92bD417",
// 	"addedTime": 1626290013169,
// 	"inputAmount": {
// 		"currency": {
// 			"decimals": 18,
// 			"symbol": "ETH",
// 			"name": "Ether"
// 		},
// 		"value": "0.09091"
// 	},
// 	"outputAmount": {
// 		"currency": {
// 			"chainId": 1,
// 			"address": "0x88ACDd2a6425c3FaAE4Bc9650Fd7E27e0Bebb7aB",
// 			"decimals": 18,
// 			"symbol": "MIST",
// 			"name": "Alchemist"
// 		},
// 		"value": "4.029"
// 	},
// 	"processed": {
// 		"serializedSwap": "0xf901ae73808308647094a58f22e0766b3764376c92915ba545d583c19dbc880142fe8d0e698df5b90144982ea0200000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000001be1e88323a0000000000000000000000000000000000000000000000000000142fe8d0e698df500000000000000000000000000000000000000000000000037a4c7c60d40828d00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000009cb6b7bbfb0a95458766c5dbdfdc4515c92bd4170000000000000000000000000000000000000000000000000000000060ef3bfb0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000088acdd2a6425c3faae4bc9650fd7e27e0bebb7ab26a02216a652539c6ef94f93b75b027016dc7444dcf81d2211057908aa8876d3c34ea063a8a92b25d2c317df4a84e53a41812e1677085f02b444ad07ddd33add80c4ca",
// 		"swap": {
// 			"amount0": "0x0142fe8d0e698df5",
// 			"amount1": "0x37a4c7c60d40828d",
// 			"path": ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", "0x88ACDd2a6425c3FaAE4Bc9650Fd7E27e0Bebb7aB"],
// 			"deadline": "0x60ef3bfb",
// 			"to": "0x9cB6b7BBfb0A95458766c5DBdfdc4515c92bD417"
// 		},
// 		"bribe": "0x1be1e88323a000",
// 		"routerAddress": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
// 		"timestamp": 1626290013405,
// 		"sessionToken": "8f08901950b664904d43421f3eb42e25",
// 		"chainId": 1,
// 		"estimatedGas": 151393,
// 		"estimatedEffectiveGasPrice": 51.84,
// 		"from": "0x9cB6b7BBfb0A95458766c5DBdfdc4515c92bD417",
// 		"simulateOnly": false
// 	},
// 	"status": "SUCCESSFUL_TRANSACTION",
// 	"updatedAt": 1626290062153,
// 	"message": "",
// 	"lastCheckedBlockNumber": 12826923,
// 	"receipt": {
// 		"blockHash": "0x3b6ace1f78c8d6e2a91a68787a46d9c1734451a1e4591b8517ef13652ecd6278",
// 		"blockNumber": 12826924,
// 		"contractAddress": null,
// 		"from": "0x9cB6b7BBfb0A95458766c5DBdfdc4515c92bD417",
// 		"status": 1,
// 		"to": "0xA58f22e0766B3764376c92915BA545d583c19DBc",
// 		"transactionHash": "0xb336a3bff6d8d3b6a27b5050a0d4dabe87db21da5d7bb13df32adf397370d88d",
// 		"transactionIndex": 4
// 	},
// 	"confirmedTime": 1626290070195
// }

const LegacyStatusMap: { [key: string]: string } = {
  PENDING_TRANSACTION: 'PENDING_BUNDLE',
  FAILED_TRANSACTION: 'FAILED_BUNDLE',
  SUCCESSFUL_TRANSACTION: 'SUCCESSFUL_BUNDLE',
  CANCEL_TRANSACTION_SUCCESSFUL: 'CANCEL_BUNDLE_SUCCESSFUL',
  BUNDLE_NOT_FOUND: 'BUNDLE_NOT_FOUND'
}

function isLegacyTransaction(transaction: any): boolean {
  if (transaction.processed && transaction.processed.serializedSwap) return true
  return false
}

function serializeLegacyTransaction(transaction: any): TransactionDetails {
  const { processed } = transaction
  if (processed && processed.serializedSwap) {
    const transactions: TransactionProcessed[] = []
    const bundleSerialized = processed.serializedApprove ? processed.serializedApprove : processed.serializedSwap
    const raw = {
      amount0: processed.swap.amount0,
      amount1: processed.swap.amount1,
      path: processed.swap.path,
      to: processed.swap.to
    }
    if (processed.serializedApprove) {
      transactions.push({
        bundle: bundleSerialized,
        estimatedEffectiveGasPrice: 0,
        estimatedGas: 25000,
        serialized: processed.serializedApprove,
        raw: raw
      })
    }
    transactions.push({
      bundle: bundleSerialized,
      estimatedEffectiveGasPrice: processed.estimatedEffectiveGasPrice,
      estimatedGas: processed.estimatedGas,
      serialized: processed.serializedSwap,
      raw: raw
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
      message: transaction.message,
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
      }
    }
    if (transaction.cancel) {
      serialized.cancel = LegacyStatusMap[transaction.cancel]
    }
    if (transaction.receipt) {
      serialized.receipt = transaction.receipt
    }
    console.log('serializeLegacyTransaction', serialized)
    return serialized
  } else {
    return transaction as TransactionDetails
  }
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

  // Serialize legacy transactions to new format
  useEffect(() => {
    if (!checkedForLegacyTransactions && Object.keys(transactions).length) {
      Object.keys(transactions).forEach(key => {
        const transaction = transactions[key]
        if (isLegacyTransaction(transaction)) {
          serializeLegacyTransaction(transaction)
        }
      })
      setCheckedForLegacyTransactions(true)
    }
  }, [transactions, checkedForLegacyTransactions])

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
