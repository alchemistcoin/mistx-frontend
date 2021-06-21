const fathomGoals = () => {
  if (process.env.REACT_APP_FATHOM_ENV === 'production') {
    return {
      WRAP_INTENT: '',
      WRAP_COMPLETE: '',
      UNWRAP_INTENT: '',
      UNWRAP_COMPLETE: '',
      SWAP_INTENT: '',
      SWAP_COMPLETE: '',
      CANCEL_INTENT: '',
      CANCEL_COMPLETE: '',
      ACCOUNT_CONNECTED: ''
    }
  }
  return {
    WRAP_INTENT: '6VKRIA34',
    WRAP_COMPLETE: 'TEDXDAY6',
    UNWRAP_INTENT: 'UXNPQG4C',
    UNWRAP_COMPLETE: 'SUBD6KBH',
    SWAP_INTENT: 'GIIEFO3L',
    SWAP_COMPLETE: 'AED2FILB',
    CANCEL_INTENT: 'YRZMSENQ',
    CANCEL_COMPLETE: 'AED2FILB',
    ACCOUNT_CONNECTED: 'U9IGQOT8'
  }
}

export default fathomGoals()
