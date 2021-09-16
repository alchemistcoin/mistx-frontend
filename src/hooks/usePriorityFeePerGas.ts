import { useEffect, useState, useMemo } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import useLatestBlockWithTransactions from './useLatestBlockWithTransactions'

const NUM_ARRAY = 1
export default function usePriorityFeePerGas(): BigNumber | undefined {
  const [priorityFees, setPriorityFees] = useState<string[]>([])
  const [priorityFee, setPriorityFee] = useState<string | undefined>(undefined)
  const block = useLatestBlockWithTransactions()

  useEffect(() => {
    if (block) {
      const tx = block.transactions[block.transactions.length - 1]
      const blockBaseFee = block.baseFeePerGas ? BigNumber.from(block.baseFeePerGas) : undefined
      let priorityFee: BigNumber | undefined

      if (!tx || !blockBaseFee) {
        priorityFee = undefined
      } else if (!tx.type || tx.type < 2) {
        priorityFee = BigNumber.from(tx.gasPrice).sub(blockBaseFee)
      } else if (tx.type && tx.type > 1) {
        priorityFee = BigNumber.from(tx.maxPriorityFeePerGas)
      }

      if (priorityFee) {
        // if (blockBaseFee) {
        //   gasPrice = gasPrice.add(1).sub(blockBaseFee)
        // }
        const newPriorityFees = [priorityFee.toString(), ...priorityFees]
        if (newPriorityFees.length > NUM_ARRAY) {
          newPriorityFees.pop()
        }
        setPriorityFees(newPriorityFees)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block])

  useEffect(() => {
    if (priorityFees.length) {
      let total = BigNumber.from(0x0)
      priorityFees.forEach(price => {
        total = total.add(BigNumber.from(price))
      })

      setPriorityFee(total.div(priorityFees.length).toString())
    }
  }, [priorityFees])

  return useMemo(() => {
    if (!priorityFee) return undefined
    return BigNumber.from(priorityFee)
  }, [priorityFee])
}
