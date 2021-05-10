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
import { transactionToast } from 'components/Toasts/transaction'

export enum Event {
  GAS_CHANGE = 'GAS_CHANGE',
  SOCKET_SESSION_RESPONSE = 'SOCKET_SESSION',
  SOCKET_ERR = 'SOCKET_ERR',
  TRANSACTION_REQUEST = 'TRANSACTION_REQUEST',
  TRANSACTION_RESPONSE = 'TRANSACTION_RESPONSE'
}

export enum Status {
  PENDING_TRANSACTION = 'PENDING_TRANSACTION',
  FAILED_TRANSACTION = 'FAILED_TRANSACTION',
  SUCCESSFUL_TRANSACTION = 'SUCCESSFUL_TRANSACTION'
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

interface QuoteEventsMap {
  [Event.SOCKET_SESSION_RESPONSE]: (response: SocketSession) => void
  [Event.SOCKET_ERR]: (err: any) => void
  [Event.GAS_CHANGE]: (response: Gas) => void
  [Event.TRANSACTION_REQUEST]: (response: TransactionReq) => void
  [Event.TRANSACTION_RESPONSE]: (response: TransactionRes) => void
}

const tokenKey = `SESSION_TOKEN`
const token = localStorage.getItem(tokenKey)
const serverUrl = (process.env.SERVER_URL as string) || 'http://localhost:4000'

console.log('server url', serverUrl)
const socket: Socket<QuoteEventsMap, QuoteEventsMap> = io(serverUrl, {
  transports: ['websocket'],
  auth: { token },
  reconnection: true,
  reconnectionDelay: 5000,
  autoConnect: true
})

function handleTransactionResponseToast(transaction: TransactionRes, hash: string, summary?: string) {
  switch (transaction.status) {
    case Status.FAILED_TRANSACTION:
      transactionToast({
        chainId: transaction.transaction.chainId,
        hash,
        status: 'Failed',
        summary,
        error: true
      })
      break
    case Status.PENDING_TRANSACTION:
      transactionToast({
        chainId: transaction.transaction.chainId,
        hash,
        status: 'Pending',
        summary
      })
      break
    case Status.SUCCESSFUL_TRANSACTION:
      transactionToast({
        chainId: transaction.transaction.chainId,
        hash,
        status: 'Completed!',
        summary,
        success: true
      })
      break
    default:
      transactionToast({
        chainId: transaction.transaction.chainId,
        hash,
        status: 'Updated',
        summary
      })
      break
  }
}

export default function Sockets(): null {
  const dispatch = useDispatch()
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
      console.log('transaction response', transaction)
      const hash = keccak256(transaction.transaction.serializedSwap)

      const transactionId = {
        chainId: transaction.transaction.chainId,
        hash
      }

      updateTransaction(transactionId, {
        transaction: transaction.transaction,
        message: transaction.message,
        status: transaction.status
      })

      const tx = allTransactions?.[hash]
      const summary = tx?.summary
      handleTransactionResponseToast(transaction, hash, summary)
    })

    return () => {
      socket.off('connect')
      socket.off('connect_error')
      socket.off(Event.SOCKET_ERR)
      socket.off(Event.SOCKET_SESSION_RESPONSE)
      socket.off(Event.GAS_CHANGE)
      socket.off(Event.TRANSACTION_RESPONSE)
    }
  }, [dispatch, allTransactions, removeTransaction, updateTransaction])

  return null
}

export function emitTransactionRequest(transaction: TransactionReq) {
  socket.emit(Event.TRANSACTION_REQUEST, transaction)
  console.log('websocket transaction sent', transaction)
}
