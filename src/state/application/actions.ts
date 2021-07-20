import { createAction } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'
import { Status, TransactionProcessed } from 'websocket'
import { Gas } from './reducer'

export type PopupContent =
  | {
      txn: {
        hash: string
        success: boolean
        pending: boolean
        summary?: string
        status?: Status | string
        message?: string
        transaction?: TransactionProcessed
      }
    }
  | {
      listUpdate: {
        listUrl: string
        oldList: TokenList
        newList: TokenList
        auto: boolean
      }
    }

export enum ApplicationModal {
  WALLET,
  SETTINGS,
  SELF_CLAIM,
  ADDRESS_CLAIM,
  CLAIM_POPUP,
  MENU,
  DELEGATE,
  VOTE
}

export const updateGas = createAction<Gas>('application/updateGas')
export const updateBlockNumber = createAction<{ chainId: number; blockNumber: number }>('application/updateBlockNumber')
export const setOpenModal = createAction<ApplicationModal | null>('application/setOpenModal')
export const addPopup = createAction<{ key?: string; removeAfterMs?: number | null; content: PopupContent }>(
  'application/addPopup'
)
export const removePopup = createAction<{ key: string }>('application/removePopup')
export const updateSocketStatus = createAction<boolean>('application/updateSocketStatus')
export const updateNewAppVersionAvailable = createAction<boolean>('application/updateNewAppVersionAvailable')
