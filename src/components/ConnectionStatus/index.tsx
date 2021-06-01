import React from 'react'
import styled, { keyframes } from 'styled-components'
import { TYPE } from '../../theme'
import { useSocketStatus } from 'state/application/hooks'

const StyledPolling = styled.div<{ connected: boolean }>`
  position: fixed;
  display: flex;
  right: 0;
  bottom: 0;
  padding: 1rem;
  color: white;
  transition: opacity 0.25s ease;
  color: ${({ theme, connected }) => (connected ? theme.green1 : theme.red3)};

  :hover {
    opacity: 1;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    bottom: 100px;
  `}
`
const StyledPollingDot = styled.div<{ connected: boolean }>`
  width: 8px;
  height: 8px;
  min-height: 8px;
  min-width: 8px;
  margin-left: 0.5rem;
  margin-top: 3px;
  border-radius: 50%;
  position: relative;
  background-color: ${({ theme, connected }) => (connected ? theme.green1 : theme.red3)};
`

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const Spinner = styled.div<{ connected: boolean }>`
  animation: ${rotate360} 1s cubic-bezier(0.83, 0, 0.17, 1) infinite;
  transform: translateZ(0);
  border-top: 1px solid transparent;
  border-right: 1px solid transparent;
  border-bottom: 1px solid transparent;
  border-left: 2px solid ${({ theme, connected }) => (connected ? theme.green1 : theme.red3)};
  background: transparent;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  position: relative;
  left: -3px;
  top: -3px;
`

export default function ConnectionStatus() {
  const webSocketsConnected = useSocketStatus()

  return (
    <StyledPolling connected={webSocketsConnected}>
      <TYPE.small>{webSocketsConnected ? 'Connected' : 'Reconnecting'}</TYPE.small>
      <StyledPollingDot connected={webSocketsConnected}>
        {!webSocketsConnected && <Spinner connected={webSocketsConnected} />}
      </StyledPollingDot>
    </StyledPolling>
  )
}
