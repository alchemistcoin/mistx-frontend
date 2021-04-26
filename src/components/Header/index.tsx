import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { darken, rem } from 'polished'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { ReactComponent as Logo } from '../../assets/svg/logo.svg'
import { ReactComponent as LogoLight } from '../../assets/svg/logo_light.svg'
import { ExternalLink } from '../../theme'
import Row, { RowFixed } from '../Row'
import {
  GithubIcon,
  DiscordIcon,
  UniswapIcon,
  EtherscanIcon,
  CoingeckoIcon,
  EllipseIcon,
  CoingeckoLightIcon
} from '../Icons'
import { useDarkModeManager } from '../../state/user/hooks'

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
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.5rem 1rem;
  `}
  background: ${({ theme }) => theme.headerBg};
`

const HeaderRow = styled(RowFixed)`
  flex-grow: 1;
  flex-basis: 0;
  flex: ${({ theme }) => theme.mediaWidth.upToMedium`
   width: 100%;
  `};
`

const HeaderLinks = styled(Row)`
  padding: 1rem 0 1rem 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.5rem 0 0.5rem 0;
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

const LogoWrapperMobile = styled.div`
  display: flex;
  flex-direction: row;
  height: ${rem(60)};
  margin: 0.5rem 0;

  > a {
    position: relative;
    right: 1.5rem;
  }

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

const HideLarge = styled.div`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
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
  color: ${({ theme }) => theme.secondaryText1};
  font-size: 1rem;
  width: fit-content;
  margin: 0 2.5rem 0 0;
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
      background: ${({ theme }) => theme.secondaryText1};
      border-radius: 1rem;

      :hover,
      :focus {
        color: ${({ theme }) => darken(0.1, theme.secondaryText1)};
      }
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
  color: ${({ theme }) => theme.secondaryText1};
  font-size: 1rem;
  width: fit-content;
  margin: 0 2.5rem 0 0;
  font-weight: 400;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 700;
    color: ${({ theme }) => theme.secondaryText1};

    :hover,
    :focus {
      color: ${({ theme }) => theme.secondaryText1};
    }
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.2, theme.secondaryText1)};
    text-decoration: none;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `}
`

export const StyledExternalLinkEl = styled.span`
  margin: 0 0 0 0.5rem;
`

export const SocialLinkWrapper = styled.div`
  display: flex;
  position: relative;
  margin: 0 0 0 1rem;
  width: ${rem(36)};
  height: ${rem(36)};
`

const StyledEllipseWapper = styled.div`
  display: flex;
  position: absolute;
  top: -3px;
  left: -3px;
  opacity: 0;
  transition: opacity 0.2s ease-in;

  > svg {
    height: ${rem(42)};
    width: auto;
  }
`

export const SocialLink = styled(ExternalLink)`
  display: flex;
  position: absolute;
  top: 0;

  &:hover {
    ${StyledEllipseWapper} {
      opacity: 1;
    }
  }

  > svg {
    height: ${rem(36)};
    width: auto;
  }
`

export default function Header() {
  const { t } = useTranslation()
  const [darkMode] = useDarkModeManager()

  return (
    <HeaderFrame>
      <HideLarge>
        <LogoWrapperMobile>
          <LogoLink to="/" title={t('mistx')}>
            {darkMode ? <Logo /> : <LogoLight />}
          </LogoLink>
        </LogoWrapperMobile>
      </HideLarge>
      <HeaderRow align="start">
        <HeaderLinks>
          <StyledNavLink id={`swap-nav-link`} to={'/Swap'}>
            {t('exchange')}
          </StyledNavLink>
          <StyledExternalLink id={`stake-nav-link`} href={'https://alchemist.farm'}>
            {t('crucible')} <StyledExternalLinkEl style={{ fontSize: '11px' }}>↗</StyledExternalLinkEl>
          </StyledExternalLink>
        </HeaderLinks>
      </HeaderRow>
      <HideSmall>
        <LogoWrapper>
          <LogoLink to="/" title={t('mistx')}>
            {darkMode ? <Logo /> : <LogoLight />}
          </LogoLink>
        </LogoWrapper>
      </HideSmall>
      <HeaderRow align="end" justify="flex-end">
        <HideSmall>
          <SocialLinkWrapper>
            <SocialLink href="http://discord.alchemist.wtf" title={t('discord')}>
              <StyledEllipseWapper>
                <EllipseIcon fill={darkMode ? '#F6B713' : '#1a0434'} />
              </StyledEllipseWapper>
              <DiscordIcon fill={darkMode ? '#FFF' : '#1a0434'} />
            </SocialLink>
          </SocialLinkWrapper>
          <SocialLinkWrapper>
            <SocialLink href="https://github.com/alchemistcoin" title={t('github')}>
              <StyledEllipseWapper>
                <EllipseIcon fill={darkMode ? '#F6B713' : '#1a0434'} />
              </StyledEllipseWapper>
              <GithubIcon fill={darkMode ? '#FFF' : '#1a0434'} />
            </SocialLink>
          </SocialLinkWrapper>
          <SocialLinkWrapper>
            <SocialLink
              href="https://etherscan.io/token/0x88acdd2a6425c3faae4bc9650fd7e27e0bebb7ab"
              title={t('etherscan')}
            >
              <StyledEllipseWapper>
                <EllipseIcon fill={darkMode ? '#F6B713' : '#1a0434'} />
              </StyledEllipseWapper>
              <EtherscanIcon fill={darkMode ? '#FFF' : '#1a0434'} />
            </SocialLink>
          </SocialLinkWrapper>
          <SocialLinkWrapper>
            <SocialLink
              href="https://info.uniswap.org/token/0x88acdd2a6425c3faae4bc9650fd7e27e0bebb7ab"
              title={t('uniswap')}
            >
              <StyledEllipseWapper>
                <EllipseIcon fill={darkMode ? '#F6B713' : '#1a0434'} />
              </StyledEllipseWapper>
              <UniswapIcon fill={darkMode ? '#FFF' : '#1a0434'} />
            </SocialLink>
          </SocialLinkWrapper>
          <SocialLinkWrapper>
            <SocialLink href="https://www.coingecko.com/en/coins/alchemist" title={t('coingecko')}>
              <StyledEllipseWapper>
                <EllipseIcon fill={darkMode ? '#F6B713' : '#1a0434'} />
              </StyledEllipseWapper>
              {darkMode ? <CoingeckoIcon /> : <CoingeckoLightIcon />}
            </SocialLink>
          </SocialLinkWrapper>
        </HideSmall>
      </HeaderRow>
    </HeaderFrame>
  )
}
