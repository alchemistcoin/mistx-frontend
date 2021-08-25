import styled from 'styled-components'

export const Wrapper = styled.div<{ type: 'LEFT' | 'RIGHT' }>`
  width: 100%;
  padding: ${({ type }) => (type === 'RIGHT' ? '0 0 0 40px' : '0 40px 0 0')};
  display: flex;
  flex-direction: column;
  position: relative;
  top: ${({ type }) => type === 'RIGHT' && '-50px'};
`

export const TopWrapper = styled.div<{ type: 'LEFT' | 'RIGHT' }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: ${({ type }) => type === 'RIGHT' && 'flex-end'};
`

export const InnerWrapper = styled.div<{ type: 'LEFT' | 'RIGHT' }>`
  background: ${({ type, theme }) => (type === 'RIGHT' ? theme.blue1 : theme.blue1)};
  width: 100%;
  height: 200px;
  border-radius: ${({ type }) => (type === 'RIGHT' ? '30px 0 0 30px' : '0 30px 30px 0')};
`
