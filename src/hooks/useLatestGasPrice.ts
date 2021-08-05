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
      let gasPrice: BigNumber | undefined
      if (!tx) {
        gasPrice = undefined
      } else if (!tx.type || tx.type < 2) {
        gasPrice = tx.gasPrice
      } else if (tx.type && tx.type > 1 && block.baseFeePerGas) {
        gasPrice = block.baseFeePerGas
        if (tx.maxFeePerGas && tx.maxPriorityFeePerGas) {
          const maxFeeBaseFeeDiff = tx.maxFeePerGas?.sub(block.baseFeePerGas)
          const priorityFeePerGas = tx.maxPriorityFeePerGas?.lt(maxFeeBaseFeeDiff)
            ? tx.maxPriorityFeePerGas
            : maxFeeBaseFeeDiff
          if (priorityFeePerGas) {
            gasPrice = gasPrice.add(priorityFeePerGas)
          }
        }
      }
      if (gasPrice) {
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
