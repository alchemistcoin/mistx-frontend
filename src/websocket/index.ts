import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { BigNumberish } from '@ethersproject/bignumber'
import { keccak256 } from '@ethersproject/keccak256'
import { updateSocketStatus } from '../state/application/actions'
import PJSON from '../../package.json'
import { MANUAL_CHECK_TX_STATUS_INTERVAL } from '../constants'
import FATHOM_GOALS from '../constants/fathom'
import { BundleRes, MistxSocket } from '@alchemist-coin/mistx-connect'

// state
import { updateGas } from '../state/application/actions'
import { useSocketStatus, useNewAppVersionAvailable } from '../state/application/hooks'
import {
  useAllTransactions,
  useTransactionRemover,
  useTransactionUpdater,
  usePendingTransactions,
  useGetBundleByID
} from 'state/transactions/hooks'

import { useAddPopup } from 'state/application/hooks'
import { BigNumber } from 'ethers'

export enum Event {
  GAS_CHANGE = 'GAS_CHANGE',
  SOCKET_SESSION = 'SOCKET_SESSION',
  SOCKET_ERR = 'SOCKET_ERR',
  MISTX_BUNDLE_REQUEST = 'MISTX_BUNDLE_REQUEST',
  BUNDLE_STATUS_REQUEST = 'BUNDLE_STATUS_REQUEST',
  BUNDLE_STATUS_RESPONSE = 'BUNDLE_STATUS_RESPONSE',
  BUNDLE_RESPONSE = 'BUNDLE_RESPONSE',
  BUNDLE_CANCEL_REQUEST = 'BUNDLE_CANCEL_REQUEST'
}

export enum Status {
  PENDING_BUNDLE = 'PENDING_BUNDLE',
  FAILED_BUNDLE = 'FAILED_BUNDLE',
  SUCCESSFUL_BUNDLE = 'SUCCESSFUL_BUNDLE',
  CANCEL_BUNDLE_SUCCESSFUL = 'CANCEL_BUNDLE_SUCCESSFUL',
  BUNDLE_NOT_FOUND = 'BUNDLE_NOT_FOUND'
}

export const STATUS_LOCALES: Record<string, string> = {
  PENDING_BUNDLE: 'Flashbots working on including your swap',
  FAILED_BUNDLE: 'Failed',
  SUCCESSFUL_BUNDLE: 'Success',
  CANCEL_BUNDLE_SUCCESSFUL: 'Cancelled',
  BUNDLE_NOT_FOUND: 'Failed'
}

export enum Diagnosis {
  LOWER_THAN_TAIL = 'LOWER_THAN_TAIL',
  NOT_A_FLASHBLOCK = 'NOT_A_FLASHBLOCK',
  BUNDLE_OUTBID = 'BUNDLE_OUTBID',
  ERROR_API_BEHIND = 'ERROR_API_BEHIND',
  MISSING_BLOCK_DATA = 'MISSING_BLOCK_DATA',
  ERROR_UNKNOWN = 'ERROR_UNKNOWN'
}

export interface MistXVersion {
  api: string
  client: string
}

export interface SocketSession {
  token: string
  version: MistXVersion | undefined
}

export interface TransactionReq {
  serialized: string // serialized transaction
  raw: SwapReq | undefined // raw def. of each type of trade
  estimatedGas?: number
  estimatedEffectiveGasPrice?: number
}
export interface TransactionProcessed {
  serialized: string // serialized transaction
  bundle: string // bundle.serialized
  raw: SwapReq | undefined // raw def. of each type of trade
  estimatedGas: number
  estimatedEffectiveGasPrice: number
}
export interface BundleReq {
  transactions: TransactionReq[]
  chainId: number
  bribe: string // BigNumber
  from: string
  deadline: BigNumberish
  simulateOnly: boolean
}
export interface SwapReq {
  amount0: BigNumberish
  amount1: BigNumberish
  path: Array<string>
  to: string
}
export interface BundleProcessed {
  serialized: string
  transactions: TransactionProcessed[]
  bribe: BigNumberish
  sessionToken: string
  chainId: number
  timestamp: number // EPOCH,
  totalEstimatedGas: number
  totalEstimatedEffectiveGasPrice: number
  from: string
  deadline: BigNumberish
  simulateOnly: boolean
}

