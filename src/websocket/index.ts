import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { io, Socket } from 'socket.io-client'
import { BigNumberish } from '@ethersproject/bignumber'
import { keccak256 } from '@ethersproject/keccak256'
import { updateSocketStatus } from '../state/application/actions'
import PJSON from '../../package.json'
import { MANUAL_CHECK_TX_STATUS_INTERVAL } from '../constants'
import FATHOM_GOALS from '../constants/fathom'

// state
import { updateGas } from '../state/application/actions'
import { Gas } from '../state/application/reducer'
import { useSocketStatus, useNewAppVersionAvailable } from '../state/application/hooks'
import {
  useAllTransactions,
  useTransactionRemover,
  useTransactionUpdater,
  usePendingTransactions
} from 'state/transactions/hooks'

import { useAddPopup } from 'state/application/hooks'
import { BigNumber } from 'ethers'

export enum Event {
  GAS_CHANGE = 'GAS_CHANGE',
  SOCKET_SESSION_RESPONSE = 'SOCKET_SESSION',
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
export interface TransactionRes {
  transaction: TransactionProcessed
  status: Status
  message: string
  error: string
}
export interface TransactionDiagnosisRes {
  transaction: TransactionProcessed
  blockNumber: number
  flashbotsResolution: string
  mistxDiagnosis: Diagnosis
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
interface BundleRes {
  bundle: BundleProcessed
  status: string
  message: string
  error: string
}

interface BundleStatusRes {
  bundle: string // BundleProcessed.serialized
  status: string
  message: string
  error: string
}
interface QuoteEventsMap {
  [Event.SOCKET_SESSION_RESPONSE]: (response: SocketSession) => void
  [Event.SOCKET_ERR]: (err: any) => void
  [Event.GAS_CHANGE]: (response: Gas) => void
  [Event.MISTX_BUNDLE_REQUEST]: (response: any) => void
  [Event.BUNDLE_RESPONSE]: (response: BundleRes) => void
  [Event.BUNDLE_CANCEL_REQUEST]: (serialized: any) => void // TO DO - any
  [Event.BUNDLE_STATUS_REQUEST]: (serialized: any) => void // TO DO - any
  [Event.BUNDLE_STATUS_RESPONSE]: (serialized: BundleStatusRes) => void // TO DO - any
}

const tokenKey = `SESSION_TOKEN`
const token = localStorage.getItem(tokenKey)
const serverUrl = (process.env.REACT_APP_SERVER_URL as string) || 'http://localhost:4000'

const socket: Socket<QuoteEventsMap, QuoteEventsMap> = io(serverUrl, {
  transports: ['websocket'],
  auth: { token },
  reconnection: true,
  reconnectionDelay: 5000,
  autoConnect: true
})

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

export default function Sockets(): null {
  const dispatch = useDispatch()
  const addPopup = useAddPopup()
  const allTransactions = useAllTransactions()
  const updateTransaction = useTransactionUpdater()
  const removeTransaction = useTransactionRemover()
  const pendingTransactions = usePendingTransactions()
  const webSocketConnected = useSocketStatus()
  const [newAppVersionAvailable, setNewAppVersionAvailable] = useNewAppVersionAvailable()
  console.log('pendingTransactions', pendingTransactions)

  useEffect(() => {
    socket.on('connect', () => {
      // console.log('websocket connected')
      dispatch(updateSocketStatus(true))
    })

    socket.on('connect_error', err => {
      // console.log('websocket connect error', err)
      dispatch(updateSocketStatus(false))
    })

    socket.on('disconnect', err => {
      // console.log('websocket disconnect', err)
      dispatch(updateSocketStatus(false))
    })

    socket.on(Event.SOCKET_ERR, err => {
      // console.log('websocket err', err)
      if (err.event === Event.MISTX_BUNDLE_REQUEST) {
        const bundleResponse = err.data as BundleRes
        const hash = keccak256(bundleResponse.bundle.serialized)
        removeTransaction({
          chainId: bundleResponse.bundle.chainId,
          hash
        })
      }
    })

    socket.on(Event.SOCKET_SESSION_RESPONSE, session => {
      const { token, version } = session
      localStorage.setItem(tokenKey, token)

      // check client version and notify user to refresh page
      // if the client version is not equal to the version.client
      // received in the session payload
      if (!newAppVersionAvailable && version && PJSON && version.client !== PJSON.version) {
        setNewAppVersionAvailable(true)
      } else if (newAppVersionAvailable) {
        setNewAppVersionAvailable(false)
      }
    })

    socket.on(Event.GAS_CHANGE, gas => {
      dispatch(updateGas(gas))
    })

    socket.on(Event.BUNDLE_STATUS_RESPONSE, response => {
      const { bundle, status } = response
      const hash = keccak256(bundle)
      const tx = allTransactions?.[hash]
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
    })

    socket.on(Event.BUNDLE_RESPONSE, response => {
      const hash = keccak256(response.bundle.serialized)
      const tx = allTransactions?.[hash]
      const summary = tx?.summary
      const previouslyCompleted = tx?.status !== Status.PENDING_BUNDLE && tx?.receipt
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
    })

    // TO DO
    //socket.on(Event.TRANSACTION_DIAGNOSIS, diagnosis => {
    // // console.log('- log transaction diagnosis', diagnosis)
    // const hash = keccak256(diagnosis.transaction.serializedSwap)
    // const transactionId = {
    //   chainId: diagnosis.transaction.chainId,
    //   hash
    // }
    // updateTransaction(transactionId, {
    //   blockNumber: diagnosis.blockNumber,
    //   flashbotsResolution: diagnosis.flashbotsResolution,
    //   mistxDiagnosis: diagnosis.mistxDiagnosis,
    //   updatedAt: new Date().getTime()
    // })
    //})

    return () => {
      socket.off('connect')
      socket.off('connect_error')
      socket.off(Event.SOCKET_ERR)
      socket.off(Event.SOCKET_SESSION_RESPONSE)
      socket.off(Event.GAS_CHANGE)
      socket.off(Event.BUNDLE_RESPONSE)
      socket.off(Event.BUNDLE_STATUS_REQUEST)
      // TO DO
    }
  }, [
    addPopup,
    dispatch,
    allTransactions,
    removeTransaction,
    updateTransaction,
    newAppVersionAvailable,
    setNewAppVersionAvailable
  ])

  // Check each pending transaction every x seconds and fetch an update if the time passed since the last update is more than MANUAL_CHECK_TX_STATUS_INTERVAL (seconds)
  // TO DO - We need chainId and processed.swap.deadline
  useEffect(() => {
    let interval: any
    clearInterval(interval)
    if (pendingTransactions) {
      interval = setInterval(() => {
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
              socket.emit(Event.BUNDLE_STATUS_REQUEST, {
                serialized: tx.processed.serialized
              })
            }
          }
        })
      }, 5000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [pendingTransactions, updateTransaction, webSocketConnected])

  return null
}

export function emitTransactionRequest(bundle: BundleReq) {
  socket.emit(Event.MISTX_BUNDLE_REQUEST, bundle)
}

export function emitTransactionCancellation(serialized: any) {
  // TO DO any
  socket.emit(Event.BUNDLE_CANCEL_REQUEST, { serialized })
}
