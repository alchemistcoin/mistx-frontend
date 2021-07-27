import React from 'react'
import { useContext } from 'react'
import { Text } from 'rebass'
import { Trade, Currency, TradeType } from '@alchemistcoin/sdk'
import { ThemeContext } from 'styled-components'
import MinerTipPrice from './MinerTipPrice'

interface SwapFooterProps {
  trade: Trade<Currency, Currency, TradeType>
}

export default function SwapPrice({ trade }: SwapFooterProps) {
  const theme = useContext(ThemeContext)

  return (
    <Text
      style={{
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        display: 'flex',
        paddingRight: 10
      }}
    >
      Miner Tip:&nbsp;
      <Text fontWeight={500} fontSize={14} color={theme.text2}>
        <MinerTipPrice trade={trade} />
      </Text>
    </Text>
  )
}
