import { BigNumber } from '@ethersproject/bignumber'
import { Contract, PopulatedTransaction } from '@ethersproject/contracts'
import { JSBI, Percent, Router, SwapParameters, Trade, TradeType } from '@alchemistcoin/sdk'
import { useMemo } from 'react'
import { getTradeVersion, useV1TradeExchangeAddress } from '../data/V1'
import { useTransactionAdder } from '../state/transactions/hooks'
import { calculateGasMargin, getRouterContract, isAddress, shortenAddress } from '../utils'
import isZero from '../utils/isZero'
import v1SwapArguments from '../utils/v1SwapArguments'
import { useActiveWeb3React } from './index'
import { useV1ExchangeContract } from './useContract'
import useTransactionDeadline from './useTransactionDeadline'
import useENS from './useENS'
import { Version } from './useToggledVersion'
import { MISTX_RELAY_URI, BIPS_BASE, INITIAL_ALLOWED_SLIPPAGE } from '../constants'
import { ethers } from 'ethers'
import { keccak256 } from 'ethers/lib/utils'
import { SignatureLike } from '@ethersproject/bytes'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID
}

interface SwapCall {
  contract: Contract
  parameters: SwapParameters
}

interface SuccessfulCall {
  call: SwapCall
  gasEstimate: BigNumber
}

interface FailedCall {
  call: SwapCall
  error: Error
}

type EstimatedSwapCall = SuccessfulCall | FailedCall

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName
 */
function useSwapCallArguments(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): SwapCall[] {
  const { account, chainId, library } = useActiveWeb3React()
  //const exchange = '0x' //uni, sushi, etc

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress
  const deadline = useTransactionDeadline()

  const v1Exchange = useV1ExchangeContract(useV1TradeExchangeAddress(trade), true)

  return useMemo(() => {
    const tradeVersion = getTradeVersion(trade)
    if (!trade || !recipient || !library || !account || !tradeVersion || !chainId || !deadline) return []

    const contract: Contract | null =
      tradeVersion === Version.v2 ? getRouterContract(chainId, library, account) : v1Exchange
    if (!contract) {
      return []
    }

    const swapMethods = []

    //TODO here we should only have to call on mistXRouter
    switch (tradeVersion) {
      case Version.v2:
        swapMethods.push(
          Router.swapCallParameters(trade, {
            feeOnTransfer: false,
            allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
            recipient,
            deadline: deadline.toNumber()
          })
        )

        if (trade.tradeType === TradeType.EXACT_INPUT) {
          swapMethods.push(
            Router.swapCallParameters(trade, {
              feeOnTransfer: true,
              allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
              recipient,
              deadline: deadline.toNumber()
            })
          )
        }
        break
      case Version.v1:
        swapMethods.push(
          v1SwapArguments(trade, {
            allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
            recipient,
            deadline: deadline.toNumber()
          })
        )
        break
    }
    return swapMethods.map(parameters => ({ parameters, contract }))
  }, [account, allowedSlippage, chainId, deadline, library, recipient, trade, v1Exchange])
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  relayDeadline?: number // deadline to use for relay -- set to undefined for no relay
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId, library } = useActiveWeb3React()

  const swapCalls = useSwapCallArguments(trade, allowedSlippage, recipientAddressOrName)

  const addTransaction = useTransactionAdder()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      } else {
        return { state: SwapCallbackState.LOADING, callback: null, error: null }
      }
    }

    //const tradeVersion = getTradeVersion(trade)

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
          swapCalls.map(call => {
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
                    return { call, error: new Error('Unexpected issue with estimating the gas. Please try again.') }
                  })
                  .catch(callError => {
                    console.debug('Call threw error', call, callError)
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

        const {
          call: {
            contract,
            parameters: { methodName, args, value }
          },
          gasEstimate
        } = successfulEstimation

        const sendToRelay = (rawTransaction: string, deadline: number) => {
          const relayURI = chainId ? MISTX_RELAY_URI[chainId] : undefined
          if (!relayURI) throw new Error('Could not determine relay URI for this network')

          //TODO change this to our relay
          const body = JSON.stringify({
            method: 'archer_submitTx',
            tx: rawTransaction,
            deadline: deadline.toString()
          })

          fetch(relayURI, {
            method: 'POST',
            body,
            headers: {
              Authorization: process.env.REACT_APP_MISTX_API_KEY ?? '',
              'Content-Type': 'application/json'
            }
          })
            //.then(res => res.json())
            //.then(json => console.log(json))
            .catch(err => console.error(err))
        }

        if (!(contract.signer instanceof JsonRpcSigner)) {
          throw new Error(`Cannot sign transactions with this wallet type`)
        }

        // ethers will change eth_sign to personal_sign if it detects metamask
        let web3Provider: Web3Provider | undefined
        let isMetamask: boolean | undefined
        if (library instanceof Web3Provider) {
          web3Provider = library as Web3Provider
          isMetamask = web3Provider.provider.isMetaMask
          web3Provider.provider.isMetaMask = false
        }

        return contract.populateTransaction[methodName](...args, {
          nonce: contract.signer.getTransactionCount(),
          gasLimit: calculateGasMargin(gasEstimate), //needed?
          ...(value && !isZero(value) ? { value } : {})
        })
          .then(populatedTx => {
            //delete for serialize necessary
            delete populatedTx.from
            populatedTx.chainId = chainId
            const serialized = ethers.utils.serializeTransaction(populatedTx)
            const hash = keccak256(serialized)
            return library
              .jsonRpcFetchFunc('eth_sign', [account, hash])
              .then((signature: SignatureLike) => {
                //this returns the transaction & signature serialized and ready to broadcast
                //basically does everything that AD does with hexlify etc. - kek
                const txWithSig = ethers.utils.serializeTransaction(populatedTx, signature)
                return { signedTx: txWithSig, populatedTx: populatedTx }
              })
              .finally(() => {
                if (web3Provider) {
                  web3Provider.provider.isMetaMask = isMetamask
                }
              })
              .then(({ signedTx, populatedTx }: { signedTx: string; populatedTx: PopulatedTransaction }) => {
                const hash = keccak256(signedTx)
                const inputSymbol = trade.inputAmount.currency.symbol
                const outputSymbol = trade.outputAmount.currency.symbol
                const inputAmount = trade.inputAmount.toSignificant(3)
                const outputAmount = trade.outputAmount.toSignificant(3)

                const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
                const withRecipient =
                  recipient === account
                    ? base
                    : `${base} to ${
                        recipientAddressOrName && isAddress(recipientAddressOrName)
                          ? shortenAddress(recipientAddressOrName)
                          : recipientAddressOrName
                      }`
                //  + (relayDeadline ? 'mistX' : '')

                const relay = relayDeadline
                  ? {
                      rawTransaction: signedTx,
                      deadline: Math.floor(relayDeadline + new Date().getTime() / 1000),
                      nonce: ethers.BigNumber.from(populatedTx.nonce).toNumber()
                    }
                  : undefined

                //we can't have TransactionResponse here
                addTransaction(
                  { hash },
                  {
                    summary: withRecipient
                    //relay
                  }
                )

                if (relay) sendToRelay(relay.rawTransaction, relay.deadline)

                return hash
              })
          })
          .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, methodName, args, value)
              throw new Error(`Swap failed: ${error.message}`)
            }
          })
      },
      error: null
    }
  }, [trade, library, account, chainId, recipient, recipientAddressOrName, swapCalls, addTransaction, relayDeadline])
}
