import React, { useState } from 'react'
import dayjs from 'dayjs'
import styled from 'styled-components'
import { usePendingTransactions, useTransactionCanceller } from 'state/transactions/hooks'
import { AmountDetails } from 'state/transactions/reducer'
import { ButtonOutlined } from 'components/Button'
import { useActiveWeb3React } from 'hooks'
// import { ArrowDown } from 'react-feather'
import CurrencyLogo from 'components/CurrencyLogo'
import { PendingTransactionIcon } from 'components/Icons'
import { TYPE } from 'theme'
import { ETHER, Token } from '@alchemistcoin/sdk'
import { SettingsHeader } from 'components/shared/header/styled'

const Wrapper = styled.div``

const StyledDiagnosticWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg1};
  border-radius: 1.5rem;
  padding: 2.25rem 1.875rem;
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

const UpdatesHeader = styled(SettingsHeader)`
  flex-direction: column;
  font-size: 1.5rem;
  line-height: 2rem;
  text-align: center;

  &:before {
    background-color: ${({ theme }) => theme.green1}
    border-radius: 0 5px 5px 0;
    height: 72px;
    left: -1.875rem;
    width: 5px;
  }
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

const CurrencyLabel = ({ amount }: { amount: AmountDetails }) => {
  return (
    <CurrencyLabelWrapper>
      <CurrencyLogo
        currency={
          amount.currency.address && amount.currency.chainId
            ? new Token(amount.currency.chainId, amount.currency.address, amount.currency.decimals)
            : ETHER
        }
        size="24px"
      />
      <CurrencyName>{amount.currency.symbol}</CurrencyName>
    </CurrencyLabelWrapper>
  )
}

const CancelConfirmationModal = React.lazy(() => import('components/CancelConfirmationModal'))

export default function TransactionDiagnosis() {
  const pendingTransactions = usePendingTransactions()
  const { chainId } = useActiveWeb3React()
  const cancelTransaction = useTransactionCanceller()
  const hash = Object.keys(pendingTransactions)[0]
  const tx = pendingTransactions[hash]
  // const path = tx.processed?.swap.path;
  const tokenInput = tx?.inputAmount
  const tokenOutput = tx?.outputAmount

  console.log('pendingTransactions', pendingTransactions)

  const canCancel = typeof tx?.status !== 'undefined'
  const [cancelIntent, setCancelIntent] = useState(false)
  const [cancelClicked, setCancelClicked] = useState(false)
  // console.log('tokens', tx, tokenInput, tokenOutput, pendingTransactions)

  function handleCancelIntent() {
    setCancelIntent(true)
  }

  function handleCancelClick() {
    if (!chainId) return
    if (!tx?.processed) return
    setCancelClicked(true)
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
      <CancelConfirmationModal
        isOpen={cancelIntent}
        onClose={() => setCancelIntent(false)}
        onSubmit={handleCancelClick}
      />
      <StyledDiagnosticWrapper>
        <UpdatesHeader>
          <TYPE.black display="block" fontWeight="700" mb=".625rem">
            {`Last Block: ${tx.lastCheckedBlockNumber || '...'}`}
          </TYPE.black>
          {tx?.updatedAt ? (
            <TYPE.green display="block" fontWeight="700">
              {`Updated: ${dayjs(tx.updatedAt).format('h:mm:ssA')}`}
            </TYPE.green>
          ) : (
            <TYPE.green display="block" fontWeight="700">
              {`Sent at: ${dayjs(tx.addedTime).format('h:mm:ssA')}`}
            </TYPE.green>
          )}
        </UpdatesHeader>
        <TokenWrapper>
          {!tokenInput && !tokenOutput ? (
            <div style={{ textAlign: 'center', width: '100%' }}>{tx.summary}</div>
          ) : (
            <>
              <TokenAmountWrapper>
                {tokenInput && <CurrencyLabel amount={tokenInput} />}
                {/* <ArrowDown size="1rem" style={{ marginLeft: '.175rem' }}/> */}
                {tokenOutput && <CurrencyLabel amount={tokenOutput} />}
              </TokenAmountWrapper>
              <PendingTransactionIcon />
              <TokenAmountWrapper>
                <TransactionAmount>{tokenInput?.value}</TransactionAmount>
                <TransactionAmount>{tokenOutput?.value}</TransactionAmount>
              </TokenAmountWrapper>
            </>
          )}
        </TokenWrapper>
        {canCancel && (
          <StyledCancelButton disabled={cancelClicked} onClick={handleCancelIntent}>
            {cancelClicked ? 'Cancellation Pending' : 'Cancel Transaction'}
          </StyledCancelButton>
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
