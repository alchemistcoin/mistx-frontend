import { ChainId } from '@alchemist-coin/mistx-core'
import React from 'react'
import styled from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
import { YellowCard } from '../Card'
import Web3Status from '../Web3Status'

const HeaderFrame = styled.div`
  display: flex;
  top: 0;
  position: relative;
  padding: 0;
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    padding: 0;
    width: 0;
    position: relative;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 0;
    width: 0;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  margin-left: auto;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    width: 100%;
    max-width: 960px;
    padding: 1rem;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 999;
    height: 72px;
    border-radius: 12px 12px 0 0;
    background-color: ${({ theme }) => theme.bg1};
  `};
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;

  /* addresses safari's lack of support for "gap" */
  & > *:not(:first-child) {
    margin-left: 8px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
   flex-direction: row-reverse;
    align-items: center;
  `};
`

const HideSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

const NetworkCard = styled(YellowCard)`
  border-radius: 12px;
  padding: 8px 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
    margin-right: 0.5rem;
    width: initial;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
  `};
`

export const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg3};
  margin-left: 8px;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }

  svg {
    margin-top: 2px;
  }
  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

export const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: 'Mainnet',
  [ChainId.RINKEBY]: 'Rinkeby',
  [ChainId.ROPSTEN]: 'Ropsten',
  [ChainId.GÖRLI]: 'Görli',
  [ChainId.KOVAN]: 'Kovan'
}

export default function Header() {
  const { chainId } = useActiveWeb3React()

  return (
    <HeaderFrame>
      <HeaderControls>
        <HeaderElement>
          <HideSmall>
            {chainId && chainId !== ChainId.MAINNET && NETWORK_LABELS[chainId] && (
              <NetworkCard title={NETWORK_LABELS[chainId]}>{NETWORK_LABELS[chainId]}</NetworkCard>
            )}
          </HideSmall>
          <Web3Status />
        </HeaderElement>
      </HeaderControls>
    </HeaderFrame>
  )
}
