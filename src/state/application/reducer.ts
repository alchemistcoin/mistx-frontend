import { createReducer, nanoid } from '@reduxjs/toolkit'
import { Fees } from '../../../../alchemist-sdk/packages/mistx-connect/dist'
import {
  addPopup,
  PopupContent,
  removePopup,
  updateBlockNumber,
  updateFees,
  ApplicationModal,
  setOpenModal,
  updateSocketStatus,
  updateNewAppVersionAvailable,
  toggleSideBar
} from './actions'

type PopupList = Array<{ key: string; show: boolean; content: PopupContent; removeAfterMs: number | null }>
export interface ApplicationState {
  readonly blockNumber: { readonly [chainId: number]: number }
  readonly popupList: PopupList
  readonly openModal: ApplicationModal | null
  readonly fees: Fees | undefined
  readonly socketStatus: boolean
  readonly newAppVersionAvailable: boolean
  readonly sideBarOpen: boolean
}

const initialState: ApplicationState = {
  blockNumber: {},
  popupList: [],
  openModal: null,
  fees: undefined,
  socketStatus: true,
  newAppVersionAvailable: false,
  sideBarOpen: false
}

export default createReducer(initialState, builder =>
  builder
    .addCase(updateBlockNumber, (state, action) => {
      const { chainId, blockNumber } = action.payload
      if (typeof state.blockNumber[chainId] !== 'number') {
        state.blockNumber[chainId] = blockNumber
      } else {
        state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId])
      }
    })
    .addCase(updateFees, (state, action) => {
      const fees = action.payload
      state.fees = fees
    })
    .addCase(setOpenModal, (state, action) => {
      state.openModal = action.payload
    })
    .addCase(addPopup, (state, { payload: { content, key, removeAfterMs = 15000 } }) => {
      state.popupList = (key ? state.popupList.filter(popup => popup.key !== key) : state.popupList).concat([
        {
          key: key || nanoid(),
          show: true,
          content,
          removeAfterMs
        }
      ])
    })
    .addCase(removePopup, (state, { payload: { key } }) => {
      state.popupList.forEach(p => {
        if (p.key === key) {
          p.show = false
        }
      })
    })
    .addCase(updateSocketStatus, (state, action) => {
      state.socketStatus = action.payload
    })
    .addCase(updateNewAppVersionAvailable, (state, action) => {
      state.newAppVersionAvailable = action.payload
    })
    .addCase(toggleSideBar, state => {
      state.sideBarOpen = !state.sideBarOpen
    })
)
