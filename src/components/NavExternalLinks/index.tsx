import React from 'react'
import { rem } from 'polished'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { ExternalLink } from '../../theme'
import { RowFixed } from '../Row'
import { GithubIcon, DiscordIcon, EtherscanIcon, CoingeckoIcon, CoingeckoLightIcon } from '../Icons'
import { useDarkModeManager } from '../../state/user/hooks'

const Wrapper = styled.div`
  grid-column: span 2 / span 2;
  top: 0;
  position: relative;
  display: flex;
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding-left: 0;
    grid-column: none;
    align-items: flex-end;
    margin: 8px 0;
  `}
`

const Row = styled(RowFixed)`
  flex-grow: 1;
  flex-basis: 0;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    align-items: flex-end;
    justify-content: flex-end;
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

  ${({ theme }) => theme.mediaWidth.upToMedium`
    &:last-child {
      margin-right: 0;
    }
    width: ${rem(28)};
    height: ${rem(28)};
  `}
`

export const SocialLink = styled(ExternalLink)`
  display: flex;
  position: relative;

  > svg {
    height: 100%;
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
      <Row align="center" justify="center">
        <SocialLinkWrapper header={header}>
          <SocialLink href="http://discord.alchemist.wtf" title={t('discord')}>
            <DiscordIcon fill={darkMode ? '#FFF' : '#1a0434'} />
          </SocialLink>
        </SocialLinkWrapper>
        <SocialLinkWrapper header={header}>
          <SocialLink href="https://github.com/alchemistcoin" title={t('github')}>
            <GithubIcon fill={darkMode ? '#FFF' : '#1a0434'} />
          </SocialLink>
        </SocialLinkWrapper>
        <SocialLinkWrapper header={header}>
          <SocialLink
            href="https://etherscan.io/token/0x88acdd2a6425c3faae4bc9650fd7e27e0bebb7ab"
            title={t('etherscan')}
          >
            <EtherscanIcon fill={darkMode ? '#FFF' : '#1a0434'} />
          </SocialLink>
        </SocialLinkWrapper>
        <SocialLinkWrapper header={header}>
          <SocialLink href="https://www.coingecko.com/en/coins/alchemist" title={t('coingecko')}>
            {darkMode ? <CoingeckoIcon /> : <CoingeckoLightIcon />}
          </SocialLink>
        </SocialLinkWrapper>
      </Row>
    </Wrapper>
  )
}
