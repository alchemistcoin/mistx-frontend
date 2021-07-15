import React from 'react'
import styled from 'styled-components'
import { useUserBribeMargin } from '../../state/user/hooks'
import { TipSettingsSteps, tipSettingToValue, tipValueToSetting } from '../../state/user/reducer'
import Slider from './Slider'

const Wrapper = styled.div`
  width: 100%;
  padding: 0 2rem 3rem;
`

const MinderBribeSlider = () => {
  const [userBribeMargin, setUserBribeMargin] = useUserBribeMargin()

  const onChange = (setting: number) => {
    setUserBribeMargin(tipSettingToValue(setting))
  }

  return (
    <Wrapper>
      <Slider min={1} max={TipSettingsSteps} step={1} value={tipValueToSetting(userBribeMargin)} onChange={onChange} />
    </Wrapper>
  )
}

export default MinderBribeSlider
