import React, { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { TYPE, ExternalLink } from '../../theme'

import { useBlockNumber } from '../../state/application/hooks'
import { getEtherscanLink } from '../../utils'
import { useActiveWeb3React } from '../../hooks'

const StyledPolling = styled.div`
  color: ${({ theme }) => theme.green1};
  display: flex;
  margin-bottom: 1rem;
  padding: 0 1rem;
  transition: opacity 0.25s ease;

  :hover {
    opacity: 1;
  }
`

const StyledPollingDot = styled.div`
  background-color: ${({ theme }) => theme.green1};
  border-radius: 50%;
  height: 8px;
  margin-left: 0.5rem;
  margin-top: 4px;
  min-height: 8px;
  min-width: 8px;
  position: relative;
  width: 8px;
`

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const Spinner = styled.div`
  animation: ${rotate360} 1s cubic-bezier(0.83, 0, 0.17, 1) infinite;
  background: transparent;
  border-bottom: 1px solid transparent;
  border-left: 2px solid ${({ theme }) => theme.green1};
  border-radius: 50%;
  border-right: 1px solid transparent;
  border-top: 1px solid transparent;
  height: 14px;
  left: -3px;
  width: 14px;
  position: relative;
  transform: translateZ(0);
  top: -3px;
`

export default function Polling() {
  const { chainId } = useActiveWeb3React()

  const blockNumber = useBlockNumber()

  const [isMounted, setIsMounted] = useState(true)

  useEffect(
    () => {
      const timer1 = setTimeout(() => setIsMounted(true), 1000)
      // this will clear Timeout when component unmount like in willComponentUnmount
      return () => {
        setIsMounted(false)
        clearTimeout(timer1)
      }
    },
    [blockNumber] //useEffect will run only one time
    //if you pass a value to array, like this [data] than clearTimeout will run every time this value changes (useEffect re-run)
  )

  return (
    <ExternalLink href={chainId && blockNumber ? getEtherscanLink(chainId, blockNumber.toString(), 'block') : ''}>
      <StyledPolling>
        <TYPE.small>{blockNumber ? `Block ${blockNumber}` : 'Loading Block...'}</TYPE.small>
        <StyledPollingDot>{!isMounted && <Spinner />}</StyledPollingDot>
      </StyledPolling>
    </ExternalLink>
  )
}
