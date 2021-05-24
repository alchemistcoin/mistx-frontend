import React from 'react'
import styled from 'styled-components'
import { usePendingTransactions, useTransactionCanceller } from 'state/transactions/hooks'
import { TransactionDetails } from 'state/transactions/reducer'
import { ButtonOutlined } from 'components/Button'
import { useActiveWeb3React } from 'hooks'
import CurrencyLogo from 'components/CurrencyLogo'
import { CurrencyAmount } from '@alchemistcoin/sdk'

const Wrapper = styled.div`
`

const StyledDiagnosticWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg1};
  border-radius: 1.5rem;
  padding: 2.25rem 2.5rem;
`

const StyledCancelButton = styled(ButtonOutlined)`
  margin-top: 1.75rem;
`

const TokenWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  height: 140px;
`

const TokenAmountWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const CurrencyLabelWrapper = styled.div`
  align-items: center;
  display: flex;
`

const CurrencyName = styled.div`
  font-size: .875rem;
  font-weight: 400;
  line-height: 44px;
  margin-left: 1rem;
`

const TransactionAmount = styled.div`
  font-size: 32px;
  font-weight: 700;
  line-height: 44px;
  text-align: right;
`

const CurrencyLabel = ({
  currency
}: {
  currency?: CurrencyAmount
}) => (
  <CurrencyLabelWrapper>
    <CurrencyLogo currency={currency?.currency} size="24px" />
    <CurrencyName>
      {currency?.currency.symbol}
    </CurrencyName>
  </CurrencyLabelWrapper>
)

export default function TransactionDiagnosis() {
  const pendingTransactions = usePendingTransactions()
  const { chainId } = useActiveWeb3React()
  const cancelTransaction = useTransactionCanceller()
  const tx = pendingTransactions[Object.keys(pendingTransactions)[0]]
  // const path = tx.processed?.swap.path;
  const tokenInput = tx.trade?.inputAmount;
  const tokenOutput = tx.trade?.outputAmount;

  console.log('tokens', tx, tokenInput, tokenOutput, pendingTransactions)

  function handleCancelClick(hash: string, tx: TransactionDetails) {
    if (!chainId) return
    if (!tx?.processed) return
    cancelTransaction(
      {
        chainId,
        hash
      },
      {
        transaction: tx.processed
      }
    )
  }

  return (
    <Wrapper>
      {Object.keys(pendingTransactions).map(hash => {
        const tx = pendingTransactions[hash]
        const canCancel = typeof tx?.status !== 'undefined'

        return (
          <StyledDiagnosticWrapper key={hash}>
            <TokenWrapper>
              <TokenAmountWrapper>
                <CurrencyLabel
                  currency={tokenInput}
                />
                <CurrencyLabel
                  currency={tokenOutput}
                />
              </TokenAmountWrapper>
              <img />
              <TokenAmountWrapper>
                <TransactionAmount>
                  {tokenInput?.toSignificant(6)}
                </TransactionAmount>
                <TransactionAmount>
                  {tokenOutput?.toSignificant(6)}
                </TransactionAmount>
              </TokenAmountWrapper>
            </TokenWrapper>
            {canCancel && (
              <StyledCancelButton onClick={() => handleCancelClick(hash, tx)}>Cancel Transaction</StyledCancelButton>
            )}
          </StyledDiagnosticWrapper>
        )
      })}
    </Wrapper>
  )
}
