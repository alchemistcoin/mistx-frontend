import React from 'react'
import { Price } from '@alchemistcoin/sdk'
import { useContext } from 'react'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'

interface SwapPriceProps {
  price?: Price
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
}

export default function SwapPrice({ price, showInverted, setShowInverted }: SwapPriceProps) {
  const theme = useContext(ThemeContext)

  const displayPrice = showInverted ? price?.toSignificant(6) : price?.invert()?.toSignificant(6)
  const show = Boolean(price?.baseCurrency && price?.quoteCurrency)
  const label = showInverted
    ? `${price?.quoteCurrency?.symbol} = 1 ${price?.baseCurrency?.symbol}`
    : `${price?.baseCurrency?.symbol} = 1 ${price?.quoteCurrency?.symbol}`

  return (
    <Text
      fontWeight={500}
      fontSize={14}
      color={theme.text2}
      style={{
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        display: 'flex',
        paddingRight: 10
      }}
    >
      {show ? (
        <>
          <div
            onClick={() => setShowInverted(!showInverted)}
            style={{
              cursor: 'pointer'
            }}
          >
            {displayPrice ?? '-'} {label}
          </div>
        </>
      ) : (
        '-'
      )}
    </Text>
  )
}
