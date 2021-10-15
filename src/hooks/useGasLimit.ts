import { MISTX_DEFAULT_GAS_LIMIT } from '../constants'
import { useEffect } from 'react'
import { getGasUsedForPath } from '../api/gasUsed'
import { setGasLimitForPath } from 'state/application/actions'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '../state'

const gasUsed: any = {}
const loading: any = {}

export function useGasLimitForPath(path: string[] | undefined) {
  const dispatch = useDispatch()
  const gasLimits = useSelector<AppState, AppState['application']['gasLimits']>(state => state.application.gasLimits)

  const str = path && path.join('')
  useEffect(() => {
    let isCancelled = false

    async function getGasLimit(str: string, path: string[]) {
      try {
        const response = await getGasUsedForPath(path)

        if (isCancelled) return

        delete loading[str]
        gasUsed[str] = response.data.gasUsed
        dispatch(setGasLimitForPath({ path: str, gasLimit: response.data.gasUsed || MISTX_DEFAULT_GAS_LIMIT }))
        return
      } catch (e) {
        if (isCancelled) return

        delete loading[str]
        console.error('error getting gas for path', path, e)
        dispatch(setGasLimitForPath({ path: str, gasLimit: MISTX_DEFAULT_GAS_LIMIT }))
        return
      }
    }

    if (str && path) {
      if (!loading[str] && !gasLimits[str]) {
        loading[str] = true
        getGasLimit(str, path)
      }
    }

    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [str])

  return MISTX_DEFAULT_GAS_LIMIT
  // return str ? gasLimits[str] : MISTX_DEFAULT_GAS_LIMIT
}
