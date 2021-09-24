import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { keccak256 } from '@ethersproject/keccak256'
import { updateSocketStatus } from '../state/application/actions'
import PJSON from '../../package.json'
import { MANUAL_CHECK_TX_STATUS_INTERVAL } from '../constants'
import FATHOM_GOALS from '../constants/fathom'
import {
  BundleProcessed,
  BundleReq,
  BundleRes,
  BundleResApi,
  Event,
  Fees,
  MistxSocket,
  Status,
  TransactionProcessed
} from '@alchemist-coin/mistx-connect'
import { setOpenModal, ApplicationModal } from '../state/application/actions'

// state
import { updateFees } from '../state/application/actions'
import { useSocketStatus, useNewAppVersionAvailable } from '../state/application/hooks'
import {
  useAllTransactions,
  useTransactionRemover,
  useTransactionUpdater,
  usePendingTransactions,
  useGetBundleByID
} from 'state/transactions/hooks'

import { useAddPopup } from 'state/application/hooks'
import { BigNumber } from 'ethers'

export const STATUS_LOCALES: Record<string, string> = {
  PENDING_BUNDLE: 'Flashbots working on including your swap',
  FAILED_BUNDLE: 'Failed',
  SUCCESSFUL_BUNDLE: 'Success',
  CANCEL_BUNDLE_SUCCESSFUL: 'Cancelled',
  BUNDLE_NOT_FOUND: 'Failed'
}

export enum Diagnosis {
  LOWER_THAN_TAIL = 'LOWER_THAN_TAIL',
  NOT_A_FLASHBLOCK = 'NOT_A_FLASHBLOCK',
  BUNDLE_OUTBID = 'BUNDLE_OUTBID',
  ERROR_API_BEHIND = 'ERROR_API_BEHIND',
  MISSING_BLOCK_DATA = 'MISSING_BLOCK_DATA',
  ERROR_UNKNOWN = 'ERROR_UNKNOWN'
}

export interface MistXVersion {
  api: string
  client: string
}

export interface SocketSession {
  token: string
  version: MistXVersion | undefined
}

function bundleResponseToastStatus(bundle: BundleRes | BundleResApi) {
  let pending = false
  let success = false
  let message = bundle.message
  const processedBundle = bundle.bundle as BundleProcessed

  switch (bundle.status) {
    case Status.FAILED_BUNDLE:
      message = 'Transaction failed - No Fee Taken'
      break
    case Status.PENDING_BUNDLE:
      pending = true
      break
    case Status.SUCCESSFUL_BUNDLE:
      message = 'Successful Transaction'

      if (processedBundle.backrun.best.count > 0) {
        message += `. Congratulations, you earned $${processedBundle.backrun.best.totalValueUSD} in rewards sent to your wallet!`
      }

      success = true
      break
    case Status.CANCEL_BUNDLE_SUCCESSFUL:
      message = 'Transaction Cancelled - For Free'
      success = true
      break
    case Status.BUNDLE_NOT_FOUND:
      message = 'Transaction failed - No Fee Taken'
      break
    default:
      pending = true
      break
  }

  return {
    pending,
    success,
    message,
    status: bundle.status
  }
}

const getTransactionHashes = (bundle: BundleProcessed): string[] =>
  bundle.transactions.map((t: TransactionProcessed) => keccak256(t.serialized))

const serverUrl = (process.env.REACT_APP_SERVER_URL as string) || 'http://localhost:4000'

const socket = new MistxSocket(serverUrl)

