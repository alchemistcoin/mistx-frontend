import { useEffect, useState, useMemo } from 'react'
import { useBlockNumber } from '../state/application/hooks'
import { useActiveWeb3React } from './index'
import { BigNumber } from '@ethersproject/bignumber'

export default function useLatestGasPrice(): BigNumber | undefined {
  const { library } = useActiveWeb3React()
  const [gasPrice, setGasPrice] = useState<string | undefined>(undefined)
  const currentBlock = useBlockNumber()

  useEffect(() => {
    async function calculateMinerBribe(): Promise<void> {
      if (!library || !currentBlock) {
        setGasPrice(undefined)
        return
      }
      const block = await library.getBlockWithTransactions(currentBlock)
      const finalTransaction = block.transactions[block.transactions.length - 1]
      if (!finalTransaction) {
        setGasPrice(undefined)
        return
      }

      setGasPrice(finalTransaction.gasPrice.toString())
    }
    calculateMinerBribe()
  }, [library, currentBlock])
  return useMemo(() => {
    if (!gasPrice) return undefined
    return BigNumber.from(gasPrice)
  }, [gasPrice])
}
