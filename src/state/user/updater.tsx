import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import { tipValueToSetting, tipSettingToValue } from './reducer'
import { updateMatchesDarkMode, updateUserBribeMargin } from './actions'

export default function Updater(): null {
  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector<AppState, AppState['user']>(state => state.user)
  const [updatedDefaultUserSettings, setUpdatedDefaultUserSettings] = useState<boolean>(false)
  useEffect(() => {
    if (updatedDefaultUserSettings) return
    if (state) {
      // make sure users tip margin is aligned with the default setting
      // the users tip setting needs to be updated if the default settings change
      const closestSettingValue = tipValueToSetting(state.userBribeMargin)
      const newBribeMargin = tipSettingToValue(closestSettingValue)
      if (newBribeMargin !== state.userBribeMargin){
        dispatch(updateUserBribeMargin({ userBribeMargin: newBribeMargin }))
      }
    }
    setUpdatedDefaultUserSettings(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])
  // keep dark mode in sync with the system
  useEffect(() => {
    const darkHandler = (match: MediaQueryListEvent) => {
      dispatch(updateMatchesDarkMode({ matchesDarkMode: match.matches }))
    }

    const match = window?.matchMedia('(prefers-color-scheme: dark)')
    dispatch(updateMatchesDarkMode({ matchesDarkMode: match.matches }))

    if (match?.addListener) {
      match?.addListener(darkHandler)
    } else if (match?.addEventListener) {
      match?.addEventListener('change', darkHandler)
    }

    return () => {
      if (match?.removeListener) {
        match?.removeListener(darkHandler)
      } else if (match?.removeEventListener) {
        match?.removeEventListener('change', darkHandler)
      }
    }
  }, [dispatch])

  return null
}
