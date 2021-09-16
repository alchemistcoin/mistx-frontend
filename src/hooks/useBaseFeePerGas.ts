import { useMemo } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { Fees } from '@alchemist-coin/mistx-connect'
import { MAX_BASE_FEE_BLOCKS_IN_FUTURE } from '../constants'
import { useFees } from '../state/application/hooks'

export function getMaxBaseFeeInFutureBlock(baseFee: BigNumber, blocksInFuture: number): BigNumber {
  const multiplier = Math.floor(1125 ** blocksInFuture)
  const divide = Math.floor(1000 ** blocksInFuture)

  const maxBaseFee = BigNumber.from(baseFee)
    .mul(multiplier)
    .div(divide)
    .add(1)

  return maxBaseFee
}

export function getMinBaseFeeInFutureBlock(baseFee: BigNumber, blocksInFuture: number): BigNumber {
  const multiplier = Math.floor(875 ** blocksInFuture)
  const divide = Math.floor(1000 ** blocksInFuture)

  const minBaseFee = BigNumber.from(baseFee)
    .mul(multiplier)
    .div(divide)
    .add(1)

  return minBaseFee
}

type BaseFeeReturnType = {
  baseFeePerGas: BigNumber | undefined
  minBaseFeePerGas: BigNumber | undefined
  maxBaseFeePerGas: BigNumber | undefined
}

export default function useBaseFeePerGas(): BaseFeeReturnType {
  const fees: Fees | undefined = useFees()
  const baseFeeish = fees?.baseFeePerGas

  return useMemo(() => {
    const ret: BaseFeeReturnType = {
      baseFeePerGas: undefined,
      minBaseFeePerGas: undefined,
      maxBaseFeePerGas: undefined
    }

    if (baseFeeish) {
      const baseFee = BigNumber.from(baseFeeish)
      ret.baseFeePerGas = baseFee
      ret.minBaseFeePerGas = getMinBaseFeeInFutureBlock(baseFee, MAX_BASE_FEE_BLOCKS_IN_FUTURE)
      ret.maxBaseFeePerGas = getMaxBaseFeeInFutureBlock(baseFee, MAX_BASE_FEE_BLOCKS_IN_FUTURE)
    }
    return ret
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseFeeish])
}
