import { MISTX_DEFAULT_GAS_LIMIT } from '../constants'
import { useEffect, useState } from 'react'
import { getGasUsedForPath } from '../api/gasUsed'

const gasUsed: any = {}

export function useGasLimitForPath(path: string[] | undefined) {
  const [gasLimit, setGasLimit] = useState((undefined as unknown) as number)

  const str = path && path.join('')
  useEffect(() => {
    if (str && path) {
      if (gasUsed[str]) {
        setGasLimit(gasUsed[str])
      } else {
        getGasUsedForPath(path)
          .then(response => {
            console.log('gas for path', response)
            gasUsed[str] = response.data.gasUsed

            setGasLimit(response.data.gasUsed || MISTX_DEFAULT_GAS_LIMIT)
          })
          .catch(e => {
            console.error('error getting gas for path', path, e)
            setGasLimit(MISTX_DEFAULT_GAS_LIMIT)
          })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [str])

  return gasLimit
}
