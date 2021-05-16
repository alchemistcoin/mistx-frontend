import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { io, Socket } from 'socket.io-client'
import { BigNumberish } from '@ethersproject/bignumber'
import { keccak256 } from '@ethersproject/keccak256'
import { updateSocketStatus } from '../state/application/actions'

// state
import { updateGas } from '../state/application/actions'
import { Gas } from '../state/application/reducer'
import { useAllTransactions, useTransactionRemover, useTransactionUpdater } from 'state/transactions/hooks'
import { ChainId } from '@alchemistcoin/sdk'
import { useAddPopup } from 'state/application/hooks'

export enum Event {
  GAS_CHANGE = 'GAS_CHANGE',
  SOCKET_SESSION_RESPONSE = 'SOCKET_SESSION',
  SOCKET_ERR = 'SOCKET_ERR',
  TRANSACTION_REQUEST = 'TRANSACTION_REQUEST',
  TRANSACTION_CANCEL_REQUEST = 'TRANSACTION_CANCEL_REQUEST',
  TRANSACTION_RESPONSE = 'TRANSACTION_RESPONSE',
  TRANSACTION_DIAGNOSIS = 'TRANSACTION_DIAGNOSIS'
}

export enum Status {
  PENDING_TRANSACTION = 'PENDING_TRANSACTION',
  FAILED_TRANSACTION = 'FAILED_TRANSACTION',
  SUCCESSFUL_TRANSACTION = 'SUCCESSFUL_TRANSACTION',
  CANCEL_TRANSACTION_PENDING = 'CANCEL_TRANSACTION_PENDING',
  CANCEL_TRANSACTION_FAILED = 'CANCEL_TRANSACTION_FAILED',
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
}

export interface TransactionRes {
  transaction: TransactionProcessed
  status: Status
  message: string
}

export interface TransactionProcessed {
  serializedSwap: string
  serializedApprove: string | undefined
  swap: SwapReq
  bribe: BigNumberish
  routerAddress: string
  timestamp: number // EPOCH
  sessionToken: string
  chainId: number
  simulateOnly: boolean
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
    case Status.CANCEL_TRANSACTION_FAILED:
      break
    case Status.PENDING_TRANSACTION:
      pending = true
      break
    case Status.CANCEL_TRANSACTION_PENDING:
      message = 'Cancellation pending'
      pending = true
      break
    case Status.SUCCESSFUL_TRANSACTION:
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
    message
  }
}

export default function Sockets(): null {
  const dispatch = useDispatch()
  const addPopup = useAddPopup()
  const allTransactions = useAllTransactions()
  const updateTransaction = useTransactionUpdater()
  const removeTransaction = useTransactionRemover()

  useEffect(() => {
    socket.on('connect', () => {
      console.log('websocket connected')
      dispatch(updateSocketStatus(true))
    })

    socket.on('connect_error', err => {
      console.log('websocket connect error', err)
      dispatch(updateSocketStatus(false))
    })

    socket.on('disconnect', err => {
      console.log('websocket disconnect', err)
      dispatch(updateSocketStatus(false))
    })

    socket.on(Event.SOCKET_ERR, err => {
      console.log('websocket err', err)
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
      const completed = tx?.status !== Status.PENDING_TRANSACTION && tx?.receipt

      const transactionId = {
        chainId: transaction.transaction.chainId,
        hash
      }

      if (!completed) {
        updateTransaction(transactionId, {
          transaction: transaction.transaction,
          message: transaction.message,
          status: transaction.status
        })
      }

      addPopup(
        {
          txn: {
            hash,
            summary,
            ...transactionResToastStatus(transaction)
          }
        },
        hash
      )
    })

    socket.on(Event.TRANSACTION_DIAGNOSIS, diagnosis => {
      console.log('transaction diagnosis', diagnosis)
      const hash = keccak256(diagnosis.transaction.serializedSwap)

      const transactionId = {
        chainId: diagnosis.transaction.chainId,
        hash,
      }

      updateTransaction(transactionId, {
        blockNumber: diagnosis.blockNumber,
        flashbotsResolution: diagnosis.flashbotsResolution,
        mistxDiagnosis: diagnosis.mistxDiagnosis
      });
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

  return null
}

export function emitTransactionRequest(transaction: TransactionReq) {
  socket.emit(Event.TRANSACTION_REQUEST, transaction)
  console.log('websocket transaction sent', transaction)
}

export function emitTransactionCancellation(transaction: TransactionReq) {
  socket.emit(Event.TRANSACTION_CANCEL_REQUEST, transaction)
}
