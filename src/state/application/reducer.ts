import { createReducer, nanoid } from '@reduxjs/toolkit'
import {
  addPopup,
  PopupContent,
  removePopup,
  updateBlockNumber,
  updateGas,
  ApplicationModal,
  setOpenModal
} from './actions'

type PopupList = Array<{ key: string; show: boolean; content: PopupContent; removeAfterMs: number | null }>

export interface Gas {
  readonly rapid: string
  readonly fast: string
  readonly slow: string
  readonly standard: string
  readonly timestamp: number
}
export interface ApplicationState {
  readonly blockNumber: { readonly [chainId: number]: number }
  readonly popupList: PopupList
  readonly openModal: ApplicationModal | null
  readonly gas: Gas | undefined
}

const initialState: ApplicationState = {
  blockNumber: {},
  popupList: [],
  openModal: null,
  gas: undefined
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
    .addCase(updateGas, (state, action) => {
      const { gas } = action.payload
      state.gas = gas
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
)
