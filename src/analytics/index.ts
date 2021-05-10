import { isMobile } from 'react-device-detect'
import ReactGA from 'react-ga'

function initFathom(): void {
  const FATHOM_ID: string | undefined = process.env.REACT_APP_FATHOM_ID
  if (typeof FATHOM_ID === 'string') {
    const head = document.getElementsByTagName('head')[0]
    const fathomScript = document.createElement('script')
    fathomScript.type = 'text/javascript'
    fathomScript.src = 'https://cdn.usefathom.com/script.js'
    fathomScript.dataset.site = FATHOM_ID
    head.appendChild(fathomScript)
  }
}

function initGA(): void {
  const GOOGLE_ANALYTICS_ID: string | undefined = process.env.REACT_APP_GOOGLE_ANALYTICS_ID
  if (typeof GOOGLE_ANALYTICS_ID === 'string') {
    ReactGA.initialize(GOOGLE_ANALYTICS_ID, {
      gaOptions: {
        storage: 'none',
        storeGac: false
      }
    })
    ReactGA.set({
      anonymizeIp: true,
      customBrowserType: !isMobile
        ? 'desktop'
        : 'web3' in window || 'ethereum' in window
        ? 'mobileWeb3'
        : 'mobileRegular'
    })
  } else {
    ReactGA.initialize('test', { testMode: true, debug: true })
  }

  window.addEventListener('error', error => {
    ReactGA.exception({
      description: `${error.message} @ ${error.filename}:${error.lineno}:${error.colno}`,
      fatal: true
    })
  })
}

export function initAnalytics(): void {
  initFathom()
  initGA()
}
