import { useEffect, useState, useMemo } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import useLatestBlockWithTransactions from './useLatestBlockWithTransactions'
import { BASE_FEE_BLOCKS_IN_FUTURE, MAX_BASE_FEE_BLOCKS_IN_FUTURE } from '../constants'

export function getMaxBaseFeeInFutureBlock(baseFee: BigNumber, blocksInFuture: number): BigNumber {
  let maxBaseFee = BigNumber.from(baseFee)

  const multiplier = 1125 ** blocksInFuture
  const divide = 1000 ** blocksInFuture

  maxBaseFee = maxBaseFee.mul(multiplier).div(divide)

  return maxBaseFee.add(1)
}

export function getMinBaseFeeInFutureBlock(baseFee: BigNumber, blocksInFuture: number): BigNumber {
  let minBaseFee = BigNumber.from(baseFee)
  for (let i = 0; i < blocksInFuture; i++) {
    minBaseFee = minBaseFee
      .mul(875)
      .div(1000)
      .add(1)
  }
  return minBaseFee
}

type BaseFeeReturnType = {
  baseFeePerGas: BigNumber | undefined
  minBaseFeePerGas: BigNumber | undefined
  maxBaseFeePerGas: BigNumber | undefined
}

export default function useBaseFeePerGas(): BaseFeeReturnType {
  const ret: BaseFeeReturnType = {
    baseFeePerGas: undefined,
    minBaseFeePerGas: undefined,
    maxBaseFeePerGas: undefined
  }
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
    if (baseFee) {
      ret.baseFeePerGas = BigNumber.from(baseFee)
      ret.minBaseFeePerGas = getMinBaseFeeInFutureBlock(ret.baseFeePerGas, BASE_FEE_BLOCKS_IN_FUTURE)
      ret.maxBaseFeePerGas = getMaxBaseFeeInFutureBlock(ret.baseFeePerGas, BASE_FEE_BLOCKS_IN_FUTURE)
    }
    return ret
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseFee])
}
