import { useEffect } from 'react'
import { updateGas } from '../state/application/actions'
import { useDispatch } from 'react-redux'
import { io, Socket } from 'socket.io-client'
import { Gas } from '../state/application/reducer'

export enum Event {
  GAS_CHANGE = 'GAS_CHANGE',
  SOCKET_SESSION_RESPONSE = 'SOCKET_SESSION'
}

export interface SocketSession {
  token: string
}

interface QuoteEventsMap {
  [Event.SOCKET_SESSION_RESPONSE]: (response: SocketSession) => void
  [Event.GAS_CHANGE]: (response: Gas) => void
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

  useEffect(() => {
    socket.on('connect', () => {
      console.log('websocket connected')
    })

    socket.on('connect_error', err => {
      socket.disconnect()
      console.log('websocket connect error', err)
    })

    socket.on(Event.SOCKET_SESSION_RESPONSE, session => {
      localStorage.setItem(tokenKey, session.token)
    })

    socket.on(Event.GAS_CHANGE, gas => {
      dispatch(updateGas(gas))
    })

    return () => {
      socket.off('connect')
      socket.off('connect_error')
      socket.off(Event.SOCKET_SESSION_RESPONSE)
      socket.off(Event.GAS_CHANGE)
    }
  }, [dispatch])

  return null
}
