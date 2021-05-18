import React from 'react'
import { usePendingTransactions } from "state/transactions/hooks"
import styled from "styled-components"

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.bg1}
  padding: 2rem;
`

const StyledDiagnosticWrapper = styled.div``

export default function TransactionDiagnosis() {
  const pendingTransactions = usePendingTransactions()

  return (
    <Wrapper>
      {Object.keys(pendingTransactions).map((hash) => {
        const tx = pendingTransactions[hash]
        return (
          <StyledDiagnosticWrapper key={hash}>
            <h6>
              Status: {tx.cancel ?? tx.status}
            </h6>
            <h6>
              Last block: {tx.blockNumber}
            </h6>
            <div>
              Diagnosis: {tx.mistxDiagnosis}
            </div>
            <div>
              Flashbots says... {tx.flashbotsResolution}
            </div>
          </StyledDiagnosticWrapper>
        )
      })}
    </Wrapper>
  )
}
