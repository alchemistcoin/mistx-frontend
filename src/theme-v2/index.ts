import { css } from 'styled-components'

const MEDIA_WIDTHS = {
  upToExtraSmall: 500,
  upToSmall: 720,
  upToMedium: 960,
  upToLarge: 1280
}

const mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(MEDIA_WIDTHS).reduce(
  (accumulator, size) => {
    ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
      @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
        ${css(a, b, c)}
      }
    `
    return accumulator
  },
  {}
) as any

export function theme(): any {
  return {
    // base
    white: '#FFFFFF',
    black: '#00000',

    // palette
    primary: '#59E4F5',
    blue1: '#3A5882',
    blue2: '#2C4361',
    blue3: '#2C466B',

    // text
    text1: '#FFFFFF',
    //shadows

    // media queries
    mediaWidth: mediaWidthTemplates
  }
}
