import { ThemedCssFunction } from 'styled-components'

export type Color = string
export interface Colors {
  // base
  white: Color
  black: Color

  primary: Color
  blue1: Color
  blue2: Color
  // text
  text1: Color

  //   // backgrounds
  //   bg1: Color
  //   bg2: Color

  //   // borders
  //   border1: Color

  //   // primary
  //   primary1: Color

  //   primaryText1: Color
  //   secondaryText1: Color

  //   // secondary
  //   secondary1: Color
}

export interface ThemeV2 extends Colors {
  // media queries
  mediaWidth: {
    upToExtraSmall: ThemedCssFunction<DefaultTheme>
    upToSmall: ThemedCssFunction<DefaultTheme>
    upToMedium: ThemedCssFunction<DefaultTheme>
    upToLarge: ThemedCssFunction<DefaultTheme>
  }
}

// declare module 'styled-components' {
//   export interface ThemeV2 extends Colors {
//     // media queries
//     mediaWidth: {
//       upToExtraSmall: ThemedCssFunction<DefaultTheme>
//       upToSmall: ThemedCssFunction<DefaultTheme>
//       upToMedium: ThemedCssFunction<DefaultTheme>
//       upToLarge: ThemedCssFunction<DefaultTheme>
//     }
//   }
// }
