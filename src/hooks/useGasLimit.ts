import { MISTX_DEFAULT_GAS_LIMIT } from '../constants'
import { useEffect, useState } from 'react'
import { getGasUsedForPath } from '../api/gasUsed'

const gasUsed: any = {}
const loading: any = {}

export function useGasLimitForPath(path: string[] | undefined) {
  const [gasLimit, setGasLimit] = useState((undefined as unknown) as number)

  const str = path && path.join('')
  useEffect(() => {
    if (str && path) {
      if (gasUsed[str]) {
        setGasLimit(gasUsed[str])
      } else {
        if (!loading[str]) {
          loading[str] = true
          getGasUsedForPath(path)
            .then(response => {
              delete loading[str]
              gasUsed[str] = response.data.gasUsed

              setGasLimit(response.data.gasUsed || MISTX_DEFAULT_GAS_LIMIT) // add 10% margin to gasLimit
            })
            .catch(e => {
              delete loading[str]
              // console.error('error getting gas for path', path, e)
              setGasLimit(MISTX_DEFAULT_GAS_LIMIT)
            })
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [str])

  return gasLimit
}
