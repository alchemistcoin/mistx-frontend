import styled from 'styled-components'

export const SettingsHeader = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  margin: 0 0 1.5rem;
  color: ${({ theme }) => theme.text1};
  align-items: center;
  justify-content: space-between;

  > div {
    display: flex;
    flex-direction: row;
  }

  &:before {
    position: absolute;
    left: -1.5rem;
    top: 3px;
    height: 24px;
    width: 2px;
    content: '';
    background-color: ${({ theme }) => theme.primary2};

    ${({ theme }) => theme.mediaWidth.upToSmall`
      left: -1rem
   `}
  }
`

export const SettingsHeaderEnd = styled.div`
  position: relative;
  display: flex;
  align-self: flex-end;
`
