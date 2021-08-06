import React from 'react'
import styled, { css } from 'styled-components'
import { useSideBarOpen } from '../../state/application/hooks'

const StyledOverlay = styled.div<{ open?: boolean }>`
  position: absolute;
  display: none;
  visibility: hidden;
  top: 0;
  left: 0;
  content: '';
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  transition: 0.25s ease;
  opacity: 0;
  z-index: 99;
  ${props =>
    props.open
      ? css`
          display: block;
          visibility: visible;
          opacity: 1;
        `
      : ``};
`

export default function Overlay() {
  const { sideBarOpen, toggleSideBar } = useSideBarOpen()
  return <StyledOverlay open={sideBarOpen} onClick={toggleSideBar} />
}
