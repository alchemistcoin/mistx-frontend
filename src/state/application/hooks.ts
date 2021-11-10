import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Fees } from '@alchemist-coin/mistx-connect'
import { useActiveWeb3React } from '../../hooks'
import { AppDispatch, AppState } from '../index'
import {
  addPopup,
  ApplicationModal,
  PopupContent,
  removePopup,
  setOpenModal,
  updateNewAppVersionAvailable,
  toggleSideBar as toggleSideBarAction
} from './actions'

export function useBlockNumber(): number | undefined {
  const { chainId } = useActiveWeb3React()

  return useSelector((state: AppState) => state.application.blockNumber[chainId ?? -1])
}

export function useFees(): Fees | undefined {
  return useSelector((state: AppState) => state.application.fees)
}

export function useModalOpen(modal: ApplicationModal): boolean {
  const openModal = useSelector((state: AppState) => state.application.openModal)
  return openModal === modal
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const open = useModalOpen(modal)
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(open ? null : modal)), [dispatch, modal, open])
}

export function useOpenModal(modal: ApplicationModal): () => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(modal)), [dispatch, modal])
}

export function useCloseModals(): () => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(null)), [dispatch])
}

export function useWalletModalToggle(): () => void {
  return useToggleModal(ApplicationModal.WALLET)
}

export function useToggleSettingsMenu(): () => void {
  return useToggleModal(ApplicationModal.SETTINGS)
}

export function useShowClaimPopup(): boolean {
  return useModalOpen(ApplicationModal.CLAIM_POPUP)
}

export function useToggleShowClaimPopup(): () => void {
  return useToggleModal(ApplicationModal.CLAIM_POPUP)
}

export function useToggleSelfClaimModal(): () => void {
  return useToggleModal(ApplicationModal.SELF_CLAIM)
}

export function useTransactionErrorModalOpen(): any {
  const modalPerfernce = localStorage.getItem('hideMMHardwareModal')
  const openModal = useSelector((state: AppState) => state.application.openModal)
  return openModal === ApplicationModal.MMHARDWARE && !modalPerfernce
}

// returns a function that allows adding a popup
export function useAddPopup(): (content: PopupContent, key?: string, removeAfterMs?: number) => void {
  const dispatch = useDispatch()

  return useCallback(
    (content: PopupContent, key?: string, removeAfterMs?: number) => {
      dispatch(addPopup({ content, key, removeAfterMs }))
    },
    [dispatch]
  )
}

// returns a function that allows removing a popup via its key
export function useRemovePopup(): (key: string) => void {
  const dispatch = useDispatch()
  return useCallback(
    (key: string) => {
      dispatch(removePopup({ key }))
    },
    [dispatch]
  )
}

// get the list of active popups
export function useActivePopups(): AppState['application']['popupList'] {
  const list = useSelector((state: AppState) => state.application.popupList)
  return useMemo(() => list.filter(item => item.show), [list])
}

export function useSocketStatus(): AppState['application']['socketStatus'] {
  return useSelector<AppState, AppState['application']['socketStatus']>(state => state.application.socketStatus)
}

export function useNewAppVersionAvailable(): [boolean, (newAppVersionAvailable: boolean) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const newAppVersionAvailable = useSelector<AppState, AppState['application']['newAppVersionAvailable']>(
    state => state.application.newAppVersionAvailable
  )

  const setnewAppVersionAvailable = useCallback(
    (newAppVersionAvailable: boolean) => dispatch(updateNewAppVersionAvailable(newAppVersionAvailable)),
    [dispatch]
  )

  return [newAppVersionAvailable, setnewAppVersionAvailable]
}

export function useSideBarOpen(): any {
  const dispatch = useDispatch()
  const sideBarOpen = useSelector((state: AppState) => state.application.sideBarOpen)

  const toggleSideBar = useCallback(() => {
    dispatch(toggleSideBarAction())
    if (window.Intercom) {
      window.Intercom('hide')
      window.Intercom('update', {
        hide_default_launcher: !sideBarOpen
      })
    }
    if (sideBarOpen) {
      document.body.classList.remove('scroll-disable')
    } else {
      document.body.classList.add('scroll-disable')
    }
  }, [dispatch, sideBarOpen])

  return useMemo(() => ({ sideBarOpen, toggleSideBar }), [sideBarOpen, toggleSideBar])
}
