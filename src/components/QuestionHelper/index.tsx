import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import Tooltip from '../Tooltip'
import { Info } from '../Icons'
import { PopoverProps } from '../Popover'

const QuestionWrapper = styled.div<{ small?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  outline: none;
  cursor: default;
  color: ${({ theme }) => theme.text2};

  width: ${({ small }) => (small ? '16px' : '24px')};
  height: auto;
  opacity: 0.8;

  :hover,
  :focus {
    opacity: 1;
  }

  svg {
    width: 100%;
    height: auto;
  }
`

const LightQuestionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  outline: none;
  cursor: default;
  width: 24px;
  height: 24px;
  color: ${({ theme }) => theme.white};

  :hover,
  :focus {
    opacity: 0.7;
  }

  svg {
    path {
      stroke: ${({ theme }) => theme.primary2};
    }
  }
`

const QuestionMark = styled.span`
  font-size: 1rem;
`

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  margin-left: 4px;
`

const defaultWrapperStyle = {}

export default function QuestionHelper({
  className,
  text,
  placement,
  small,
  style
}: {
  className?: string
  text: string
  placement?: PopoverProps['placement']
  small?: boolean
  style?: any
}) {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <Wrapper className={className} style={style || defaultWrapperStyle}>
      <Tooltip text={text} show={show} placement={placement}>
        <QuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close} small={small}>
          <Info />
        </QuestionWrapper>
      </Tooltip>
    </Wrapper>
  )
}

export function LightQuestionHelper({ text }: { text: string }) {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <span style={{ marginLeft: 4 }}>
      <Tooltip text={text} show={show}>
        <LightQuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close}>
          <QuestionMark>?</QuestionMark>
        </LightQuestionWrapper>
      </Tooltip>
    </span>
  )
}
