import { CurrencyAmount, Trade, TradeType } from '@alchemistcoin/sdk'
import React, { useContext, useMemo } from 'react'
import { AlertTriangle, ArrowDownCircle } from 'react-feather'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
// import { Field } from '../../state/swap/actions'
import { TYPE } from '../../theme'
import { ButtonYellow } from '../Button'
import { isAddress, shortenAddress } from '../../utils'
import { /* computeSlippageAdjustedAmounts, */ computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import { TruncatedText, SwapShowAcceptChanges } from './styleds'

const ArrowDivider = styled(AutoRow)`
  position: relative;
  z-index: 1;

  &:before {
    background-color: ${({ theme }) => theme.secondary1}
    content: '';
    left: 0;
    height: 1px;
    position: absolute;
    top: 50%;
    width: 100%;
    z-index: -1;
  }
`

const CurrencyDisplay = ({
  amount,
}: {
  amount: CurrencyAmount
}) => (
  <>
    <CurrencyLogo currency={amount.currency} size={'24px'} />
    <Text fontSize={14} fontWeight={400} style={{ marginLeft: '1rem' }}>
      {amount.currency.symbol}
    </Text>
  </>
)

export default function SwapModalHeader({
  trade,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges
}: {
  trade: Trade
  allowedSlippage: number
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  // const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
  //   trade,
  //   allowedSlippage
  // ])
  const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  const theme = useContext(ThemeContext)

  return (
    <AutoColumn gap={'md'}>
      <RowBetween align="center">
        <RowFixed gap={'0px'}>
          <CurrencyDisplay amount={trade.inputAmount} />
        </RowFixed>
        <RowFixed gap={'0px'}>
          <TruncatedText
            color={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? theme.text1 : ''}
            fontSize={32}
            fontWeight={700}
            textAlign="right"
          >
            {trade.inputAmount.toSignificant(6)}
          </TruncatedText>
        </RowFixed>
      </RowBetween>
      <ArrowDivider justify='center'>
        <ArrowDownCircle size="24px" color={theme.text3} />
      </ArrowDivider>
      <RowBetween align="center">
        <RowFixed gap={'0px'}>
          <CurrencyDisplay amount={trade.outputAmount} />
        </RowFixed>
        <RowFixed gap={'0px'}>
          <TruncatedText
            color={
              priceImpactSeverity > 2
                ? theme.red3
                : showAcceptChanges && trade.tradeType === TradeType.EXACT_INPUT
                ? theme.text1
                : ''
            }
            fontSize={32}
            fontWeight={700}
            textAlign="right"
          >
            {trade.outputAmount.toSignificant(6)}
          </TruncatedText>
        </RowFixed>
      </RowBetween>
      {showAcceptChanges ? (
        <SwapShowAcceptChanges justify="flex-start" gap={'0px'}>
          <RowBetween>
            <RowFixed>
              <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24, color: theme.primary2 }} />
              <TYPE.main color={theme.primary2}> Price Updated</TYPE.main>
            </RowFixed>
            <ButtonYellow
              style={{ padding: '.5rem', width: 'fit-content', fontSize: '0.825rem', borderRadius: '12px' }}
              onClick={onAcceptChanges}
            >
              Accept
            </ButtonYellow>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null}
      {/* <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <TYPE.italic textAlign="left" style={{ width: '100%' }}>
            {`Output is estimated. You will receive at least `}
            <b>
              {slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(6)} {trade.outputAmount.currency.symbol}
            </b>
            {' or the transaction will revert.'}
          </TYPE.italic>
        ) : (
          <TYPE.italic textAlign="left" style={{ width: '100%' }}>
            {`Input is estimated. You will sell at most `}
            <b>
              {slippageAdjustedAmounts[Field.INPUT]?.toSignificant(6)} {trade.inputAmount.currency.symbol}
            </b>
            {' or the transaction will revert.'}
          </TYPE.italic>
        )}
      </AutoColumn> */}
      {recipient !== null ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
          <TYPE.main>
            Output will be sent to{' '}
            <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
          </TYPE.main>
        </AutoColumn>
      ) : null}
    </AutoColumn>
  )
}
