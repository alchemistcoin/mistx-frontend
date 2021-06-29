import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Text } from 'rebass'
import { RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { useActiveWeb3React } from 'hooks'
import { NETWORK_CHAIN_ID } from 'connectors'
import Modal from 'components/Modal'
import { NETWORK_LABELS } from 'components/WalletConnect'
import { AlertTriangle } from 'react-feather'

const Wrapper = styled.div`
  width: 100%;
`
const Section = styled(AutoColumn)`
  padding: 24px;
`

export default function NetworkWarningModal() {
  const [isOpen, setIsOpen] = useState(false)

  const { chainId } = useActiveWeb3React()

  function handleClose() {
    // do nothing
  }

  useEffect(() => {
    if (chainId && chainId !== NETWORK_CHAIN_ID) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [chainId])

  if (!isOpen || !chainId) return null

  return (
    <Modal isOpen={isOpen} onDismiss={handleClose}>
      <Wrapper>
        <Section>
          <RowBetween>
            <Text fontWeight={500} fontSize={24}>
              Wrong Network!
            </Text>
            <AlertTriangle size={20} />
          </RowBetween>
          <RowBetween margin="1rem 0 0" flexDirection="column">
            <Text fontWeight={300} fontSize={18}>
              {`Check your wallet's selected network and make sure you are connected to `}
              <b>{(NETWORK_CHAIN_ID === 1 && 'Ethereum Mainnet') || (NETWORK_CHAIN_ID === 5 && 'Görli')}</b>
            </Text>
          </RowBetween>
          <RowBetween margin="1rem 0 0" flexDirection="column">
            <Text fontWeight={300} fontSize={12} fontStyle="italic">
              {`Your current network (${NETWORK_LABELS[chainId]}) isn't supported.`}
            </Text>
          </RowBetween>
        </Section>
      </Wrapper>
    </Modal>
  )
}
