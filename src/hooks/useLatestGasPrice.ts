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
      const finalTransaction = block.transactions[block.transactions.length - 1]
      if (!finalTransaction) {
        setGasPrice(undefined)
      } else {
        setGasPrice(finalTransaction.gasPrice?.toString())
      }
    }
  }, [block])
  return useMemo(() => {
    if (!gasPrice) return undefined
    return BigNumber.from(gasPrice)
  }, [gasPrice])
}
