import React from 'react'
import styled from 'styled-components'
import { darken, lighten } from 'polished'
import { ExternalLink } from '../../theme'

const InfoCard = styled.button<{ active?: boolean }>`
  background-color: ${({ active, theme }) => (active ? 'transparent' : theme.bg2)};
  padding: 1rem;
  outline: none;
  border: 1px solid;
  border-radius: 12px;
  width: 100% !important;

  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.primary1};
  }

  &:hover,
  &:active {
    background-color: ${({ active, theme }) => (active ? 'transparent' : lighten(0.1, theme.bg2))};
  }

  border-color: ${({ theme, active }) => (active ? theme.primary2 : '#190134')};
`

const OptionCard = styled(InfoCard as any)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
  padding: 1rem;
`

const OptionCardLeft = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  justify-content: center;
  height: 100%;
`

const OptionCardClickable = styled(OptionCard as any)<{ clickable?: boolean }>`
  margin-top: 0;
  cursor: pointer;

  &:hover {
    cursor: ${({ clickable }) => (clickable ? 'pointer' : '')};
    border: ${({ clickable }) => (clickable ? `1px solid ${darken(0.1, '#190134')}` : ``)};
  }
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
`

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;

  :hover {
    text-decoration: none;
  }

  :focus {
    outline: none;
    text-decoration: none;
  }

  :active {
    text-decoration: none;
  }

  * {
    :hover {
      text-decoration: none;
    }

    :focus {
      outline: none;
      text-decoration: none;
    }

    :active {
      text-decoration: none;
    }
  }
`

const GreenCircle = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  justify-content: center;
  align-items: center;

  &:first-child {
    height: 8px;
    width: 8px;
    margin-right: 8px;
    background-color: ${({ theme }) => theme.green1};
    border-radius: 50%;
  }
`

const CircleWrapper = styled.div`
  color: ${({ theme }) => theme.green1};
  display: flex;
  justify-content: center;
  align-items: center;
`

const HeaderText = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  color: ${props => (props.color === 'blue' ? ({ theme }) => theme.primary1 : ({ theme }) => theme.text1)};
  font-size: 1rem;
  font-weight: 500;
`

const SubHeader = styled.div`
  color: ${({ theme }) => theme.text1};
  margin-top: 10px;
  font-size: 12px;
`

const IconWrapper = styled.div<{ size?: number | null }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '24px')};
    width: ${({ size }) => (size ? size + 'px' : '24px')};
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
`

export default function Option({
  link = null,
  clickable = true,
  size,
  onClick = null,
  color,
  header,
  subheader = null,
  icon,
  active = false,
  id
}: {
  link?: string | null
  clickable?: boolean
  size?: number | null
  onClick?: null | (() => void)
  color: string
  header: React.ReactNode
  subheader: React.ReactNode | null
  icon: string
  active?: boolean
  id: string
}) {
  const content = (
    <OptionCardClickable id={id} onClick={onClick} clickable={clickable && !active} active={active}>
      <OptionCardLeft>
        <HeaderText color={color}>
          {active ? (
            <CircleWrapper>
              <GreenCircle>
                <div />
              </GreenCircle>
            </CircleWrapper>
          ) : (
            ''
          )}
          {header}
        </HeaderText>
        {subheader && <SubHeader>{subheader}</SubHeader>}
      </OptionCardLeft>
      <IconWrapper size={size}>
        <img src={icon} alt={'Icon'} />
      </IconWrapper>
    </OptionCardClickable>
  )
  if (link) {
    return <StyledExternalLink href={link}>{content}</StyledExternalLink>
  }

  return content
}
