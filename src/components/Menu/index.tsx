import React, { useRef } from 'react'
import { Info } from 'react-feather'
import styled from 'styled-components'
import { lighten } from 'polished'
import { ReactComponent as MenuIcon } from '../../assets/images/menu.svg'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleModal } from '../../state/application/hooks'
import { ExternalLink } from '../../theme'

const StyledMenuIcon = styled(MenuIcon)`
  path {
    stroke: ${({ theme }) => theme.text1};
  }
`

const StyledMenuButton = styled.button`
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;

  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => lighten(0.05, theme.bg2)};
  }

  svg {
    margin-top: 2px;
  }
`

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

const MenuFlyout = styled.span`
  min-width: 8.75rem;
  background-color: ${({ theme }) => theme.bg3};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 2.5rem;
  right: 0rem;
  z-index: 100;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    top: -5.6rem;
    left: 0;
  `};
`

const MenuItem = styled(ExternalLink)`
  flex: 1;
  padding: 0.5rem 0.5rem;
  color: ${({ theme }) => theme.text2};
  :hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
    text-decoration: none;
  }
  > svg {
    margin-right: 8px;
  }
`

export default function Menu() {
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.MENU)
  const toggle = useToggleModal(ApplicationModal.MENU)
  useOnClickOutside(node, open ? toggle : undefined)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>
      <StyledMenuButton onClick={toggle}>
        <StyledMenuIcon />
      </StyledMenuButton>

      {open && (
        <MenuFlyout>
          <MenuItem id="link" href="https://duneanalytics.com/alchemistcoin/MistX-Dashboard">
            <Info size={14} />
            Statistics
          </MenuItem>
          <MenuItem id="link" href="https://github.com/alchemistcoin/">
            <Info size={14} />
            Github
          </MenuItem>
          <MenuItem id="link" href="https://etherscan.io/address/0xA58f22e0766B3764376c92915BA545d583c19DBc#code">
            <Info size={14} />
            Contract 1
          </MenuItem>
          <MenuItem id="link" href="https://etherscan.io/address/0xfcadf926669e7cad0e50287ea7d563020289ed2c#code">
            <Info size={14} />
            Contract 2
          </MenuItem>
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
