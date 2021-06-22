import { SUPPORTED_WALLETS } from '../../constants'
import FATHOM_GOALS from '../../constants/fathom'

const fathomConnectionEvent = (connector: any) => {
  if (!window.fathom) return

  if (connector === SUPPORTED_WALLETS.METAMASK.connector) {
    window.fathom.trackGoal(FATHOM_GOALS.METAMASK_CONNECTED, 0)
  }
  if (connector === SUPPORTED_WALLETS.LEDGER.connector) {
    const lastEvent = Number(localStorage.getItem('ledgerFathomEvent'))
    const timeNow = new Date().getTime()
    const difference = (timeNow - timeNow) / 1000 / 60 // mins
    // longer than 24hr
    if (!lastEvent || (lastEvent && difference > 1440)) {
      const timeStamp = new Date().getTime()
      localStorage.setItem('ledgerFathomEvent', timeStamp.toString())
      window.fathom.trackGoal(FATHOM_GOALS.LEDGER_CONNECTED, 0)
    }
  }
  if (connector === SUPPORTED_WALLETS.WALLET_CONNECT.connector) {
    window.fathom.trackGoal(FATHOM_GOALS.WALLET_CONNECT_CONNECTED, 0)
  }
}

export default fathomConnectionEvent
