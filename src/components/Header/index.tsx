import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { darken, rem } from 'polished'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { ReactComponent as Logo } from '../../assets/svg/logo.svg'
import { ExternalLink } from '../../theme'
import Row, { RowFixed } from '../Row'
import { GithubIcon, DiscordIcon, UniswapIcon, EtherscanIcon, CoingeckoIcon, EllipseIcon } from '../Icons'

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
  font-weight: 400;
  color: ${({ theme }) => theme.yellow1};

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 700;
    color: ${({ theme }) => theme.text1};

    :hover,
    :focus {
      color: ${({ theme }) => theme.text1};
    }
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.2, theme.yellow1)};
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

  return (
    <HeaderFrame>
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
      <LogoWrapper>
        <LogoLink to="/" title={t('mistx')}>
          <Logo />
        </LogoLink>
      </LogoWrapper>
      <HeaderRow align="end" justify="flex-end">
        <HideSmall>
          <SocialLinkWrapper>
            <SocialLink href="http://discord.alchemist.wtf" title={t('discord')}>
              <StyledEllipseWapper>
                <EllipseIcon />
              </StyledEllipseWapper>
              <DiscordIcon />
            </SocialLink>
          </SocialLinkWrapper>
          <SocialLinkWrapper>
            <SocialLink href="https://github.com/alchemistcoin" title={t('github')}>
              <StyledEllipseWapper>
                <EllipseIcon />
              </StyledEllipseWapper>
              <GithubIcon />
            </SocialLink>
          </SocialLinkWrapper>
          <SocialLinkWrapper>
            <SocialLink
              href="https://etherscan.io/token/0x88acdd2a6425c3faae4bc9650fd7e27e0bebb7ab"
              title={t('etherscan')}
            >
              <StyledEllipseWapper>
                <EllipseIcon />
              </StyledEllipseWapper>
              <EtherscanIcon />
            </SocialLink>
          </SocialLinkWrapper>
          <SocialLinkWrapper>
            <SocialLink
              href="https://info.uniswap.org/token/0x88acdd2a6425c3faae4bc9650fd7e27e0bebb7ab"
              title={t('uniswap')}
            >
              <StyledEllipseWapper>
                <EllipseIcon />
              </StyledEllipseWapper>
              <UniswapIcon />
            </SocialLink>
          </SocialLinkWrapper>
          <SocialLinkWrapper>
            <SocialLink href="https://www.coingecko.com/en/coins/alchemist" title={t('coingecko')}>
              <StyledEllipseWapper>
                <EllipseIcon />
              </StyledEllipseWapper>
              <CoingeckoIcon />
            </SocialLink>
          </SocialLinkWrapper>
        </HideSmall>
      </HeaderRow>
    </HeaderFrame>
  )
}
