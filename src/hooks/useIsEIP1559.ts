import { useActiveWeb3React } from './index'
import { useMemo } from 'react'
import { EIP_1559_ACTIVATION_BLOCK } from '../constants'
import { useBlockNumber } from '../state/application/hooks'

export default function useIsEIP1559(): boolean {
  const { chainId } = useActiveWeb3React()
  const blockNumber = useBlockNumber()
  const activationBlock = EIP_1559_ACTIVATION_BLOCK[chainId || 1]
  return useMemo(() => {
    if (!blockNumber || !chainId || !activationBlock) return false
    return blockNumber >= activationBlock
  }, [blockNumber, chainId, activationBlock])
}
