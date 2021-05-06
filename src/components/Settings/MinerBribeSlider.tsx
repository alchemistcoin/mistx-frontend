import React from 'react'
import { useUserBribeMargin } from '../../state/user/hooks'
import {StyledMinerBribe} from './styled';
import { MINER_BRIBE_MIN, MINER_BRIBE_MAX } from '../../constants'

const MinderBribeSlider = () => {
  
  const [userBribeMargin, setUserBribeMargin] = useUserBribeMargin()
  
  const onChange = ((e: React.ChangeEvent<HTMLInputElement>) => setUserBribeMargin(Number(e.target.value)));

  return (
    <StyledMinerBribe>
      <input type="range" min={MINER_BRIBE_MIN} max={MINER_BRIBE_MAX} step="1" value={userBribeMargin} onChange={onChange} name="minerBribeMargin" />
      <div>{userBribeMargin} %</div>
    </StyledMinerBribe>
  )
}

export default MinderBribeSlider;