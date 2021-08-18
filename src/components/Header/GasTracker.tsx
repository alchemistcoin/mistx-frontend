import React from 'react'
import styled from 'styled-components'
import { Text } from 'rebass'
import { ReactComponent as Icon } from '../../assets/svg/gas-icon.svg'
import useBaseFeePerGas from 'hooks/useBaseFeePerGas'
import { ExternalLink } from 'theme'
import useTheme from 'hooks/useTheme'
import { BigNumber } from 'ethers'

const IconContainer = styled.div`
  height: 26px;
  width: 12px;
`

const StyledExternalLink = styled(ExternalLink)`
  align-items: center;
  display: flex;

  &:hover {
    text-decoration: none;
  }
`

function useGetWarningColor(number: BigNumber | undefined) {
  const theme = useTheme()

  if (!number) return 'white'
  if (number.gt(200)) return theme.red1
  if (number.gt(100)) return theme.yellow2
  if (number.lt(50)) return theme.green1

  return 'white'
}

export default function GasTracker({ className }: { className?: string | undefined }) {
  const { baseFeePerGas: baseFee } = useBaseFeePerGas()

  const baseFeeGwei = baseFee?.div(1000000000)
  const color = useGetWarningColor(baseFeeGwei)

  return (
    <StyledExternalLink className={className} href="https://etherscan.io/gastracker">
      <IconContainer>
        <Icon style={{ fill: color }} />
      </IconContainer>
      <Text color={color} fontSize="11px" fontWeight="500" marginLeft=".25rem">
        {baseFeeGwei ? baseFeeGwei.toString() : '...'}
      </Text>
    </StyledExternalLink>
  )
}
