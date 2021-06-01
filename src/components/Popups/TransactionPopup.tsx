import Loader from 'components/Loader'
import React, { useContext } from 'react'
import { AlertCircle, CheckCircle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
import { TYPE } from '../../theme'
import { ExternalLink } from '../../theme/components'
import { getEtherscanLink } from '../../utils'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'
import { Status } from '../../websocket'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
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
  const cancellation = status === Status.CANCEL_TRANSACTION_PENDING || status === Status.CANCEL_TRANSACTION_SUCCESSFUL
  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
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
        {chainId && success && !cancellation && (
          <ExternalLink href={getEtherscanLink(chainId, hash, 'transaction')}>View on Etherscan</ExternalLink>
        )}
        {message && (
          <TYPE.body fontSize=".875rem" mt=".5rem">
            {message}
          </TYPE.body>
        )}
      </AutoColumn>
    </RowNoFlex>
  )
}
