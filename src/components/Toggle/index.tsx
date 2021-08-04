import React from 'react'
import styled from 'styled-components'

const ToggleElement = styled.span<{ isActive?: boolean; isOnSwitch?: boolean }>`
  height: 26px;
  width: 26px;
  border-radius: 100%;
  background: ${({ theme, isActive, isOnSwitch }) =>
    isActive ? (isOnSwitch ? theme.primary2 : theme.primary2) : 'none'};
  color: ${({ theme, isActive, isOnSwitch }) => (isActive ? (isOnSwitch ? theme.text1 : theme.text1) : theme.text1)};
  font-size: 0.9rem;
  font-weight: ${({ isOnSwitch }) => (isOnSwitch ? '500' : '400')};
  display: flex;
  justify-content: center;
  align-items: center;

  :hover {
    user-select: ${({ isOnSwitch }) => (isOnSwitch ? 'none' : 'initial')};
    background: ${({ theme, isActive, isOnSwitch }) =>
      isActive ? (isOnSwitch ? theme.primary2 : theme.primary2) : 'none'};
    color: ${({ theme, isActive, isOnSwitch }) => (isActive ? (isOnSwitch ? theme.text1 : theme.text1) : theme.text1)};
  }
`

const StyledToggle = styled.button<{ isActive?: boolean; activeElement?: boolean }>`
  border-radius: 26px;
  padding: 0.25rem 0;
  border: 1px solid ${({ theme }) => theme.primary2};
  background: transparent;
  display: flex;
  width: fit-content;
  cursor: pointer;
  outline: none;

  span {
    margin: 0 0.25rem;
  }
`

export interface ToggleProps {
  id?: string
  isActive: boolean
  toggle: () => void
}

export default function Toggle({ id, isActive, toggle }: ToggleProps) {
  return (
    <StyledToggle id={id} isActive={isActive} onClick={toggle}>
      <ToggleElement isActive={isActive} isOnSwitch={true}>
        {!isActive && 'Off'}
      </ToggleElement>
      <ToggleElement isActive={!isActive} isOnSwitch={false}>
        {isActive && 'On'}
      </ToggleElement>
    </StyledToggle>
  )
}
