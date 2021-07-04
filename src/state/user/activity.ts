import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { AppState } from '../index'

const Activity = () => {
  const lastUpdateVersionTimestamp = useSelector<AppState, AppState['user']['lastUpdateVersionTimestamp']>(
    state => state.user.lastUpdateVersionTimestamp
  )

  useEffect(() => {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        const timeNow = new Date().getTime()
        const timeDiffMins = Math.floor(Number(lastUpdateVersionTimestamp) - timeNow) / 1000 / 60
        if (timeDiffMins > 1440) {
          window.location.reload()
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export default Activity