function bundleResponseToastStatus(bundle: BundleRes) {
  let pending = false
  let success = false
  let message = bundle.message

  switch (bundle.status) {
    case Status.FAILED_BUNDLE:
      message = 'Transaction failed - No Fee Taken'
      break
    case Status.PENDING_BUNDLE:
      pending = true
      break
    case Status.SUCCESSFUL_BUNDLE:
      message = 'Successful Transaction'
      success = true
      break
    case Status.CANCEL_BUNDLE_SUCCESSFUL:
      message = 'Transaction Cancelled - For Free'
      success = true
      break
    case Status.BUNDLE_NOT_FOUND:
      message = 'Transaction failed - No Fee Taken'
      break
    default:
      pending = true
      break
  }

  return {
    pending,
    success,
    message,
    status: bundle.status
  }
}

function getHashWithFallback(bundle: BundleProcessed) {
  const serializedTx = bundle.transactions[bundle.transactions.length - 1].serialized
  const serializedFallback = bundle.transactions[0].serialized

  if (serializedTx === serializedFallback) return [keccak256(serializedTx)]

  return [keccak256(serializedTx), keccak256(serializedFallback)]
}

const serverUrl = (process.env.REACT_APP_SERVER_URL as string) || 'http://localhost:4000'

const socket = new MistxSocket(serverUrl)

