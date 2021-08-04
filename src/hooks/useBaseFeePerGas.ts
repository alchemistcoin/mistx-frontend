import { useEffect, useState, useMemo } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import useLatestBlockWithTransactions from './useLatestBlockWithTransactions'
import { BASE_FEE_BLOCKS_IN_FUTURE } from '../constants'

export function getMaxBaseFeeInFutureBlock(baseFee: BigNumber, blocksInFuture: number): BigNumber {
  let maxBaseFee = BigNumber.from(baseFee)
  for (let i = 0; i < blocksInFuture; i++) {
    maxBaseFee = maxBaseFee
      .mul(1125)
      .div(1000)
      .add(1)
  }
  return maxBaseFee
}

export default function useBaseFeePerGas(): BigNumber | undefined {
  const [baseFee, setBaseFee] = useState<string | undefined>(undefined)
  const block = useLatestBlockWithTransactions()
  useEffect(() => {
    if (!block) {
      setBaseFee(undefined)
    } else {
      setBaseFee(block.baseFeePerGas?.toString())
    }
  }, [block])
  return useMemo(() => {
    if (!baseFee) return undefined
    return getMaxBaseFeeInFutureBlock(BigNumber.from(baseFee), BASE_FEE_BLOCKS_IN_FUTURE)
  }, [baseFee])
}
