import { css, createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  html {
    color: ${({ theme }) => theme.text1};
    background: radial-gradient(188.14% 100% at 49.87% 0%, #2C4361 0%, #1A2B3F 100%);
  } 
  
  body {
    min-height: 100vh;
  }
`
