import React from 'react'
import styled, { css } from 'styled-components'
import { Info } from 'react-feather'
import { TransactionDetails } from '../../state/transactions/reducer'
import { Status } from '../../websocket'
import { ButtonText } from '../../components/Button'
import QuestionHelper from '../QuestionHelper'

const StyledContainer = styled.div`
  width: 100%;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
`

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  background: rgb(255 255 255 / 5%);
  border-radius: 18px;
  margin-bottom: 20px;
`

const StyledTransaction = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 0 0 10px 0;
  padding: 20px 0;
  border-bottom: 1px solid rgb(170 170 170 / 30%);
`

const StyledStatusWapper = styled.div`
  display: flex;
  align-items: center;
  // justify-content: space-between;
  width: 100%;
  margin: 0 0 10px 0;

  svg {
    display: flex;
    opacity: 60%;
    cursor: pointer;
    margin-left: 6px;
    path {
      fill: #fff;
    }
  }
`

const StyledTransactionStatus = styled.div<{ success?: boolean; failed?: boolean }>`
  display: flex;
  padding: 4px 8px;
  font-weight: 500;
  font-size: 15px;
  border-radius: 12px;
  background: rgb(0 0 0 / 20%);
  ${props =>
    props.success &&
    css`
      color: #4fc56a;
    `}
  ${props =>
    props.failed &&
    css`
      color: #d25346;
    `}
`

const StyledHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 10px 0;

  button {
    width: auto;
    font-size: 15px;
  }
  h4 {
    margin: 0;
  }
  > * {
    display: flex;
  }
`

export interface OverlayProps {
  transactions: any
}

export default function Overlay({ transactions }: OverlayProps) {
  const txs = Object.keys(transactions)
    .map((key: string) => transactions[key])
    .sort((a, b) => {
      if (a.updatedAt > b.updatedAt) return -1
      if (a.updatedAt < b.updatedAt) return 1
      return 0
    })
  console.log('txs', txs)
  return (
    <StyledContainer>
      <StyledHeading>
        <h4>Transactions</h4>
        <ButtonText>clear</ButtonText>
      </StyledHeading>
      <StyledWrapper>
        {txs.map((tx: any) => (
          <StyledTransaction key={tx.hash}>
            {tx.status === Status.SUCCESSFUL_BUNDLE && (
              <StyledStatusWapper>
                <StyledTransactionStatus success={true}>Success</StyledTransactionStatus>
              </StyledStatusWapper>
            )}
            {tx.cancel && tx.cancel === 'CANCEL_BUNDLE_SUCCESSFUL' && (
              <StyledStatusWapper>
                <StyledTransactionStatus>Cancelled</StyledTransactionStatus>
                <QuestionHelper text="Transaction cancelled for free" placement="top" />
              </StyledStatusWapper>
            )}
            {tx.status === Status.FAILED_BUNDLE && !tx.cancel && (
              <StyledStatusWapper>
                <StyledTransactionStatus failed={true}>Failed</StyledTransactionStatus>
                <QuestionHelper text={tx.message} placement="top" />
              </StyledStatusWapper>
            )}
            <div>{tx.summary}</div>
          </StyledTransaction>
        ))}
      </StyledWrapper>
    </StyledContainer>
  )
}
