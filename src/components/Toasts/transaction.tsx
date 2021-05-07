import React from 'react'
import styled from 'styled-components'
import { toast } from 'react-toastify'
import { ExternalLink } from 'theme'
import { truncateStringMiddle } from 'utils/truncateString'
import { getEtherscanLink } from 'utils'
import { ChainId } from '@alchemistcoin/sdk'

export enum TransactionToastType {
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

const TransactionState = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0rem;
  font-weight: 500;
  font-size: 0.825rem;
`

const TransactionStatus = styled.div`
  font-size: .875rem;
  font-weight: 600;
`

const TransactionLink = styled(ExternalLink)`
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};

  :hover {
    color: ${({ theme }) => theme.text1};
    text-decoration: underline;
  }
`

const Toast = ({
  chainId,
  hash,
  status,
  summary,
}: {
  chainId: ChainId
  hash: string
  status: string
  summary?: string
}) => (
  <TransactionState>
    <TransactionLink href={getEtherscanLink(chainId, hash, 'transaction')}>
      {summary ?? truncateStringMiddle(hash, 6, 7)} ↗
    </TransactionLink>
    <TransactionStatus>
      {status}
    </TransactionStatus>
  </TransactionState>
);

export const transactionToast = ({
  chainId,
  hash,
  status,
  summary,
  type,
}: {
  chainId: ChainId
  hash: string
  status: string
  summary?: string
  type?: TransactionToastType
}) => {
  const component = (
    <Toast
      chainId={chainId}
      hash={hash}
      status={status}
      summary={summary}
    />
  )

  const options = {
    autoClose: 5000,
    closeOnClick: true,
  };

  switch (type) {
    case TransactionToastType.ERROR:
      toast.error(
        component,
        options
      );
      break;
    case TransactionToastType.SUCCESS:
      toast.success(
        component,
        options
      );
      break;
    default:
      toast(
        component,
        options
      );
      break;
  }
};
