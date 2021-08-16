import { transparentize } from 'polished'
import React from 'react'
import { AlertTriangle } from 'react-feather'
import styled, { css } from 'styled-components'
import { Text } from 'rebass'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'

export const Wrapper = styled.div`
  padding: 1rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 1rem 0;
  `};
`

export const RelativeWrapper = styled.div`
  position: relative;
`

export const ArrowWrapper = styled.div<{
  color?: string
  clickable: boolean
}>`
  border-radius: 50%;
  background: #2a3645;
  height: 2.5rem;
  display: flex;
  justify-content: center;
  width: 2.5rem;

  ${({ clickable }) =>
    clickable
      ? css`
          :hover {
            cursor: pointer;
            color: ${({ theme }) => theme.text2};
          }
        `
      : null}
`

export const PendingHeader = styled.header`
  color: ${({ theme }) => theme.text1};
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 2.25
  margin-bottom: 2rem;
  text-align: center;
`

export const PendingWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg2};
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(0.95, theme.shadow1)};
  overflow: hidden;
`

export const SectionBreak = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.bg3};
`

export const BottomGrouping = styled.div`
  margin: 1rem 0 0 0;
  padding: 0;
`

export const ErrorText = styled(Text)<{ severity?: 0 | 1 | 2 | 3 | 4 }>`
  color: ${({ theme, severity }) =>
    severity === 3 || severity === 4
      ? theme.red1
      : severity === 2
      ? theme.yellow2
      : severity === 1
      ? theme.text1
      : theme.green2};
`

export const StyledBalanceMaxMini = styled.button`
  height: 22px;
  width: 22px;
  background-color: ${({ theme }) => theme.bg2};
  border: none;
  border-radius: 50%;
  padding: 0.2rem;
  font-size: 0.875rem;
  font-weight: 400;
  margin-left: 0.4rem;
  cursor: pointer;
  color: ${({ theme }) => theme.text2};
  display: flex;
  justify-content: center;
  align-items: center;
  float: right;

  :hover {
    background-color: ${({ theme }) => theme.bg3};
  }
  :focus {
    background-color: ${({ theme }) => theme.bg3};
    outline: none;
  }
`

export const TruncatedText = styled(Text)`
  text-overflow: ellipsis;
  width: 220px;
  overflow: hidden;
`

// styles
export const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: '.';
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`

const SwapCallbackErrorInner = styled.div`
  background-color: ${({ theme }) => transparentize(0.9, theme.red1)};
  border-radius: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.825rem;
  width: 100%;
  padding: 3rem 1.25rem 1rem 1rem;
  margin-top: -2rem;
  color: ${({ theme }) => theme.red1};
  z-index: -1;
  p {
    padding: 0;
    margin: 0;
    font-weight: 500;
  }
`

const SwapCallbackErrorInnerAlertTriangle = styled.div`
  background-color: ${({ theme }) => transparentize(0.9, theme.red1)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 12px;
  min-width: 48px;
  height: 48px;
`

export function SwapCallbackError({ error }: { error: string }) {
  return (
    <SwapCallbackErrorInner>
      <SwapCallbackErrorInnerAlertTriangle>
        <AlertTriangle size={24} />
      </SwapCallbackErrorInnerAlertTriangle>
      <p>{error}</p>
    </SwapCallbackErrorInner>
  )
}

export const SwapShowAcceptChanges = styled(AutoColumn)`
  background-color: ${({ theme }) => transparentize(0.9, theme.primary1)};
  color: ${({ theme }) => theme.primary1};
  padding: 0.5rem;
  border-radius: 12px;
  margin-top: 8px;
`
export const Separator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg2};
`

export const TokenSelectButton = styled.button`
  align-items: center;
  background-color: ${({ theme }) => theme.yellow1};
  border: 1px solid ${({ theme }) => theme.bg2};
  border-radius: 0;
  cursor: pointer;
  display: flex;
  font-weight: 700;
  font-size: 1.25rem;
  height: 110px;
  justify-content: center;
  width: 100%;
`

export const TokenHandImage = styled.img`
  height: 1.875rem;
  margin-right: 1rem;
`

export const FeeWrapper = styled.div`
  color: ${({ theme }) => theme.text3};
  display: flex;
  font-size: 0.875rem;
  height: 2.5rem;
  line-height: 2.5rem;
  padding: 0 0.25rem;
  width: 100%;
`

export const FeeInnerLeft = styled.div`
  width: 100%;
  text-align: left;
  color: ${({ theme }) => theme.text3};
`

export const FeeInnerRight = styled.div`
  width: 1.25rem;
  text-align: right;
  color: ${({ theme }) => theme.white};
  display: flex;
  justify-content: space-around;
  position: relative;
  margin-top: -2px;

  > div {
    display: flex;
  }
`

export const FeeRowBetween = styled(RowBetween)`
  position: relative;
  align-items: flex-start;

  &:after {
    content: '';
    height: 13px;
    width: 1px;
    position: absolute;
    left: 8px;
    top: 0px;
    background-color: ${({ theme }) => theme.text2};
  }
  &:before {
    content: '';
    height: 1px;
    width: 8px;
    position: absolute;
    left: 8px;
    top: 12px;
    background-color: ${({ theme }) => theme.text2};
  }
`

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.text3};
  margin: 10px 0;
`
