import React, { useCallback, useState, ReactNode } from 'react'
import styled from 'styled-components'
import Popover, { PopoverProps } from '../Popover'

const TooltipContainer = styled.div`
  width: auto;
  max-width: 22rem;
  padding: 0.6rem 1rem;
  line-height: 150%;
  font-weight: 400;
`

interface TooltipProps extends Omit<PopoverProps, 'content'> {
  text: string
  placement?: PopoverProps['placement']
}

export default function Tooltip({ text, ...rest }: TooltipProps) {
  return <Popover content={<TooltipContainer>{text}</TooltipContainer>} {...rest} />
}

export function MouseoverTooltip({ children, ...rest }: Omit<TooltipProps, 'show'>) {
  const [show, setShow] = useState(false)
  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])
  return (
    <Tooltip {...rest} show={show}>
      <div onMouseEnter={open} onMouseLeave={close} onClick={open}>
        {children}
      </div>
    </Tooltip>
  )
}

interface TooltipContentProps extends Omit<PopoverProps, 'content'> {
  content: ReactNode
  show: boolean
}

function TooltipContent({ content, show, ...rest }: TooltipContentProps) {
  return <Popover show={show} content={<TooltipContainer>{show ? content : null}</TooltipContainer>} {...rest} />
}

export function MouseoverTooltipContent({ content, children, ...rest }: Omit<TooltipContentProps, 'show'>) {
  const [show, setShow] = useState(false)
  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])
  return (
    <TooltipContent {...rest} show={show} content={content}>
      <div
        style={{ display: 'flex', lineHeight: 0, padding: '0.25rem', alignItems: 'center' }}
        onMouseEnter={open}
        onMouseLeave={close}
      >
        {children}
      </div>
    </TooltipContent>
  )
}
