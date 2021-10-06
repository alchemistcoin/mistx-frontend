import React, { useCallback } from 'react'
import styled, { css } from 'styled-components'
import { useDispatch } from 'react-redux'
import { Status } from '@alchemist-coin/mistx-connect'
import { useActiveWeb3React } from '../../hooks'
import { ButtonText } from '../../components/Button'
import QuestionHelper from '../QuestionHelper'
import { useAllTransactions } from '../../state/transactions/hooks'
import { clearCompletedTransactions } from '../../state/transactions/actions'
import { StyledHeading } from './styled'
import { ExternalLink } from 'theme'
import { TransactionDetails } from 'state/transactions/reducer'
import { MouseoverTooltip } from 'components/Tooltip'
import { ReactComponent as LeaderboardIcon } from '../../assets/svg/leaderboard-icon.svg'
import { getEtherscanLink } from 'utils'
import { ChainId } from '@alchemist-coin/mistx-core'
import { keccak256 } from '@ethersproject/keccak256'

const StyledContainer = styled.div`
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  margin-top: 30px;
`

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  background: rgb(255 255 255 / 5%);
  border-radius: 18px;
  margin-bottom: 30px;
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
  width: 100%;
  margin: 0 0 10px 0;

  svg {
    display: flex;
    cursor: pointer;
    margin-left: 6px;
  }
`

const StyledTransactionStatus = styled.div<{ success?: boolean; failed?: boolean }>`
  display: flex;
  padding: 2px 8px;
  font-weight: 500;
  font-size: 15px;
  border-radius: 12px;
  background: rgb(0 0 0 / 20%);
  ${props =>
    props.success &&
    css`
      color: ${({ theme }) => theme.green1};
    `}
  ${props =>
    props.failed &&
    css`
      color: ${({ theme }) => theme.red3};
    `}
`

const StyledExternalLink = styled(ExternalLink)`
  font-weight: inherit;

  :hover {
    color: #fff;
  }
`

const StyledLeaderboardIcon = styled(LeaderboardIcon)`
  fill: ${({ theme }) => theme.secondaryText1};
  height: 1.25rem;
  width: 1.25rem;

  path {
    fill: ${({ theme }) => theme.secondaryText1};
  }
`

const StyledQuestionHelper = styled(QuestionHelper)`
  svg {
    opacity: 60%;
  }

  path {
    fill: #fff;
  }
`

export default function Transactions() {
  const dispatch = useDispatch()
  const { chainId } = useActiveWeb3React()
  const allTransactions = useAllTransactions()

  const txs = Object.keys(allTransactions)
    .map((key: string) => allTransactions[key])
    .sort((a, b) => {
      if (!a.updatedAt || !b.updatedAt) return 0
      if (a.updatedAt > b.updatedAt) return -1
      if (a.updatedAt < b.updatedAt) return 1
      return 0
    })

  const clearAllTransactionsCallback = useCallback(() => {
    if (chainId) dispatch(clearCompletedTransactions({ chainId }))
  }, [dispatch, chainId])

  return (
    <StyledContainer>
      <StyledHeading>
        <h3>Transactions</h3>
        {txs && txs.length > 0 && <ButtonText onClick={clearAllTransactionsCallback}>clear</ButtonText>}
      </StyledHeading>

      {txs && txs.length ? (
        <StyledWrapper>
          {txs.map((tx: TransactionDetails) => (
            <StyledTransaction key={tx.hash}>
              {tx.status === Status.SUCCESSFUL_BUNDLE && (
                <StyledStatusWapper>
                  <StyledTransactionStatus success={true}>Success</StyledTransactionStatus>
                  {tx.processed?.backrun && tx.processed?.backrun.best.count > 0 && (
                    <MouseoverTooltip
                      text={`Rewards: ${tx.processed.backrun.best.totalValueETH?.toFixed(
                        4
                      )}ETH ($${tx.processed.backrun.best.totalValueUSD?.toFixed(2)})`}
                      placement="top"
                    >
                      <ExternalLink
                        href={getEtherscanLink(
                          ChainId.MAINNET,
                          keccak256(tx.processed.backrun.best.transactions[0].serializedBackrun),
                          'transaction'
                        )}
                      >
                        <StyledLeaderboardIcon />
                      </ExternalLink>
                    </MouseoverTooltip>
                  )}
                </StyledStatusWapper>
              )}
              {tx.cancel && tx.cancel === Status.CANCEL_BUNDLE_SUCCESSFUL && (
                <StyledStatusWapper>
                  <StyledTransactionStatus>Cancelled</StyledTransactionStatus>
                  <StyledQuestionHelper text="Transaction cancelled for free" placement="top" />
                </StyledStatusWapper>
              )}
              {(tx.status === Status.FAILED_BUNDLE || tx.status === Status.BUNDLE_NOT_FOUND) && !tx.cancel && (
                <StyledStatusWapper>
                  <StyledTransactionStatus failed={true}>Failed</StyledTransactionStatus>
                  {tx.message && <StyledQuestionHelper text={tx.message} placement="top" />}
                </StyledStatusWapper>
              )}
              {tx.status === Status.SUCCESSFUL_BUNDLE ? (
                <StyledExternalLink href={`https://etherscan.io/tx/${tx.hash}`}>
                  {tx.summary}
                  <span style={{ fontSize: '.5em' }}>&nbsp;↗</span>
                </StyledExternalLink>
              ) : (
                <div>{tx.summary}</div>
              )}
            </StyledTransaction>
          ))}
        </StyledWrapper>
      ) : (
        <div>No Transactions</div>
      )}
    </StyledContainer>
  )
}
