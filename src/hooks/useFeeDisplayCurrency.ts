import { AppState } from '../state'
import { useSelector } from 'react-redux'

export default function useFeeDisplayCurrency(): 'ETH' | 'USD' {
  const feeDisplayCurrency = useSelector<AppState, AppState['user']['feeDisplayCurrency']>(
    state => state.user.feeDisplayCurrency
  )
  return feeDisplayCurrency
}
