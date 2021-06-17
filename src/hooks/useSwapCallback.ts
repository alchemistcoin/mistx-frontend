import { PopulatedTransaction } from '@ethersproject/contracts'
import { BigNumber } from '@ethersproject/bignumber'
import { Trade } from '@alchemistcoin/sdk'
import { formatUnits } from 'ethers/lib/utils'
import { useMemo } from 'react'
// import { useTransactionAdder } from '../state/transactions/hooks'
import { calculateGasMargin /*, isAddress, shortenAddress */ } from '../utils'
import isZero from '../utils/isZero'
import { useActiveWeb3React } from './index'
import useENS from './useENS'
import { /*MISTX_RELAY_URI, */ INITIAL_ALLOWED_SLIPPAGE, ROUTER } from '../constants'
import { ethers } from 'ethers'
import { keccak256 } from 'ethers/lib/utils'
import { SignatureLike } from '@ethersproject/bytes'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { useApproveCallbackFromTrade } from './useApproveCallback'
// import { useEstimationCallback } from './useEstimationCallback'
import { useSwapCallArguments } from './useSwapCallArguments'
import { TransactionReq, SwapReq, emitTransactionRequest } from '../websocket'

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID
}

interface SignedTransactionResponse {
  raw: string
  tx: any
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  // transactionTTL: number // deadline to use for relay -- set to undefined for no relay
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId, library } = useActiveWeb3React()
  // const addTransaction = useTransactionAdder()
  const useApprove = useApproveCallbackFromTrade(trade, allowedSlippage)
  const approve = useApprove[1]
  // const estimationCall = useEstimationCallback(trade, allowedSlippage, recipientAddressOrName)
  const swapCall = useSwapCallArguments(trade, allowedSlippage, recipientAddressOrName)
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
        if (!swapCall) throw new Error(`No Swap Call Arguments`)
        const {
          call: {
            contract,
            parameters: { methodName, args, value }
          }
        } = swapCall

        // const sendToRelay = (serializedApproval: string | undefined, serializedSwap: string, deadline: number) => {
        // const relayURI = chainId ? MISTX_RELAY_URI[chainId] : undefined
        // if (!relayURI) throw new Error('Could not determine relay URI for this network')
        // console.log('Send to relay', serializedApproval, serializedSwap, deadline)
        //TODO change this to our relay
        // const body = JSON.stringify({
        //   method: 'archer_submitTx',
        //   tx: rawTransaction,
        //   deadline: deadline.toString()
        // })

        // fetch(relayURI, {
        //   method: 'POST',
        //   body,
        //   headers: {
        //     Authorization: process.env.REACT_APP_MISTX_API_KEY ?? '',
        //     'Content-Type': 'application/json'
        //   }
        // })
        //.then(res => res.json())
        //.then(json => console.log(json))
        // .catch(err => console.error(err))
        // }

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

        try {
          const signedApproval = await approve()

          try {
            const populatedTx: PopulatedTransaction = await contract.populateTransaction[methodName](...args, {
              //modify nonce if we also have an approval
              nonce:
                signedApproval === undefined
                  ? contract.signer.getTransactionCount()
                  : contract.signer.getTransactionCount().then(nonce => {
                      return nonce + 1
                    }),
              gasLimit: calculateGasMargin(BigNumber.from(500000)), //needed?
              //gasLimit: calculateGasMargin(BigNumber.from(trade.estimatedGas)), //needed?
              ...(value && !isZero(value) ? { value } : {})
            })

            //delete for serialize necessary
            delete populatedTx.from
            populatedTx.chainId = chainId

            // HANDLE METAMASK
            // MetaMask does not support eth_signTransaction so we must use eth_sign as a workaround.
            // For other wallets, use eth_signTransaction
            let signedTx
            if (isMetamask) {
              const serialized = ethers.utils.serializeTransaction(populatedTx)
              const hash = keccak256(serialized)
              const signature: SignatureLike = await library.jsonRpcFetchFunc('eth_sign', [account, hash])
              console.log('signature', signature)
              // this returns the transaction & signature serialized and ready to broadcast
              // basically does everything that AD does with hexlify etc. - kek
              signedTx = ethers.utils.serializeTransaction(populatedTx, signature)
            } else {
              const signedTxRes: SignedTransactionResponse = await library.jsonRpcFetchFunc('eth_signTransaction', [
                {
                  ...populatedTx,
                  gasLimit: populatedTx.gasLimit?.toHexString(),
                  gasPrice: '0x0',
                  value: populatedTx.value?.toHexString()
                }
              ])

              signedTx = signedTxRes.raw
            }

            // Set isMetaMask again after signing. (workaround for an issue with isMetaMask set on the provider during signing)
            if (web3Provider) {
              web3Provider.provider.isMetaMask = isMetamask
            }

            console.log('SIGNED TX', signedTx)
            const hash = keccak256(signedTx)
            // const inputSymbol = trade.inputAmount.currency.symbol
            // const outputSymbol = trade.outputAmount.currency.symbol
            // const inputAmount = trade.inputAmount.toSignificant(3)
            // const outputAmount = trade.outputAmount.toSignificant(3)

            // const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
            // const withRecipient =
            //   recipient === account
            //     ? base
            //     : `${base} to ${
            //         recipientAddressOrName && isAddress(recipientAddressOrName)
            //           ? shortenAddress(recipientAddressOrName)
            //           : recipientAddressOrName
            //       }`
            const swapReq: SwapReq = {
              amount0: args[0][0] as string,
              amount1: args[0][1] as string,
              path: args[0][2] as string[],
              to: args[0][3] as string,
              deadline: args[0][4]
            }

            const minerBribeBN = BigNumber.from(args[1])
            const estimatedEffectiveGasPriceBn = minerBribeBN.div(BigNumber.from(trade.estimatedGas))
            const estimatedEffectiveGasPrice = Number(formatUnits(estimatedEffectiveGasPriceBn, 'gwei'))

            const transactionReq: TransactionReq = {
              chainId,
              serializedApprove: signedApproval ? signedApproval : undefined,
              serializedSwap: signedTx,
              swap: swapReq,
              bribe: args[1], // need to use calculated bribe
              routerAddress: ROUTER[trade.exchange],
              estimatedEffectiveGasPrice: estimatedEffectiveGasPrice,
              estimatedGas: Number(trade.estimatedGas),
              from: account
            }
            // console.log('trans req', transactionReq)
            // console.log('emit transaction', transactionReq)
            // send transaction via sockets here

            // we can't have TransactionResponse here
            // This can be handled by the socket method
            // addTransaction(
            //   { chainId, hash },
            //   {
            //     summary: withRecipient,
            //     trade
            //     //relay
            //   }
            // )

            //
            //
            //
            // if (relay) sendToRelay(relay.serializedApprove, relay.serializedSwap, relay.deadline)

            emitTransactionRequest(transactionReq)

            return hash
          } catch (error) {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, methodName, args, value)
              throw new Error(`Swap failed: ${error.message}`)
            }
          }
        } catch (error) {
          console.error(`Approval failed`, error)
          throw new Error(`Approval Failed: ${error.message}`)
        }
      },
      error: null
    }
  }, [trade, library, account, chainId, recipient, recipientAddressOrName, swapCall, approve /*addTransaction*/])
}
