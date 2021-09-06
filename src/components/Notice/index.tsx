import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { addPopup } from '../../state/application/actions'

export const Notice = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(
      addPopup({
        content: {
          message:
            'mistX runs in limited mode due to an outage on the flashbots relay. You can trade safely but more transactions will expire than usual. If so, you can try again and try to up the miner payment (mistX protection).'
        },
        key: 'limitedMode',
        removeAfterMs: 20000
      })
    )
    dispatch(
      addPopup({
        content: {
          message: 'You may receive some funds back in your wallet after a swap as we are beta testing a new feature.'
        },
        key: 'rewardsNoticeV1',
        removeAfterMs: 10000
      })
    )
  }, [dispatch])

  return null
}

export default Notice
