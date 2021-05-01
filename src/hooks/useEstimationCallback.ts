import { useMemo } from 'react'
import { useSwapCallArguments, SuccessfulCall, FailedCall } from './useSwapCallArguments'
import { Trade } from '@alchemistcoin/sdk'
import { INITIAL_ALLOWED_SLIPPAGE } from '../constants'
import isZero from '../utils/isZero'

type EstimatedSwapCall = SuccessfulCall | FailedCall

export function useEstimationCallback(
  trade: Trade | undefined,
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE,
  recipientAddressOrName: string | null
): () => Promise<SuccessfulCall | undefined> {
  const swapCalls = useSwapCallArguments(trade, allowedSlippage, recipientAddressOrName)
  return useMemo(() => {
    return async function estimateCallback(): Promise<SuccessfulCall | undefined> {
      const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
        swapCalls.map(pendingCall => {
          const { call } = pendingCall
          const {
            parameters: { methodName, args, value },
            contract
          } = call
          const options = !value || isZero(value) ? {} : { value }

          return contract.estimateGas[methodName](...args, options)
            .then(gasEstimate => {
              return {
                call,
                gasEstimate
              }
            })
            .catch(gasError => {
              console.debug('Gas estimate failed, trying eth_call to extract error', call)

              return contract.callStatic[methodName](...args, options)
                .then(result => {
                  console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
                  return {
                    call,
                    error: new Error('Unexpected issue with estimating the gas. Please try again.')
                  }
                })
                .catch(callError => {
                  console.debug('Call threw error', callError)
                  let errorMessage: string
                  switch (callError.reason) {
                    case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
                    case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
                      errorMessage =
                        'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.'
                      break
                    default:
                      errorMessage = `The transaction cannot succeed due to error: ${callError.reason}. This is probably an issue with one of the tokens you are swapping.`
                  }
                  return { call, error: new Error(errorMessage) }
                })
            })
        })
      )

      // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
      const successfulEstimation = estimatedCalls.find(
        (el, ix, list): el is SuccessfulCall =>
          'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1])
      )

      if (!successfulEstimation) {
        const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
        if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
        throw new Error('Unexpected error. Please contact support: none of the calls threw an error')
      }

      return successfulEstimation
    }
  }, [swapCalls])
}
