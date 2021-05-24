import React from 'react'
import { rem } from 'polished'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { ExternalLink } from '../../theme'
import { RowFixed } from '../Row'
import {
  GithubIcon,
  DiscordIcon,
  EtherscanIcon,
  CoingeckoIcon,
  EllipseIcon,
  CoingeckoLightIcon
} from '../Icons'
import { useDarkModeManager } from '../../state/user/hooks'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.5rem 1rem;
  `}
`

const Row = styled(RowFixed)`
  flex-grow: 1;
  flex-basis: 0;
  flex: ${({ theme }) => theme.mediaWidth.upToMedium`
   width: 100%;
  `};
`

export const StyledExternalLinkEl = styled.span`
  margin: 0 0 0 0.5rem;
`

export const SocialLinkWrapper = styled.div<{ header?: boolean }>`
  display: flex;
  position: relative;
  margin: ${({ header }) => (header ? '0 0 0 1rem' : '0 0.5rem')};
  width: ${rem(36)};
  height: ${rem(36)};
`

const StyledEllipseWapper = styled.div`
  display: flex;
  position: absolute;
  top: -2px;
  left: -2px;
  opacity: 0;
  transition: opacity 0.2s ease-in;

  > svg {
    height: ${rem(40)};
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

type Props = {
  header: boolean
}

export default function NavExternalLinks({ header }: Props) {
  const { t } = useTranslation()
  const [darkMode] = useDarkModeManager()

  return (
    <Wrapper>
      <Row align="end" justify="flex-end">
        <SocialLinkWrapper header={header}>
          <SocialLink href="http://discord.alchemist.wtf" title={t('discord')}>
            <StyledEllipseWapper>
              <EllipseIcon fill={darkMode ? '#F6B713' : '#1a0434'} />
            </StyledEllipseWapper>
            <DiscordIcon fill={darkMode ? '#FFF' : '#1a0434'} />
          </SocialLink>
        </SocialLinkWrapper>
        <SocialLinkWrapper header={header}>
          <SocialLink href="https://github.com/alchemistcoin" title={t('github')}>
            <StyledEllipseWapper>
              <EllipseIcon fill={darkMode ? '#F6B713' : '#1a0434'} />
            </StyledEllipseWapper>
            <GithubIcon fill={darkMode ? '#FFF' : '#1a0434'} />
          </SocialLink>
        </SocialLinkWrapper>
        <SocialLinkWrapper header={header}>
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
        <SocialLinkWrapper header={header}>
          <SocialLink href="https://www.coingecko.com/en/coins/alchemist" title={t('coingecko')}>
            <StyledEllipseWapper>
              <EllipseIcon fill={darkMode ? '#F6B713' : '#1a0434'} />
            </StyledEllipseWapper>
            {darkMode ? <CoingeckoIcon /> : <CoingeckoLightIcon />}
          </SocialLink>
        </SocialLinkWrapper>
      </Row>
    </Wrapper>
  )
}
