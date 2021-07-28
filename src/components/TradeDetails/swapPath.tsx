import { Trade } from '@alchemist-coin/mistx-core'
import React, { Fragment, memo, useContext } from 'react'
import { Flex } from 'rebass'
import { ThemeContext } from 'styled-components/macro'
import { TYPE } from '../../theme'
import { unwrappedToken } from '../../utils/wrappedCurrency'

export default memo(function SwapPath({ trade }: { trade: any }) {
  const tokenPath: any = trade.route.path
  const theme = useContext(ThemeContext)
  return (
    <Flex flexWrap="wrap" width="100%" justifyContent="flex-start" alignItems="center">
      {tokenPath.map((token: any, i: any, path: any) => {
        const isLastItem: boolean = i === path.length - 1
        const currency = unwrappedToken(token)
        return (
          <Fragment key={i}>
            <Flex alignItems="end">
              <TYPE.black color={theme.text1} ml="0.145rem" mr="0.145rem">
                {currency.symbol}
              </TYPE.black>
            </Flex>
            {isLastItem ? null : trade instanceof Trade ? '>' : '<'}
          </Fragment>
        )
      })}
    </Flex>
  )
})