export default function Sockets(): null {
  const updateTxReqInterval = useRef<any>(null)
  const dispatch = useDispatch()
  const addPopup = useAddPopup()
  const allTransactions = useAllTransactions()
  const updateTransaction = useTransactionUpdater()
  const removeTransaction = useTransactionRemover()
  const pendingTransactions = usePendingTransactions()
  const webSocketConnected = useSocketStatus()
  const getBundleByID = useGetBundleByID()
  const [newAppVersionAvailable, setNewAppVersionAvailable] = useNewAppVersionAvailable()

  useEffect(() => {
    const disconnect = socket.init({
      onConnect: () => {
        // console.log('websocket connected')
        dispatch(updateSocketStatus(true))
      },
      onConnectError: err => {
        // console.log('websocket connect error', err)
        dispatch(updateSocketStatus(false))
      },
      onDisconnect: err => {
        // console.log('websocket disconnect', err)
        dispatch(updateSocketStatus(false))
      },
      onError: err => {
        // console.log('websocket err', err)
        if (err.event === Event.MISTX_BUNDLE_REQUEST) {
          const bundleResponse = err.data as BundleRes
          const [hash, hashFallback] = getHashWithFallback(bundleResponse.bundle)

          if (allTransactions?.[hash]) {
            removeTransaction({
              chainId: bundleResponse.bundle.chainId,
              hash
            })
          } else if (allTransactions?.[hashFallback]) { // legacy transactions
            removeTransaction({
              chainId: bundleResponse.bundle.chainId,
              hash: hashFallback
            })
          }
        }
      },
      onSocketSession: session => {
        const { version } = session
        // check client version and notify user to refresh page
        // if the client version is not equal to the version.client
        // received in the session payload
        if (!newAppVersionAvailable && version && PJSON && version.client !== PJSON.version) {
          setNewAppVersionAvailable(true)
        } else if (newAppVersionAvailable) {
          setNewAppVersionAvailable(false)
        }
      },
      onGasChange: gas => {
        dispatch(updateGas(gas))
      },
      onTransactionUpdate: response => {
        const { bundle: b, status } = response

        const bundle = b && typeof b === 'string' ? getBundleByID(b)?.processed : b
        const [hash, hashFallback] = getHashWithFallback(bundle as BundleProcessed)
        const tx = allTransactions?.[hash] ?? allTransactions?.[hashFallback]

        const previouslyCompleted = tx?.status !== Status.PENDING_BUNDLE && tx?.receipt
        if (!tx || !tx.chainId || previouslyCompleted) return
        const transactionId = {
          chainId: tx.chainId,
          hash
        }
        let message = response.message
        if (status === Status.BUNDLE_NOT_FOUND) {
          message = ''
        }
        updateTransaction(transactionId, {
          status: status,
          message: message,
          updatedAt: new Date().getTime()
        })
      },
      onTransactionResponse: response => {
        const [serializedTxHash, hashFallback] = getHashWithFallback(response.bundle)
        const tx = allTransactions?.[serializedTxHash] ?? allTransactions?.[hashFallback]
        const summary = tx?.summary
        const hash = tx?.hash
        const previouslyCompleted = tx?.status !== Status.PENDING_BUNDLE && tx?.receipt

        if (!hash) return

        const transactionId = {
          chainId: response.bundle.chainId,
          hash
        }

        if (response.status === Status.CANCEL_BUNDLE_SUCCESSFUL && window.fathom) {
          window.fathom.trackGoal(FATHOM_GOALS.CANCEL_COMPLETE, 0)
        }

        // TO DO - Handle response.status === BUNDLE_NOT_FOUND - ??
        if (!previouslyCompleted) {
          updateTransaction(transactionId, {
            bundle: response.bundle,
            message: response.message,
            status: response.status,
            updatedAt: new Date().getTime()
          })
          if (response.status === Status.SUCCESSFUL_BUNDLE && window.fathom) {
            window.fathom.trackGoal(FATHOM_GOALS.SWAP_COMPLETE, 0)
          }
          if (
            response.status === Status.SUCCESSFUL_BUNDLE ||
            response.status === Status.FAILED_BUNDLE ||
            response.status === Status.CANCEL_BUNDLE_SUCCESSFUL ||
            response.status === Status.BUNDLE_NOT_FOUND
          ) {
            addPopup(
              {
                txn: {
                  hash,
                  summary,
                  ...bundleResponseToastStatus(response)
                }
              },
              hash,
              60000
            )
          }
        }
      }
    })
    return () => {
      disconnect()
    }
  }, [
    addPopup,
    dispatch,
    allTransactions,
    getBundleByID,
    removeTransaction,
    updateTransaction,
    newAppVersionAvailable,
    setNewAppVersionAvailable
  ])

  // Check each pending transaction every x seconds and fetch an update if the time passed since the last update is more than MANUAL_CHECK_TX_STATUS_INTERVAL (seconds)
  // TO DO - We need chainId and processed.swap.deadline
  useEffect(() => {
    if (updateTxReqInterval.current) clearInterval(updateTxReqInterval.current)
    if (pendingTransactions && Object.keys(pendingTransactions).length) {
      updateTxReqInterval.current = setInterval(() => {
        if (!webSocketConnected) return
        const timeNow = new Date().getTime()
        Object.keys(pendingTransactions).forEach(hash => {
          const tx = pendingTransactions[hash]
          let isDead = false
          if (tx.deadline) {
            const deadline = BigNumber.from(tx.deadline || 1200).toNumber() * 1000
            if (deadline <= timeNow - MANUAL_CHECK_TX_STATUS_INTERVAL * 1000) isDead = true
          }
          if (tx.processed && isDead && tx.chainId) {
            const transactionId = {
              chainId: tx.chainId,
              hash
            }
            updateTransaction(transactionId, {
              bundle: tx.processed,
              message: 'Transaction Expired',
              status: Status.FAILED_BUNDLE,
              updatedAt: timeNow
            })
          } else if (tx.updatedAt) {
            // console.log('CHECK STATUS', tx)
            const secondsSinceLastUpdate = (timeNow - tx.updatedAt) / 1000
            if (secondsSinceLastUpdate > MANUAL_CHECK_TX_STATUS_INTERVAL && tx.processed) {
              // const transactionReq: TransactionProcessed = tx.processed
              socket.emitStatusRequest(tx.processed.serialized)
            }
          }
        })
      }, 5000)
    } else {
      clearInterval(updateTxReqInterval.current)
    }
    return () => {
      if (updateTxReqInterval.current) clearInterval(updateTxReqInterval.current)
    }
  }, [pendingTransactions, updateTransaction, webSocketConnected])

  return null
}

export function emitTransactionRequest(bundle: BundleReq) {
  socket.emitTransactionRequest(bundle)
}

export function emitTransactionCancellation(serialized: string) {
  // TO DO any
  socket.emitTransactionCancellation(serialized)
}
