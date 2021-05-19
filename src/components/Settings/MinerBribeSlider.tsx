import React from 'react'
import styled from 'styled-components'
import { useUserBribeMargin } from '../../state/user/hooks'
import { MINER_BRIBE_MIN, MINER_BRIBE_MAX } from '../../constants'
import Slider from './Slider'

const Wrapper = styled.div`
  width: 100%;
`

const LabelWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 1rem 0 0;

  > div {
    display: flex;
    color: ${({ theme }) => theme.text1};
    font-size: 0.8rem;
  }
`

const MinderBribeSlider = () => {
  const [userBribeMargin, setUserBribeMargin] = useUserBribeMargin()

  const onChange = (value: number) => setUserBribeMargin(value)

  return (
    <Wrapper>
      <Slider min={MINER_BRIBE_MIN} max={MINER_BRIBE_MAX} step={1} value={userBribeMargin} onChange={onChange} />
      <LabelWrapper>
        <div>low success rates (low fees)</div>
        <div>high success rate ($$)</div>
      </LabelWrapper>
    </Wrapper>
  )
}

export default MinderBribeSlider
