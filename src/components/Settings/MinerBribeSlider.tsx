import React from 'react'
//import styled from 'styled-components';
import { useUserBribeMargin } from '../../state/user/hooks'
import { StyledMinerBribe } from './styled'
import Row from '../../components/Row'
import { MINER_BRIBE_MIN, MINER_BRIBE_MAX } from '../../constants'

// const Wrapper = styled.div`

// `;

const MinderBribeSlider = () => {
  const [userBribeMargin, setUserBribeMargin] = useUserBribeMargin()

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setUserBribeMargin(Number(e.target.value))

  return (
    <StyledMinerBribe>
      <Row width="100%">
        <input
          type="range"
          min={MINER_BRIBE_MIN}
          max={MINER_BRIBE_MAX}
          step="1"
          value={userBribeMargin}
          onChange={onChange}
          name="minerBribeMargin"
        />
        <div>{userBribeMargin} %</div>
      </Row>

    </StyledMinerBribe>
  )
}

export default MinderBribeSlider
