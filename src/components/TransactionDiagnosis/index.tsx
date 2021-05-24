import React from 'react'
import styled from 'styled-components'
import { usePendingTransactions, useTransactionCanceller } from 'state/transactions/hooks'
import { TransactionDetails } from 'state/transactions/reducer'
import { ButtonOutlined } from 'components/Button'
import { useActiveWeb3React } from 'hooks'
// import { ArrowDown } from 'react-feather'
import CurrencyLogo from 'components/CurrencyLogo'
import { CurrencyAmount } from '@alchemistcoin/sdk'
import { PendingTransactionIcon } from 'components/Icons'

const Wrapper = styled.div``

const StyledDiagnosticWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg1};
  border-radius: 1.5rem;
  padding: 2.25rem 2.5rem;
`

const StyledCancelButton = styled(ButtonOutlined)`
  height: 3rem;
  margin-top: 1.75rem;
`

const TokenWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  height: 140px;
`

const TokenAmountWrapper = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
`

const CurrencyLabelWrapper = styled.div`
  align-items: center;
  display: flex;
`

const CurrencyName = styled.div`
  font-size: 0.875rem;
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

const GraphicContainer = styled.div`
  background-color: ${({ theme }) => theme.black}
  border-radius: 1.25rem;
  padding: .625rem;
`

const StyledGraphicWrapper = styled.div`
  border-radius: 1.5rem;
  height: 160px;
  margin: 0 0.25rem;
  overflow: hidden;
  position: relative;
  width: 100%;
`
const StyledGraphic = styled.img`
  height: auto;
  position: absolute;
  left: 50%;
  width: 100%;
  top: 50%;
  transform: translate(-50%, -50%);
`

const Connector = () => (
  <svg
    width="302"
    height="24"
    viewBox="0 0 302 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block', margin: '0 auto' }}
  >
    <path
      d="M13 12C13 18.6274 7.62744 24 1 24C0.663269 24 0.329712 23.9861 0 23.9589V24H1H302C295.373 24 290 18.6274 290 12C290 5.37256 295.373 0 302 0H1H0V0.0410767C0.329712 0.013855 0.663269 0 1 0C7.62744 0 13 5.37256 13 12Z"
      fill="#101B28"
    />
  </svg>
)

const CurrencyLabel = ({ currency }: { currency?: CurrencyAmount }) => (
  <CurrencyLabelWrapper>
    <CurrencyLogo currency={currency?.currency} size="24px" />
    <CurrencyName>{currency?.currency.symbol}</CurrencyName>
  </CurrencyLabelWrapper>
)

export default function TransactionDiagnosis() {
  const pendingTransactions = usePendingTransactions()
  const { chainId } = useActiveWeb3React()
  const cancelTransaction = useTransactionCanceller()
  const hash = Object.keys(pendingTransactions)[0]
  const tx = pendingTransactions[hash]
  // const path = tx.processed?.swap.path;
  const tokenInput = tx?.inputAmount
  const tokenOutput = tx?.outputAmount
  const canCancel = typeof tx?.status !== 'undefined'

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
      <StyledDiagnosticWrapper>
        <TokenWrapper>
          {!tokenInput && !tokenOutput
            ? (
              <div style={{ textAlign: 'center', width: '100%' }}>
                {tx.summary}
              </div>
            )
            : (
              <>
                <TokenAmountWrapper>
                  {tx && (
                    <>
                      <CurrencyLabel currency={tokenInput} />
                      {/* <ArrowDown size="1rem" style={{ marginLeft: '.175rem' }}/> */}
                      <CurrencyLabel currency={tokenOutput} />
                    </>
                  )}
                </TokenAmountWrapper>
                <PendingTransactionIcon />
                <TokenAmountWrapper>
                  {tx && (
                    <>
                      <TransactionAmount>{tokenInput?.toSignificant?.(4)}</TransactionAmount>
                      <TransactionAmount>{tokenOutput?.toSignificant?.(4)}</TransactionAmount>
                    </>
                  )}
                </TokenAmountWrapper>
              </>
            )
          }
        </TokenWrapper>
        {canCancel && (
          <StyledCancelButton onClick={() => handleCancelClick(hash, tx)}>Cancel Transaction</StyledCancelButton>
        )}
      </StyledDiagnosticWrapper>
      <Connector />
      <GraphicContainer>
        <StyledGraphicWrapper>
          <StyledGraphic src={'https://media.giphy.com/media/7FrOU9tPbgAZtxV5mb/giphy.gif'} />
        </StyledGraphicWrapper>
      </GraphicContainer>
    </Wrapper>
  )
}
