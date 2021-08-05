import { useEffect, useState, useMemo } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import useLatestBlockWithTransactions from './useLatestBlockWithTransactions'

export default function useLatestGasPrice(): BigNumber | undefined {
  const [gasPrice, setGasPrice] = useState<string | undefined>(undefined)
  const block = useLatestBlockWithTransactions()

  useEffect(() => {
    if (!block) {
      setGasPrice(undefined)
    } else {
      // final tx of block
      const tx = block.transactions[block.transactions.length - 1]
      const blockBaseFee = block.baseFeePerGas ? BigNumber.from(block.baseFeePerGas) : undefined
      let gasPrice: BigNumber | undefined
      if (!tx) {
        gasPrice = undefined
      } else if (!tx.type || tx.type < 2) {
        gasPrice = BigNumber.from(tx.gasPrice)
      } else if (tx.type && tx.type > 1 && blockBaseFee) {
        gasPrice = blockBaseFee
        if (tx.maxFeePerGas && tx.maxPriorityFeePerGas) {
          const mfpg = BigNumber.from(tx.maxFeePerGas)
          const mpfpg = BigNumber.from(tx.maxPriorityFeePerGas)
          const maxFeeBaseFeeDiff = mfpg.sub(blockBaseFee)
          const priorityFeePerGas = mpfpg.lt(maxFeeBaseFeeDiff) ? mpfpg : maxFeeBaseFeeDiff
          if (priorityFeePerGas) {
            gasPrice = gasPrice.add(priorityFeePerGas)
          }
        }
      }
      if (gasPrice) {
        // if (blockBaseFee) {
        //   gasPrice = gasPrice.add(1).sub(blockBaseFee)
        // }
        setGasPrice(gasPrice?.toString())
      } else {
        setGasPrice(undefined)
      }
    }
  }, [block])
  return useMemo(() => {
    if (!gasPrice) return undefined
    return BigNumber.from(gasPrice)
  }, [gasPrice])
}
