import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { io, Socket } from 'socket.io-client'
import { BigNumberish, BigNumber } from '@ethersproject/bignumber'
import { keccak256 } from '@ethersproject/keccak256'
import { updateSocketStatus } from '../state/application/actions'
import { MANUAL_CHECK_TX_STATUS_INTERVAL } from '../constants'

// state
import { updateGas } from '../state/application/actions'
import { Gas } from '../state/application/reducer'
import {
  useAllTransactions,
  useTransactionRemover,
  useTransactionUpdater,
  usePendingTransactions
} from 'state/transactions/hooks'
import { ChainId } from '@alchemistcoin/sdk'
import { useAddPopup } from 'state/application/hooks'

export enum Event {
  GAS_CHANGE = 'GAS_CHANGE',
  SOCKET_SESSION_RESPONSE = 'SOCKET_SESSION',
  SOCKET_ERR = 'SOCKET_ERR',
  TRANSACTION_REQUEST = 'TRANSACTION_REQUEST',
  TRANSACTION_CANCEL_REQUEST = 'TRANSACTION_CANCEL_REQUEST',
  TRANSACTION_RESPONSE = 'TRANSACTION_RESPONSE',
  TRANSACTION_DIAGNOSIS = 'TRANSACTION_DIAGNOSIS',
  TRANSACTION_STATUS_REQUEST = 'TRANSACTION_STATUS_REQUEST',
  TRANSACTION_CANCEL_RESPONSE = 'TRANSACTION_CANCEL_RESPONSE'
}

export enum Status {
  PENDING_TRANSACTION = 'PENDING_TRANSACTION',
  FAILED_TRANSACTION = 'FAILED_TRANSACTION',
  SUCCESSFUL_TRANSACTION = 'SUCCESSFUL_TRANSACTION',
  CANCEL_TRANSACTION_SUCCESSFUL = 'CANCEL_TRANSACTION_SUCCESSFUL'
}

export enum Diagnosis {
  LOWER_THAN_TAIL = 'LOWER_THAN_TAIL',
  NOT_A_FLASHBLOCK = 'NOT_A_FLASHBLOCK',
  BUNDLE_OUTBID = 'BUNDLE_OUTBID',
  ERROR_API_BEHIND = 'ERROR_API_BEHIND',
  MISSING_BLOCK_DATA = 'MISSING_BLOCK_DATA',
  ERROR_UNKNOWN = 'ERROR_UNKNOWN'
}

export interface SocketSession {
  token: string
}
export interface SwapReq {
  amount0: BigNumberish
  amount1: BigNumberish
  path: Array<string>
  to: string
  deadline: string | string[]
}

export interface TransactionReq {
  chainId: ChainId
  serializedSwap: string
  serializedApprove: string | undefined
  swap: SwapReq
  bribe: BigNumberish
  routerAddress: string
  estimatedEffectiveGasPrice?: number
  estimatedGas?: number
  from: string
  timestamp?: number
}

export interface TransactionRes {
  transaction: TransactionProcessed
  status: Status
  message: string
  error: string
}

export interface TransactionProcessed {
  serializedSwap: string
  serializedApprove: string | undefined
  swap: SwapReq
  bribe: BigNumberish
  routerAddress: string
  estimatedEffectiveGasPrice: number
  estimatedGas: number
  timestamp: number // EPOCH
  sessionToken: string
  chainId: number
  simulateOnly: boolean
  from: string
}

export interface TransactionDiagnosisRes {
  transaction: TransactionProcessed
  blockNumber: number
  flashbotsResolution: string
  mistxDiagnosis: Diagnosis
}

