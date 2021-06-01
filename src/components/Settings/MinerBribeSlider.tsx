import React from 'react'
import styled from 'styled-components'
import { useUserBribeMargin } from '../../state/user/hooks'
import { MINER_BRIBE_MIN, MINER_BRIBE_MAX } from '../../constants'
import Slider from './Slider'

const Wrapper = styled.div`
  width: 100%;
  padding: 0 2rem 3rem;
`

const settingsSteps = 4

function settingToValue(setting: number): number {
  const size = MINER_BRIBE_MAX - MINER_BRIBE_MIN
  const value = Math.floor(size / (settingsSteps - 1)) * (setting - 1) + MINER_BRIBE_MIN
  return value
}

function valueToSetting(value: number): number {
  let closest = 1
  for (let i = 2; i <= settingsSteps; i++) {
    const aVal = settingToValue(closest)
    const bVal = settingToValue(i)
    if (Math.abs(bVal - value) < Math.abs(aVal - value)) {
      closest = i
    }
  }
  return closest
}

const MinderBribeSlider = () => {
  const [userBribeMargin, setUserBribeMargin] = useUserBribeMargin()

  const onChange = (setting: number) => {
    setUserBribeMargin(settingToValue(setting))
  }

  return (
    <Wrapper>
      <Slider min={1} max={settingsSteps} step={1} value={valueToSetting(userBribeMargin)} onChange={onChange} />
    </Wrapper>
  )
}

export default MinderBribeSlider
