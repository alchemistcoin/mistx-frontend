import { Currency } from '@alchemist-coin/mistx-core'
import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import Modal from '../Modal'
// import { ExternalLink } from '../../theme'
import { Text } from 'rebass'
import { CloseIcon /*CustomLightSpinner*/ } from '../../theme/components'
import { RowBetween } from '../Row'
import { AlertTriangle } from 'react-feather'
import { ButtonOutlined } from '../Button'
import { AutoColumn, ColumnCenter } from '../Column'
// import Circle from '../../assets/images/blue-loader.svg'
import Loader from '../Loader'
// import { getEtherscanLink } from '../../utils'
import { useActiveWeb3React } from '../../hooks'
// import useAddTokenToMetamask from 'hooks/useAddTokenToMetamask'

const Wrapper = styled.div`
  width: 100%;
`
const Section = styled(AutoColumn)`
  padding: 24px;
`

const BottomSection = styled(AutoColumn)`
  background-color: ${({ theme }) => theme.bg1};
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 60px 0;
`

function ConfirmationPendingContent({ onDismiss, pendingText }: { onDismiss: () => void; pendingText: string }) {
  const theme = useContext(ThemeContext)

  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <div />
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <ConfirmedIcon>
          <Loader stroke={theme.text3} size="80px" />
          {/* <CustomLightSpinner src={Circle} alt="loader" size={'90px'} /> */}
        </ConfirmedIcon>
        <AutoColumn gap="12px" justify={'center'}>
          <Text fontWeight={500} fontSize={20}>
            Waiting For Confirmation
          </Text>
          <AutoColumn gap="12px" justify={'center'}>
            <Text fontWeight={600} fontSize={14} color="" textAlign="center">
              {pendingText}
            </Text>
          </AutoColumn>
          <Text fontSize={12} color={theme.text2} textAlign="center">
            Confirm this transaction in your wallet
          </Text>
        </AutoColumn>
      </Section>
    </Wrapper>
  )
}

// TO DO - add this to the transaction popup ?
// {currencyToAdd && library?.provider?.isMetaMask && (
//   <ButtonYellow mt="12px" padding="6px 1rem" width="fit-content" onClick={addToken}>
//     {!success ? (
//       <RowFixed>
//         Add {currencyToAdd.symbol} to Metamask <StyledLogo src={MetaMaskLogo} />
//       </RowFixed>
//     ) : (
//       <RowFixed>
//         Added {currencyToAdd.symbol}{' '}
//         <CheckCircle size={'16px'} stroke={theme.green1} style={{ marginLeft: '6px' }} />
//       </RowFixed>
//     )}
//   </ButtonYellow>
// )}

export function ConfirmationModalContent({
  title,
  bottomContent,
  onDismiss,
  topContent
}: {
  title: string
  onDismiss: () => void
  topContent: () => React.ReactNode
  bottomContent: () => React.ReactNode
}) {
  return (
    <Wrapper>
      <RowBetween style={{ padding: '1rem 1.5rem 0' }}>
        <Text fontWeight={700} fontSize={28}>
          {title}
        </Text>
        <CloseIcon onClick={onDismiss} />
      </RowBetween>
      <AutoColumn style={{ padding: '2.25rem 2rem' }}>{topContent()}</AutoColumn>
      <BottomSection>{bottomContent()}</BottomSection>
    </Wrapper>
  )
}

export function TransactionErrorContent({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const theme = useContext(ThemeContext)
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <Text fontWeight={500} fontSize={20}>
            Error
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <AutoColumn style={{ marginTop: 20, padding: '2rem 0' }} gap="24px" justify="center">
          <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
          <Text fontWeight={500} fontSize={16} color={theme.red1} style={{ textAlign: 'center', width: '85%' }}>
            {message}
          </Text>
        </AutoColumn>
      </Section>
      <BottomSection gap="12px">
        <ButtonOutlined onClick={onDismiss}>
          <Text fontWeight="500" fontSize={20}>
            Dismiss
          </Text>
        </ButtonOutlined>
      </BottomSection>
    </Wrapper>
  )
}

interface ConfirmationModalProps {
  children: React.ReactNode
  isOpen: boolean
  onDismiss: () => void
  hash: string | undefined
  attemptingTxn: boolean
  pendingText: string
  currencyToAdd?: Currency | undefined
}

export default function TransactionConfirmationModal({
  children,
  isOpen,
  onDismiss,
  attemptingTxn,
  pendingText,
}: ConfirmationModalProps) {
  const { chainId } = useActiveWeb3React()

  if (!chainId) return null

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      {attemptingTxn ? <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} /> : children}
    </Modal>
  )
}
