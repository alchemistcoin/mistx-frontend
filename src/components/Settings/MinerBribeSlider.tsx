import React from 'react'
import styled from 'styled-components'
import { BribeEstimate } from '@alchemistcoin/sdk'
import { useUserBribeMargin } from '../../state/user/hooks'
// import { MINER_BRIBE_MIN, MINER_BRIBE_MAX } from '../../constants'
import Slider from './Slider'
import useMinerBribeEstimate from '../../hooks/useMinerBribeEstimate'

const Wrapper = styled.div`
  width: 100%;
  padding: 0 2rem 3rem;
`

// const LabelWrapper = styled.div`
//   width: 100%;
//   display: flex;
//   flex-direction: row;
//   justify-content: space-between;
//   padding: 1rem 0 0;

//   > div {
//     display: flex;
//     color: ${({ theme }) => theme.text1};
//     font-size: 0.8rem;
//   }
// `

// const SLIDER_VALUE_TO_METHOD_MAP: any = {
//   '1': 'minBribe',
//   '2': 'meanBribe',
//   '3': 'maxBribe',
//   '4': 'ASAP' // TODO - ??
// }

const MinderBribeSlider = () => {
  const bribeEstimate: BribeEstimate | null = useMinerBribeEstimate()
  const [userBribeMargin, setUserBribeMargin] = useUserBribeMargin()

  const onChange = (value: number) => {
    setUserBribeMargin(value)
  }
  console.log('bribe estimate', bribeEstimate)
  console.log('bribe userBribeMargin', userBribeMargin)

  return (
    <Wrapper>
      <Slider min={1} max={4} step={1} value={userBribeMargin} onChange={onChange} />
    </Wrapper>
  )
}

export default MinderBribeSlider
