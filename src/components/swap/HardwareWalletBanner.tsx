import styled from 'styled-components'

const Wrapper = styled.div`
  border-radius: 0 0 .25rem .25rem;
  display: flex;
  padding: 1rem;
`

export function HardwareWalletBanner() {
  return (
    <Wrapper>
      <b>Warning Ledger/Trezor users!</b>
      <span>Your hardware wallet will not work through MetaMask. Connect directly to mistX</span>
    </Wrapper>
  )
}
