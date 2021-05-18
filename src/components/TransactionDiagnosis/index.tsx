import React from 'react'
import styled from 'styled-components'
import { usePendingTransactions, useTransactionCanceller } from 'state/transactions/hooks'
import { TransactionDetails } from 'state/transactions/reducer'
import { ButtonOutlined } from 'components/Button'
import { useActiveWeb3React } from 'hooks'

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.bg1}
  padding: 2rem;
`

const StyledDiagnosticWrapper = styled.div``

const StyledCancelButton = styled(ButtonOutlined)`
  margin-top: 1.75rem;
`

export default function TransactionDiagnosis() {
  const pendingTransactions = usePendingTransactions()
  const { chainId } = useActiveWeb3React()
  const cancelTransaction = useTransactionCanceller()

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
      {Object.keys(pendingTransactions).map((hash) => {
        const tx = pendingTransactions[hash]
        const canCancel = typeof tx?.status !== 'undefined'

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
            {canCancel && (
              <StyledCancelButton onClick={() => handleCancelClick(hash, tx)}>
                Cancel Transaction
              </StyledCancelButton>
            )}
          </StyledDiagnosticWrapper>
        )
      })}
    </Wrapper>
  )
}
