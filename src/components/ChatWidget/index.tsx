import { useEffect } from 'react'
import { init, logout, start } from './intercom'

init()

export function ChatWidget() {
  useEffect(() => {
    start()

    return () => {
      logout()
    }
  }, [])

  return null
}
