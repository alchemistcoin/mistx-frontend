import { PopulatedTransaction } from '@ethersproject/contracts'
import { BigNumber } from '@ethersproject/bignumber'
import { Trade, Currency, TradeType } from '@alchemist-coin/mistx-core'
import { formatUnits } from 'ethers/lib/utils'
import { useMemo } from 'react'
import { useTransactionAdder } from '../state/transactions/hooks'
import { isAddress, shortenAddress } from '../utils'
import isZero from '../utils/isZero'
import { useActiveWeb3React } from './index'
import useENS from './useENS'
import useTransactionDeadline from './useTransactionDeadline'
import { INITIAL_ALLOWED_SLIPPAGE, MISTX_DEFAULT_GAS_LIMIT } from '../constants'
import { ethers } from 'ethers'
import { keccak256 } from 'ethers/lib/utils'
import { SignatureLike } from '@ethersproject/bytes'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { useApproveCallbackFromTrade } from './useApproveCallback'
import { useSwapCallArguments } from './useSwapCallArguments'
import useBaseFeePerGas from './useBaseFeePerGas'
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
  const deadline = useTransactionDeadline()
  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress
  const { maxBaseFeePerGas } = useBaseFeePerGas()
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
            const nonce =
              signedApproval === undefined
                ? await contract.signer.getTransactionCount()
                : await contract.signer.getTransactionCount().then(nonce => {
                    return nonce + 1
                  })
            const populatedTx: PopulatedTransaction = await contract.populateTransaction[methodName](...args, {
              //modify nonce if we also have an approval
              nonce: nonce,
              gasLimit: BigNumber.from(MISTX_DEFAULT_GAS_LIMIT),
              type: 2,
              maxFeePerGas: maxBaseFeePerGas,
              maxPriorityFeePerGas: '0x0',
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
              const payload = [
                {
                  ...populatedTx,
                  chainId: undefined,
                  gas: `0x${populatedTx.gasLimit?.toNumber().toString(16)}`,
                  gasLimit: `0x${populatedTx.gasLimit?.toNumber().toString(16)}`,
                  maxFeePerGas: `0x${populatedTx.maxFeePerGas?.toNumber().toString(18)}`,
                  maxPriorityFeePerGas: '0x0',
                  nonce: `0x${populatedTx.nonce?.toString(16)}`,
                  ...(value && !isZero(value) ? { value } : { value: '0x0' })
                }
              ]
              const signedTxRes: SignedTransactionResponse = await library.jsonRpcFetchFunc(
                'eth_signTransaction',
                payload
              )
              signedTx = signedTxRes.raw
            }

            // Set isMetaMask again after signing. (workaround for an issue with isMetaMask set on the provider during signing)
            if (web3Provider) {
              web3Provider.provider.isMetaMask = isMetamask
            }

            const parsed = ethers.utils.parseTransaction(signedTx)

            if (parsed.from !== account) {
              // console.log("DETECTED ACCOUNTS DON'T MATCH")
              if (isMetamask) {
                throw new Error(
                  'MistX does not support Hard Wallets connected through MetaMask. If you are using Ledger, please connect it directly.'
                )
              } else {
                throw new Error(
                  'The wallet used does not support eth_signTransaction. Try using MetaMask or connect your Ledger directly.'
                )
              }
            }

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

            console.log('signed tx', signedTx, hash)

            const minerBribeBN = BigNumber.from(args[1])
            const totalFees = minerBribeBN
            // if (baseFeePerGas && populatedTx.gasLimit) {
            //   // totalFees = totalFees.add(baseFeePerGas.mul(trade.estimatedGas.toString()))
            //   const requiredFunds = baseFeePerGas.mul(populatedTx.gasLimit).add(value)
            //   console.log('requiredFunds', requiredFunds.toString())
            // }
            const estimatedEffectiveGasPriceBn = totalFees.div(BigNumber.from(trade.estimatedGas))
            const estimatedEffectiveGasPrice = Number(formatUnits(estimatedEffectiveGasPriceBn, 'gwei'))
            const swapReq: SwapReq = {
              amount0: args[0][0] as string,
              amount1: args[0][1] as string,
              path: args[0][2] as string[],
              to: args[0][3] as string
            }

            // Create the transaction body with the serialized tx
            const transactionReq: TransactionReq = {
              estimatedGas: Number(trade.estimatedGas),
              estimatedEffectiveGasPrice: estimatedEffectiveGasPrice,
              serialized: signedTx,
              raw: swapReq
            }

            // Create the transactions array with the serialized tx object
            const transactions: TransactionReq[] = [transactionReq]

            // Check if there is a signed approval with this tx
            // (token -> eth & token -> token transactions require signed approval)
            if (signedApproval) {
              // if there is an approval, create the Approval tx object
              const signedTransactionApproval: TransactionReq = {
                estimatedGas: 25000,
                estimatedEffectiveGasPrice: 0,
                serialized: signedApproval,
                raw: undefined
              }
              // Add the approval to the transactions array
              transactions.unshift(signedTransactionApproval) // signed approval first
            }

            // Creat the bundle request object
            const bundleReq: BundleReq = {
              transactions,
              chainId,
              bribe: args[1], // need to use calculated bribe ?
              from: account,
              deadline: BigNumber.from(Math.floor(Date.now() / 1000))
                .add(deadline)
                .toHexString(),
              simulateOnly: false
            }

            // dispatch "add transaction" action
            addTransaction(
              { chainId, hash },
              {
                summary: withRecipient,
                trade
              }
            )

            // emit transaction request socket event
            emitTransactionRequest(bundleReq) // change to emitBundleRequest ?

            return hash // return the hash of the transaction (transaction identifier)
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
  }, [
    deadline,
    trade,
    library,
    account,
    chainId,
    recipient,
    recipientAddressOrName,
    swapCall,
    approve,
    addTransaction,
    maxBaseFeePerGas
  ])
}
