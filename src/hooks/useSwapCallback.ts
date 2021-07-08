import { PopulatedTransaction } from '@ethersproject/contracts'
import { BigNumber } from '@ethersproject/bignumber'
import { Trade, Currency, TradeType } from '@alchemistcoin/sdk'
import { formatUnits } from 'ethers/lib/utils'
import { useMemo } from 'react'
import { useTransactionAdder } from '../state/transactions/hooks'
import { calculateGasMargin, isAddress, shortenAddress } from '../utils'
import isZero from '../utils/isZero'
import { useActiveWeb3React } from './index'
import useENS from './useENS'
import { INITIAL_ALLOWED_SLIPPAGE } from '../constants'
import { ethers } from 'ethers'
import { keccak256 } from 'ethers/lib/utils'
import { SignatureLike } from '@ethersproject/bytes'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { useApproveCallbackFromTrade } from './useApproveCallback'
import { useSwapCallArguments } from './useSwapCallArguments'
import { TransactionReq, SwapReq, emitTransactionRequest, BundleReq } from '../websocket'

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
  trade: Trade<Currency, Currency, TradeType> | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  // transactionTTL: number // deadline to use for relay -- set to undefined for no relay
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId, library } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()
  const useApprove = useApproveCallbackFromTrade(trade, allowedSlippage)
  const approve = useApprove[1]
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

        if (!(contract.signer instanceof JsonRpcSigner)) {
          throw new Error(`Cannot sign transactions with this wallet type`)
        }

        let web3Provider: Web3Provider | undefined
        let isMetamask: boolean | undefined

        try {
          const signedApproval = await approve()

          // ethers will change eth_sign to personal_sign if it detects metamask
          if (library instanceof Web3Provider) {
            web3Provider = library as Web3Provider
            isMetamask = web3Provider.provider.isMetaMask
            web3Provider.provider.isMetaMask = false
          }

          try {
            const populatedTx: PopulatedTransaction = await contract.populateTransaction[methodName](...args, {
              //modify nonce if we also have an approval
              nonce:
                signedApproval === undefined
                  ? contract.signer.getTransactionCount()
                  : contract.signer.getTransactionCount().then(nonce => {
                      return nonce + 1
                    }),
              gasLimit: calculateGasMargin(BigNumber.from(500000)),
              ...(value && !isZero(value) ? { value } : { value: '0x0' })
            })

            //delete for serialize necessary
            populatedTx.chainId = chainId

            // HANDLE METAMASK
            // MetaMask does not support eth_signTransaction so we must use eth_sign as a workaround.
            // For other wallets, use eth_signTransaction
            let signedTx
            if (isMetamask) {
              delete populatedTx.from
              const serialized = ethers.utils.serializeTransaction(populatedTx)
              const hash = keccak256(serialized)
              const signature: SignatureLike = await library.jsonRpcFetchFunc('eth_sign', [account, hash])
              // console.log('signature', signature)
              // this returns the transaction & signature serialized and ready to broadcast
              // basically does everything that AD does with hexlify etc. - kek
              signedTx = ethers.utils.serializeTransaction(populatedTx, signature)
            } else {
              const signedTxRes: SignedTransactionResponse = await library.jsonRpcFetchFunc('eth_signTransaction', [
                {
                  ...populatedTx,
                  gas: populatedTx.gasLimit?.toHexString(),
                  gasLimit: populatedTx.gasLimit?.toHexString(),
                  gasPrice: '0x0',
                  ...(value && !isZero(value) ? { value } : { value: '0x0' })
                }
              ])
              signedTx = signedTxRes.raw
            }

            // Set isMetaMask again after signing. (workaround for an issue with isMetaMask set on the provider during signing)
            if (web3Provider) {
              web3Provider.provider.isMetaMask = isMetamask
            }

            const hash = keccak256(signedApproval ? signedApproval : signedTx)
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

            const minerBribeBN = BigNumber.from(args[1])
            const estimatedEffectiveGasPriceBn = minerBribeBN.div(BigNumber.from(trade.estimatedGas))
            const estimatedEffectiveGasPrice = Number(formatUnits(estimatedEffectiveGasPriceBn, 'gwei'))

            const swapReq: SwapReq = {
              amount0: args[0][0] as string,
              amount1: args[0][1] as string,
              path: args[0][2] as string[],
              to: args[0][3] as string
            }

            const transactionReq: TransactionReq = {
              estimatedGas: Number(trade.estimatedGas),
              estimatedEffectiveGasPrice: estimatedEffectiveGasPrice,
              serialized: signedTx,
              raw: swapReq
            }

            let transactions: TransactionReq[] = []
            if (signedApproval) {
              const signedTransactionApproval: TransactionReq = {
                estimatedGas: 25000,
                estimatedEffectiveGasPrice: 0,
                serialized: signedApproval,
                raw: undefined
              }
              transactions = [signedTransactionApproval, transactionReq] // signed approval first
            } else {
              transactions = [transactionReq]
            }

            const bundleReq: BundleReq = {
              transactions,
              chainId,
              bribe: args[1], // need to use calculated bribe ?
              from: account,
              deadline: args[0][4],
              simulateOnly: false
            }

            addTransaction(
              { chainId, hash },
              {
                summary: withRecipient,
                trade
              }
            )

            emitTransactionRequest(bundleReq) // change to emitBundleRequest ?

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
          // Set isMetaMask again after signing. (workaround for an issue with isMetaMask set on the provider during signing)
          if (web3Provider) {
            web3Provider.provider.isMetaMask = isMetamask
          }
          throw new Error(`Approval Failed: ${error.message}`)
        }
      },
      error: null
    }
  }, [trade, library, account, chainId, recipient, recipientAddressOrName, swapCall, approve, addTransaction])
}
