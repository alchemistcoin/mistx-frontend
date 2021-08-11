import { useEffect, useState, useMemo } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import useLatestBlockWithTransactions from './useLatestBlockWithTransactions'

const NUM_GAS_PRICES = 1
export default function useLatestTipGasPrice(): BigNumber | undefined {
  const [gasPrices, setGasPrices] = useState<string[]>([])
  const [gasPrice, setGasPrice] = useState<string | undefined>(undefined)
  const block = useLatestBlockWithTransactions()

  useEffect(() => {
    if (block) {
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
        const newGasPrices = [gasPrice.toString(), ...gasPrices]
        if (newGasPrices.length > NUM_GAS_PRICES) {
          newGasPrices.pop()
        }
        setGasPrices(newGasPrices)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block])

  useEffect(() => {
    if (gasPrices.length) {
      let total = BigNumber.from(0x0)
      gasPrices.forEach(price => {
        total = total.add(BigNumber.from(price))
      })

      setGasPrice(total.div(gasPrices.length).toString())
    }
  }, [gasPrices])

  return useMemo(() => {
    if (!gasPrice) return undefined
    return BigNumber.from(gasPrice)
  }, [gasPrice])
}