export default function Sockets(): null {
  const updateTxReqInterval = useRef<any>(null)
  const dispatch = useDispatch()
  const addPopup = useAddPopup()
  const allTransactions = useAllTransactions()
  const updateTransaction = useTransactionUpdater()
  const removeTransaction = useTransactionRemover()
  const pendingTransactions = usePendingTransactions()
  const webSocketConnected = useSocketStatus()
  const getBundleByID = useGetBundleByID()
  const [newAppVersionAvailable, setNewAppVersionAvailable] = useNewAppVersionAvailable()

  useEffect(() => {
    const disconnect = socket.init({
      onConnect: () => {
        // console.log('websocket connected')
        dispatch(updateSocketStatus(true))
      },
      onConnectError: err => {
        // console.log('websocket connect error', err)
        dispatch(updateSocketStatus(false))
      },
      onDisconnect: err => {
        // console.log('websocket disconnect', err)
        dispatch(updateSocketStatus(false))
      },
      onError: err => {
        // console.log('websocket err', err)
        if (err.event === Event.MISTX_BUNDLE_REQUEST) {
          const bundleResponse = err.data as BundleRes
          const hashes = getTransactionHashes(bundleResponse.bundle)
          const hash: string | undefined = hashes.find((h: string) => !!allTransactions?.[h])

          if (!hash) return // TODO: log and handle this error

          if (allTransactions?.[hash]) {
            removeTransaction({
              chainId: bundleResponse.bundle.chainId,
              hash
            })
          }
        }
      },
      onSocketSession: session => {
        const { version } = session
        // check client version and notify user to refresh page
        // if the client version is not equal to the version.client
        // received in the session payload
        if (!newAppVersionAvailable && version && PJSON && version.client !== PJSON.version) {
          setNewAppVersionAvailable(true)
        } else if (newAppVersionAvailable) {
          setNewAppVersionAvailable(false)
        }
      },
      onFeesChange: (fees: Fees) => {
        dispatch(updateFees(fees))
      },
      onTransactionResponse: response => {
        const { bundle: b, message, status } = response

        const bundle = b && typeof b === 'string' ? getBundleByID(b)?.processed : (b as BundleProcessed)
        const hashes = getTransactionHashes(bundle as BundleProcessed)
        const hash: string | undefined = hashes.find((h: string) => !!allTransactions?.[h])

        if (!hash) return // TODO: handle this if necessary

        const tx = allTransactions?.[hash]
        const summary = tx?.summary
        const previouslyCompleted = tx?.status !== Status.PENDING_BUNDLE && tx?.receipt

        if (!bundle || !bundle.chainId) return

        const transactionId = {
          chainId: bundle.chainId,
          hash
        }

        if (status === Status.CANCEL_BUNDLE_SUCCESSFUL && window.fathom) {
          window.fathom.trackGoal(FATHOM_GOALS.CANCEL_COMPLETE, 0)
        }

        // TO DO - Handle response.status === BUNDLE_NOT_FOUND - ??
        if (!previouslyCompleted) {
          updateTransaction(transactionId, {
            bundle: bundle,
            message: message,
            status: status,
            updatedAt: new Date().getTime()
          })
          if (status === Status.SUCCESSFUL_BUNDLE && window.fathom) {
            window.fathom.trackGoal(FATHOM_GOALS.SWAP_COMPLETE, 0)
          }
          if (
            status === Status.SUCCESSFUL_BUNDLE ||
            status === Status.FAILED_BUNDLE ||
            status === Status.CANCEL_BUNDLE_SUCCESSFUL ||
            status === Status.BUNDLE_NOT_FOUND
          ) {
            addPopup(
              {
                txn: {
                  hash,
                  summary,
                  ...bundleResponseToastStatus(response)
                }
              },
              hash,
              60000
            )
            const { ethereum } = window
            const isMetaMask = !!(ethereum && ethereum.isMetaMask)
            const hideWHardwareWalletWarningModalPerference =
              localStorage.getItem('hideHardwareWarningModal') === 'true'
            if (response.error === 'nonce too high' && isMetaMask && !hideWHardwareWalletWarningModalPerference) {
              dispatch(setOpenModal(ApplicationModal.MMHARDWARE))
            }
          }
        }
      }
    })
    return () => {
      disconnect()
    }
  }, [
    addPopup,
    dispatch,
    allTransactions,
    getBundleByID,
    removeTransaction,
    updateTransaction,
    newAppVersionAvailable,
    setNewAppVersionAvailable
  ])

  // Check each pending transaction every x seconds and fetch an update if the time passed since the last update is more than MANUAL_CHECK_TX_STATUS_INTERVAL (seconds)
  // TO DO - We need chainId and processed.swap.deadline
  useEffect(() => {
    if (updateTxReqInterval.current) clearInterval(updateTxReqInterval.current)
    if (pendingTransactions && Object.keys(pendingTransactions).length) {
      updateTxReqInterval.current = setInterval(() => {
        if (!webSocketConnected) return
        const timeNow = new Date().getTime()
        Object.keys(pendingTransactions).forEach(hash => {
          const tx = pendingTransactions[hash]
          let isDead = false
          if (tx.deadline) {
            const deadline = BigNumber.from(tx.deadline || 1200).toNumber() * 1000
            if (deadline <= timeNow - MANUAL_CHECK_TX_STATUS_INTERVAL * 1000) isDead = true
          }
          if (tx.processed && isDead && tx.chainId) {
            const transactionId = {
              chainId: tx.chainId,
              hash
            }
            updateTransaction(transactionId, {
              bundle: tx.processed,
              message: 'Transaction Expired',
              status: Status.FAILED_BUNDLE,
              updatedAt: timeNow
            })
          } else if (tx.updatedAt) {
            // console.log('CHECK STATUS', tx)
            const secondsSinceLastUpdate = (timeNow - tx.updatedAt) / 1000
            if (secondsSinceLastUpdate > MANUAL_CHECK_TX_STATUS_INTERVAL && tx.processed) {
              // const transactionReq: TransactionProcessed = tx.processed
              socket.emitStatusRequest(tx.processed.id)
            }
          }
        })
      }, 5000)
    } else {
      clearInterval(updateTxReqInterval.current)
    }
    return () => {
      if (updateTxReqInterval.current) clearInterval(updateTxReqInterval.current)
    }
  }, [pendingTransactions, updateTransaction, webSocketConnected])

  return null
}

export function emitTransactionRequest(bundle: BundleReq) {
  socket.emitTransactionRequest(bundle)
}

export function emitTransactionCancellation(id: string) {
  // TO DO any
  socket.emitTransactionCancellation(id)
}
