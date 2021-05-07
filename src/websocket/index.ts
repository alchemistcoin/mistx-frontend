import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { io, Socket } from 'socket.io-client'
import { BigNumberish } from '@ethersproject/bignumber'
import { keccak256 } from '@ethersproject/keccak256'
// state
import { updateGas } from '../state/application/actions'
import { transactionError } from '../state/transactions/actions'
import { Gas } from '../state/application/reducer'
import { useTransactionRemover, useTransactionUpdater } from 'state/transactions/hooks'
import { useActiveWeb3React } from 'hooks'
import { ChainId } from '@alchemistcoin/sdk'
import { toast } from 'react-toastify';

export enum Event {
  GAS_CHANGE = 'GAS_CHANGE',
  SOCKET_SESSION_RESPONSE = 'SOCKET_SESSION',
  SOCKET_ERR = 'SOCKET_ERR',
  PENDING_TRANSACTION = 'PENDING_TRANSACTION',
  TRANSACTION_REQUEST = 'TRANSACTION_REQUEST',
  TRANSACTION_RESPONSE = 'TRANSACTION_RESPONSE'
}

export enum Status {
  PENDING_TRANSACTION = 'PENDING_TRANSACTION',
  FAILED_TRANSACTION = 'FAILED_TRANSACTION',
  SUCCESSFUL_TRANSACTION = 'SUCCESSFUL_TRANSACTION',
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
  transaction: TransactionReq
  status: string
  message: string
}

export interface TransactionProcessed {
  serializedSwap: string;
  serializedApprove: string | undefined;
  swap: SwapReq;
  bribe: BigNumberish;
  routerAddress: string;
  timestamp: number; // EPOCH
  sessionToken: string;
  chainId: number;
  simulateOnly: boolean;
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
const serverUrl = (process.env.SERVER_URL as string) || 'http://localhost:4000'

console.log('server url', serverUrl)
const socket: Socket<QuoteEventsMap, QuoteEventsMap> = io(serverUrl, {
  transports: ['websocket'],
  auth: { token }
})

export default function Sockets(): null {
  const dispatch = useDispatch()
  const { chainId } = useActiveWeb3React();
  const updateTransaction = useTransactionUpdater();
  const removeTransaction = useTransactionRemover();

  useEffect(() => {
    socket.on('connect', () => {
      console.log('websocket connected')
    })

    socket.on('connect_error', err => {
      socket.disconnect()
      console.log('websocket connect error', err)
    })

    socket.on(Event.SOCKET_ERR, err => {
      console.log('err', err)
      if (err.event === Event.TRANSACTION_REQUEST) {
        const transactionReq = err.data as TransactionReq;
        const hash = keccak256(transactionReq.serializedSwap)
        removeTransaction({
          chainId: transactionReq.chainId,
          hash
        })
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
      console.log('pending transaction response', transaction)
      const hash = keccak256(transaction.transaction.serializedSwap)

      updateTransaction(
        {
          chainId: transaction.transaction.chainId,
          hash,
          serializedSwap: transaction.transaction.serializedSwap,
          serializedApprove: transaction.transaction.serializedApprove,
        },
        {
          message: transaction.message,
          status: transaction.status
        }
      )
    })

    socket.on(Event.TRANSACTION_RESPONSE, transaction => {
      console.log('transaction response', transaction)
      const hash = keccak256(transaction.transaction.serializedSwap)

      if (transaction.status === Status.FAILED_TRANSACTION) {
        toast.error(`Transaction Removed`, {
          closeOnClick: true,
        });
        console.log('remove transaction', chainId);
        removeTransaction({
          chainId: transaction.transaction.chainId,
          hash
        })
      } else {
        console.log('update transaction', chainId);
        updateTransaction(
          {
            chainId: transaction.transaction.chainId,
            hash,
            serializedSwap: transaction.transaction.serializedSwap,
            serializedApprove: transaction.transaction.serializedApprove,
          },
          {
            message: transaction.message,
            status: transaction.status
          }
        )
      }
    })

    return () => {
      socket.off('connect')
      socket.off('connect_error')
      socket.off(Event.SOCKET_SESSION_RESPONSE)
      socket.off(Event.GAS_CHANGE)
    }
  }, [dispatch, chainId])

  return null
}

export function emitTransactionRequest(transaction: TransactionReq) {
  socket.emit(Event.TRANSACTION_REQUEST, transaction)
  console.log('transaction sent', transaction)
}
