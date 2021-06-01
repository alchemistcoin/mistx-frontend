import { Trade } from '@alchemistcoin/sdk'
import React from 'react'
import TransactionInformationModal from '../TransactionInformationModal'
import ConfirmationPendingContent from './ConfirmationPendingContent'
import Modal from '../Modal'

export default function ConfirmSwapModal({
  onConfirm,
  onDismiss,
  isOpen,
  attemptingTxn,
  trade
}: {
  isOpen: boolean
  onConfirm: () => void
  onDismiss: () => void
  attemptingTxn: boolean
  trade: Trade | undefined
}) {
  // text to show while loading
  const pendingText = `Swapping ${trade?.inputAmount?.toSignificant(6)} ${
    trade?.inputAmount?.currency?.symbol
  } for ${trade?.outputAmount?.toSignificant(6)} ${trade?.outputAmount?.currency?.symbol}`

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      {attemptingTxn ? (
        <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
      ) : (
        <TransactionInformationModal onDismiss={onDismiss} onContinue={onConfirm} />
      )}
    </Modal>
  )
}
