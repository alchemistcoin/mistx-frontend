import { useEffect } from 'react'
import { updateGas } from '../state/application/actions'
import { updateTransaction, transactionError } from '../state/transactions/actions'
import { useDispatch } from 'react-redux'
import { io, Socket } from 'socket.io-client'
import { Gas } from '../state/application/reducer'
import { BigNumberish } from '@ethersproject/bignumber'
import { keccak256 } from '@ethersproject/keccak256'
import { useActiveWeb3React } from 'hooks'

export enum Event {
  GAS_CHANGE = 'GAS_CHANGE',
  SOCKET_SESSION_RESPONSE = 'SOCKET_SESSION',
  SOCKET_ERR = 'SOCKET_ERR',
  PENDING_TRANSACTION = 'PENDING_TRANSACTION',
  SUCCESSFUL_TRANSACTION = 'SUCCESSFUL_TRANSACTION',
  FAILED_TRANSACTION = 'FAILED_TRANSACTION',
  TRANSACTION_REQUEST = 'TRANSACTION_REQUEST',
  TRANSACTION_RESPONSE = 'TRANSACTION_RESPONSE'
}

export interface SocketSession {
  token: string
}
export interface SwapReq {
  amount0: BigNumberish
  amount1: BigNumberish
  path: Array<string>
  to: string
}

export interface TransactionReq {
  serializedSwap: string
  serializedApprove: string | undefined
  swap: SwapReq
  bribe: BigNumberish
  routerAddress: string
  ttl: number // in milliseconds
}

export interface TransactionRes {
  serializedSwap: string
  serializedApprove: string | undefined
  status: string
  message: string
}

interface QuoteEventsMap {
  [Event.PENDING_TRANSACTION]: (response: TransactionRes) => void
  [Event.SOCKET_SESSION_RESPONSE]: (response: SocketSession) => void
  [Event.SOCKET_ERR]: (err: any) => void
  [Event.GAS_CHANGE]: (response: Gas) => void
  [Event.TRANSACTION_REQUEST]: (response: TransactionReq) => void
  [Event.TRANSACTION_RESPONSE]: (response: TransactionRes) => void
}

const tokenKey = `SESSION_TOKEN`
const token = localStorage.getItem(tokenKey)
const serverUrl = (process.env.SERVER_URL as string) || 'http://localhost:7070'

console.log('server url', serverUrl)
const socket: Socket<QuoteEventsMap, QuoteEventsMap> = io(serverUrl, {
  transports: ['websocket'],
  auth: { token }
})

export default function Sockets(): null {
  const dispatch = useDispatch()
  const { chainId } = useActiveWeb3React();

  useEffect(() => {
    socket.on('connect', () => {
      console.log('websocket connected')
    })

    socket.on('connect_error', err => {
      socket.disconnect()
      console.log('websocket connect error', err)
    })

    socket.on(Event.SOCKET_ERR, err => {
      console.log('err', err);
      if (err.event === Event.TRANSACTION_REQUEST) {
        dispatch(transactionError(err))
      }
    })

    socket.on(Event.SOCKET_SESSION_RESPONSE, session => {
      localStorage.setItem(tokenKey, session.token)
    })

    socket.on(Event.GAS_CHANGE, gas => {
      dispatch(updateGas(gas))
    })

    socket.on(Event.PENDING_TRANSACTION, transaction => {
      console.log('new transaction response', transaction)
    })

    socket.on(Event.TRANSACTION_RESPONSE, transaction => {
      console.log('transaction response', transaction)
      console.log('chain id', chainId)

      if (!chainId) return

      const hash = keccak256(transaction.serializedSwap)
      dispatch(updateTransaction({
        chainId,
        hash,
        serializedSwap: transaction.serializedSwap,
        serializedApprove: transaction.serializedApprove,
        message: transaction.message,
        status: transaction.status,
      }))
    })

    return () => {
      socket.off('connect')
      socket.off('connect_error')
      socket.off(Event.SOCKET_SESSION_RESPONSE)
      socket.off(Event.GAS_CHANGE)
    }
  }, [chainId, dispatch])

  return null
}

export function emitTransactionRequest(transaction: TransactionReq){
  socket.emit(Event.TRANSACTION_REQUEST, transaction)
  console.log('transaction sent', transaction)
}
