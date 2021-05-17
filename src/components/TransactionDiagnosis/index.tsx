import React from 'react'
import { usePendingTransactions } from "state/transactions/hooks"
import styled from "styled-components"

const Wrapper = styled.div`
  display: flex;
`

const StyledDiagnosticWrapper = styled.div``

export default function TransactionDiagnosis() {
  const pendingTransactions = usePendingTransactions()

  return (
    <Wrapper>
      {Object.keys(pendingTransactions).map((hash) => {
        const transaction = pendingTransactions[hash]
        return (
          <StyledDiagnosticWrapper>
            <h4>
              {transaction.blockNumber}
            </h4>
            <div>
              {transaction.mistxDiagnosis}
            </div>
            <div>
              {transaction.flashbotsResolution}
            </div>
          </StyledDiagnosticWrapper>
        )
      })}
    </Wrapper>
  )
}