interface QuoteEventsMap {
  [Event.SOCKET_SESSION_RESPONSE]: (response: SocketSession) => void
  [Event.SOCKET_ERR]: (err: any) => void
  [Event.GAS_CHANGE]: (response: Gas) => void
  [Event.TRANSACTION_REQUEST]: (response: TransactionReq) => void
  [Event.TRANSACTION_CANCEL_REQUEST]: (response: TransactionReq) => void
  [Event.TRANSACTION_RESPONSE]: (response: TransactionRes) => void
  [Event.TRANSACTION_DIAGNOSIS]: (response: TransactionDiagnosisRes) => void
  [Event.TRANSACTION_STATUS_REQUEST]: (response: TransactionReq) => void
  [Event.TRANSACTION_CANCEL_RESPONSE]: (response: any) => void
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

function transactionResToastStatus(transaction: TransactionRes) {
  let pending = false
  let success = false
  let message = transaction.message

  switch (transaction.status) {
    case Status.FAILED_TRANSACTION:
      break
    case Status.PENDING_TRANSACTION:
      pending = true
      break
    case Status.SUCCESSFUL_TRANSACTION:
      message = 'Successful Transaction'
      success = true
      break
    case Status.CANCEL_TRANSACTION_SUCCESSFUL:
      success = true
      break
    default:
      pending = true
      break
  }

  return {
    pending,
    success,
    message,
    status: transaction.status
  }
}

export default function Sockets(): null {
  const dispatch = useDispatch()
  const addPopup = useAddPopup()
  const allTransactions = useAllTransactions()
  const updateTransaction = useTransactionUpdater()
  const removeTransaction = useTransactionRemover()
  const pendingTransactions = usePendingTransactions()

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
      if (err.event === Event.TRANSACTION_REQUEST) {
        const transactionReq = err.data as TransactionReq
        const hash = keccak256(transactionReq.serializedSwap)
        removeTransaction({
          chainId: transactionReq.chainId,
          hash
        })
      }
    })

    socket.on(Event.SOCKET_SESSION_RESPONSE, session => {
      localStorage.setItem(tokenKey, session.token)
    })

    socket.on(Event.GAS_CHANGE, gas => {
      dispatch(updateGas(gas))
    })

    socket.on(Event.TRANSACTION_RESPONSE, transaction => {
      const hash = keccak256(transaction.transaction.serializedSwap)
      const tx = allTransactions?.[hash]
      const summary = tx?.summary
      const previouslyCompleted = tx?.status !== Status.PENDING_TRANSACTION && tx?.receipt

      const transactionId = {
        chainId: transaction.transaction.chainId,
        hash
      }

      if (!previouslyCompleted) {
        updateTransaction(transactionId, {
          transaction: transaction.transaction,
          message: transaction.message,
          status: transaction.status,
          updatedAt: new Date().getTime()
        })

        if (window.fathom) {
          if (tx?.status !== Status.SUCCESSFUL_TRANSACTION) {
            window.fathom.trackGoal(process.env.REACT_APP_FATHOM_SWAP_COMPLETE, 0)
          }
          if (tx?.status !== Status.CANCEL_TRANSACTION_SUCCESSFUL) {
            window.fathom.trackGoal(process.env.REACT_APP_FATHOM_CANCEL_COMPLETE, 0)
          }
        }

        addPopup(
          {
            txn: {
              hash,
              summary,
              ...transactionResToastStatus(transaction)
            }
          },
          hash,
          60000
        )
      }
    })

    socket.on(Event.TRANSACTION_DIAGNOSIS, diagnosis => {
      // console.log('- log transaction diagnosis', diagnosis)
      const hash = keccak256(diagnosis.transaction.serializedSwap)

      const transactionId = {
        chainId: diagnosis.transaction.chainId,
        hash
      }

      updateTransaction(transactionId, {
        blockNumber: diagnosis.blockNumber,
        flashbotsResolution: diagnosis.flashbotsResolution,
        mistxDiagnosis: diagnosis.mistxDiagnosis,
        updatedAt: new Date().getTime()
      })
    })

    return () => {
      socket.off('connect')
      socket.off('connect_error')
      socket.off(Event.SOCKET_ERR)
      socket.off(Event.SOCKET_SESSION_RESPONSE)
      socket.off(Event.GAS_CHANGE)
      socket.off(Event.TRANSACTION_RESPONSE)
      socket.off(Event.TRANSACTION_DIAGNOSIS)
    }
  }, [addPopup, dispatch, allTransactions, removeTransaction, updateTransaction])

  // Check each pending transaction every x seconds and fetch an update if the time passed since the last update is more than MANUAL_CHECK_TX_STATUS_INTERVAL (seconds)
  useEffect(() => {
    let interval: any
    clearInterval(interval)
    if (pendingTransactions) {
      interval = setInterval(() => {
        const timeNow = new Date().getTime()
        Object.keys(pendingTransactions).forEach(hash => {
          const tx = pendingTransactions[hash]
          let isDead = false
          if (tx.processed?.swap?.deadline) {
            const deadline = BigNumber.from(tx.processed?.swap?.deadline).toNumber() * 1000
            if (deadline <= timeNow - MANUAL_CHECK_TX_STATUS_INTERVAL * 1000) isDead = true
          }
          if (tx.processed && isDead) {
            const transactionId = {
              chainId: tx.processed.chainId,
              hash
            }
            updateTransaction(transactionId, {
              transaction: tx.processed,
              message: 'TX is detected as expired on FE',
              status: Status.FAILED_TRANSACTION,
              updatedAt: timeNow
            })
          } else if (tx.updatedAt) {
            const secondsSinceLastUpdate = (timeNow - tx.updatedAt) / 1000
            if (secondsSinceLastUpdate > MANUAL_CHECK_TX_STATUS_INTERVAL && tx.processed) {
              const transactionReq: TransactionProcessed = tx.processed
              // console.log('- test socket.emit TRANSACTION_STATUS_REQUEST')
              socket.emit(Event.TRANSACTION_STATUS_REQUEST, transactionReq)
            }
          }
        })
      }, 5000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [pendingTransactions, updateTransaction])

  return null
}

export function emitTransactionRequest(transaction: TransactionReq) {
  socket.emit(Event.TRANSACTION_REQUEST, transaction)
}

export function emitTransactionCancellation(transaction: TransactionProcessed) {
  socket.emit(Event.TRANSACTION_CANCEL_REQUEST, transaction)
}
