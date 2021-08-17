import React from 'react'
import styled from 'styled-components'
import { Text } from 'rebass'
import { ReactComponent as Icon } from '../../assets/svg/gas-icon.svg'
import { RowFixed } from '../Row'
import useBaseFeePerGas from 'hooks/useBaseFeePerGas'

const IconContainer = styled.div`
  height: 20px;
  width: 20px;
`

export default function GasTracker() {
  const [, , baseFee] = useBaseFeePerGas()

  if (!baseFee) return null

  return (
    <RowFixed>
      <IconContainer>
        <Icon />
      </IconContainer>
      <Text fontSize="14px" fontWeight="500" margin="0 .5rem">{`${baseFee?.div(1000000000).toString()} Gwei`}</Text>
    </RowFixed>
  )
}
