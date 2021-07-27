import React from 'react'
import { Trade, Currency, TradeType } from '@alchemistcoin/sdk'
interface SwapPriceProps {
  trade: Trade<Currency, Currency, TradeType>
}

export default function SwapPrice({ trade }: SwapPriceProps) {
  const price = trade.executionPrice
  const displayPrice = price?.toSignificant(6)
  const show = Boolean(price?.baseCurrency && price?.quoteCurrency)
  const label = `${price?.quoteCurrency?.symbol} = 1 ${price?.baseCurrency?.symbol}`

  return (
    <>
      {show ? (
        <>
          {displayPrice ?? '-'} {label}
        </>
      ) : (
        '-'
      )}
    </>
  )
}
