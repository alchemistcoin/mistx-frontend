import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { darken, rem } from 'polished'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { ReactComponent as Logo } from '../../assets/svg/logo.svg'
import { ExternalLink } from '../../theme'
import Row, { RowFixed } from '../Row'
import { GithubIcon, DiscordIcon, UniswapIcon, EtherscanIcon, CoingeckoIcon } from '../Icons'

const HeaderFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem 1rem;
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 0.5rem 1rem;
  `}
  background: linear-gradient(180deg,rgba(0,0,0,0) 0%,rgb(0 0 0 / 45%) 100%);
`

const HeaderRow = styled(RowFixed)`
  flex-grow: 1;
  flex-basis: 0;
  flex: ${({ theme }) => theme.mediaWidth.upToMedium`
   width: 100%;
  `};
`

const HeaderLinks = styled(Row)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem 0 1rem 1rem;
`};
`

const LogoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin: 1rem 0;
  height: ${rem(80)};

  > svg {
    height: 100%;
    width: auto;
  }
`

const LogoLink = styled(Link)`
  display: flex;
  flex-direction: column;
`

const HideSmall = styled.div`
  display: flex;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  width: fit-content;
  margin: 0 0.75rem;
  font-weight: 500;
  position: relative;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 700;
    color: ${({ theme }) => theme.text1};

    &:after {
      content: '';
      width: ${rem(35)};
      height: ${rem(4)};
      bottom: -${rem(15)};
      left: 0;
      position: absolute;
      background: ${({ theme }) => theme.yellow1};
      border-radius: 1rem;
    }
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

const StyledExternalLink = styled(ExternalLink).attrs({
  activeClassName
})<{ isActive?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  width: fit-content;
  margin: 0 0.75rem;
  font-weight: 500;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      display: none;
`}
`

export const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: ${rem(35)};
  background-color: ${({ theme }) => theme.bg3};
  margin-left: 0.5rem;
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

export const SocialLinkWrapper = styled.div`
  display: flex;
  position: relative;
  margin: 0 0 0 1rem;
  width: ${rem(36)};
  height: ${rem(36)};
`

export const SocialLink = styled(ExternalLink)`
  display: flex;
  position: absolute;
  top: 0;
  border-radius: 100%;
  border: 2px solid transparent;
  transition: border 0.5s ease;

  &:hover {
    border-color: ${({ theme }) => theme.yellow1};
  }

  > svg {
    height: ${rem(36)};
    width: auto;
  }
`

export default function Header() {
  const { t } = useTranslation()

  return (
    <HeaderFrame>
      <HeaderRow align="start">
        <HeaderLinks>
          <StyledNavLink id={`swap-nav-link`} to={'/Swap'}>
            {t('exchange')}
          </StyledNavLink>
          <StyledExternalLink id={`stake-nav-link`} href={'https://alchemist.farm'}>
            {t('crucible')} <span style={{ fontSize: '11px' }}>↗</span>
          </StyledExternalLink>
        </HeaderLinks>
      </HeaderRow>
      <LogoWrapper>
        <LogoLink to="/" title={t('mistx')}>
          <Logo />
        </LogoLink>
      </LogoWrapper>
      <HeaderRow align="end" justify="flex-end">
        <HideSmall>
          <SocialLinkWrapper>
            <SocialLink href="http://discord.alchemist.wtf" title={t('discord')}>
              <DiscordIcon />
            </SocialLink>
          </SocialLinkWrapper>
          <SocialLinkWrapper>
            <SocialLink href="https://github.com/alchemistcoin" title={t('github')}>
              <GithubIcon />
            </SocialLink>
          </SocialLinkWrapper>
          <SocialLinkWrapper>
            <SocialLink href="https://etherscan.io/" title={t('etherscan')}>
              <EtherscanIcon />
            </SocialLink>
          </SocialLinkWrapper>
          <SocialLinkWrapper>
            <SocialLink
              href="https://info.uniswap.org/token/0x88acdd2a6425c3faae4bc9650fd7e27e0bebb7ab"
              title={t('uniswap')}
            >
              <UniswapIcon />
            </SocialLink>
          </SocialLinkWrapper>
          <SocialLinkWrapper>
            <SocialLink href="https://www.coingecko.com/en/coins/alchemist" title={t('coingecko')}>
              <CoingeckoIcon />
            </SocialLink>
          </SocialLinkWrapper>
        </HideSmall>
      </HeaderRow>
    </HeaderFrame>
  )
}
