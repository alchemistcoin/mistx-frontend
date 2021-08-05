import React from 'react'
import styled from 'styled-components'
import Slider from './Slider'

const Wrapper = styled.div`
  width: 100%;
  padding: 0 2rem 3rem;
`
type Props = {
  onChange: any
  value: number
  steps: number
}

const MinderBribeSlider = ({ onChange, value, steps }: Props) => {
  return (
    <Wrapper>
      <Slider min={1} max={steps} step={1} value={value} onChange={onChange} name="miner-tip" />
    </Wrapper>
  )
}

export default MinderBribeSlider
