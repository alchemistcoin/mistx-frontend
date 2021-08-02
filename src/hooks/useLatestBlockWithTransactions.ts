import { useEffect, useState, useMemo } from 'react'
import { useBlockNumber } from '../state/application/hooks'
import { useActiveWeb3React } from './index'
import { BlockWithTransactions } from '@ethersproject/abstract-provider'

export default function useLatestBlockWithTransactions(): BlockWithTransactions | undefined {
  const { library } = useActiveWeb3React()
  const [blockWithTransactions, setBlockWithTransactions] = useState<BlockWithTransactions | undefined>(undefined)
  const currentBlock = useBlockNumber()

  useEffect(() => {
    async function getBlockWithTransactions(): Promise<void> {
      if (!library || !currentBlock) {
        setBlockWithTransactions(undefined)
        return
      }
      const block = await library.getBlockWithTransactions(currentBlock)
      if (!block) {
        setBlockWithTransactions(undefined)
      } else {
        setBlockWithTransactions(block)
      }
    }
    getBlockWithTransactions()
  }, [library, currentBlock])
  return useMemo(() => {
    return blockWithTransactions
  }, [blockWithTransactions])
}
