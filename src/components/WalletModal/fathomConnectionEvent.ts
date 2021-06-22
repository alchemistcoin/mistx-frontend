import { SUPPORTED_WALLETS } from '../../constants'
import FATHOM_GOALS from '../../constants/fathom'

const fathomConnectionEvent = (connector: any) => {
  if (!window.fathom) return

  if (connector === SUPPORTED_WALLETS.METAMASK.connector) {
    window.fathom.trackGoal(FATHOM_GOALS.METAMASK_CONNECTED, 0)
  }
  if (connector === SUPPORTED_WALLETS.LEDGER.connector) {
    window.fathom.trackGoal(FATHOM_GOALS.LEDGER_CONNECTED, 0)
  }
  if (connector === SUPPORTED_WALLETS.WALLET_CONNECT.connector) {
    window.fathom.trackGoal(FATHOM_GOALS.WALLET_CONNECT_CONNECTED, 0)
  }
}

export default fathomConnectionEvent
