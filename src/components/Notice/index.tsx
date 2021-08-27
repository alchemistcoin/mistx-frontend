import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { addPopup } from '../../state/application/actions'

export const Notice = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const noticeShown = localStorage.getItem('rewardsNoticeV1')

    if (!noticeShown) {
      localStorage.setItem('rewardsNoticeV1', 'true')
      dispatch(
        addPopup({
          content: {
            message: 'You may receive some funds back in your wallet after a swap as we are beta testing a new feature.'
          },
          key: 'rewardsNoticeV1',
          removeAfterMs: 20000
        })
      )
    }
  }, [dispatch])

  return null
}

export default Notice
