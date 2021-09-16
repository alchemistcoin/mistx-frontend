import React, { useContext } from 'react'
import { Status } from '@alchemist-coin/mistx-connect'
import { AlertCircle, CheckCircle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components'
// hooks
import { useActiveWeb3React } from '../../hooks'
// components
import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'
import { ExternalLink } from '../../theme/components'
import Loader from '../Loader'
// utils
import { getEtherscanLink } from '../../utils'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
  align-items: flex-start;
`

export default function TransactionPopup({
  hash,
  pending,
  message,
  success,
  summary,
  status
}: {
  hash: string
  pending?: boolean
  message?: string
  success?: boolean
  summary?: string
  status?: string
}) {
  const { chainId } = useActiveWeb3React()

  const theme = useContext(ThemeContext)
  const cancellation = status === Status.FAILED_BUNDLE || status === Status.CANCEL_BUNDLE_SUCCESSFUL

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16, marginTop: 2 }}>
        {success && !cancellation ? (
          <CheckCircle color={theme.green1} size={24} />
        ) : pending ? (
          <Loader stroke={theme.text3} size="24px" />
        ) : (
          <AlertCircle color={theme.red1} size={24} />
        )}
      </div>
      <AutoColumn gap="8px">
        <TYPE.body fontWeight={500}>{summary ?? 'Hash: ' + hash.slice(0, 8) + '...' + hash.slice(58, 65)}</TYPE.body>
        {message && (
          <TYPE.body fontSize=".875rem" mt=".5rem">
            {message}
          </TYPE.body>
        )}
        {chainId && success && !cancellation && (
          <ExternalLink href={getEtherscanLink(chainId, hash, 'transaction')}>View on Etherscan</ExternalLink>
        )}
      </AutoColumn>
    </RowNoFlex>
  )
}
