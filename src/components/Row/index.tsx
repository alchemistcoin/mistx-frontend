import styled from 'styled-components'
import { Box } from 'rebass/styled-components'

export const Row = styled(Box)<{
  width?: string
  align?: string
  justify?: string
  padding?: string
  border?: string
  borderRadius?: string
  margin?: string
  flexDirection?: string
}>`
  width: ${({ width }) => width ?? '100%'};
  display: flex;
  align-items: ${({ align }) => align ?? 'center'};
  ${({ justify }) => (justify ? `justify-content: ${justify}` : '')};
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
  margin: ${({ margin }) => margin};
  flex-direction: ${({ flexDirection }) => flexDirection};
`

export const RowBetween = styled(Row)`
  justify-content: space-between;
`

export const RowFlat = styled.div`
  display: flex;
  align-items: flex-end;
`

export const AutoRow = styled(Row)<{ gap?: string; justify?: string }>`
  flex-wrap: wrap;
  ${({ gap }) => (gap ? `margin: -${gap};` : '')}
  ${({ justify }) => (justify ? `justify-content: ${justify};` : '')}
  ${({ gap }) =>
    gap &&
    `& > * {
      margin: ${gap} !important;
    }`}
`

export const RowFixed = styled(Row)<{ gap?: string; justify?: string }>`
  width: fit-content;
  margin: ${({ gap }) => gap && `-${gap}`};
`

export default Row
