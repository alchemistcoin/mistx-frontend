import { BigNumber } from 'ethers'
// import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { AppState } from '../state'
// import useCurrentBlockTimestamp from './useCurrentBlockTimestamp'

// combines the block timestamp with the user setting to give the deadline that should be used for any submitted transaction
export default function useTransactionDeadline(): BigNumber {
  const ttl = useSelector<AppState, number>(state => state.user.userDeadline)
  return BigNumber.from(ttl)
}
