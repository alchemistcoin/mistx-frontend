import React from 'react'
import styled from 'styled-components'
import { Field } from '../../state/swap/actions'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { useAlchmeistToken } from '../../state/lists/hooks'
import { useActiveWeb3React } from '../../hooks'
import { useSwapActionHandlers } from '../../state/swap/hooks'
import Loader from 'components/Loader'

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: revert;
  left: 30px;
  height: 43px;
  width: auto;

  &:before {
    content: '';
    position: absolute;
    height: 43px;
    top: 0;
    bottom: 0;
    left: -15px;
    right: 0;
    height: auto;
    width: auto;
    border: 2px solid #ba900e;
    border-radius: 30px 0 0 30px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    left: 0;
    &:before {
      right: 0;
      left: -30px;
      padding: 0;
      border-radius: 0 30px 30px 0; 
    }
  `};
`

const Wrapper = styled.div`
  position: relative;
  display: flex;
  min-width: 40px;
  align-content: center;
  justify-items: center;
  flex-direction: column;
  width: auto;
  height: 43px;
  border-right: 0;
  border-radius: 0;
  padding: 0 30px 0 0;
  border-radius: 30px 0 0 30px;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
  justify-content: center;
  white-space: pre;
  cursor: pointer;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0 20px 0px 0px;
    border-radius: 0;
  `};
`

const StyledLoader = styled(Loader)`
  display: flex;
`
const MistBalance = () => {
  const { account } = useActiveWeb3React()
  const { onCurrencySelection } = useSwapActionHandlers()
  const alchemistToken = useAlchmeistToken(1) // default ot mainnet as there is no mist token on other networks - value will fallback to 0 on other networks
  const balance = useCurrencyBalance(account ?? undefined, alchemistToken.token)
  const mistBalance = balance?.greaterThan('1')
    ? balance?.greaterThan('100')
      ? balance?.toFixed(0)
      : balance?.greaterThan('10')
      ? balance?.toFixed(1)
      : balance?.toFixed(2)
    : balance?.toSignificant(2)
  const handleOutputSelect = () => onCurrencySelection(Field.OUTPUT, alchemistToken.token)
  if (!account) return null
  return (
    <Container>
      <Wrapper onClick={handleOutputSelect}>
        {account && !mistBalance ? (
          <StyledLoader stroke="#fff" size="20px" />
        ) : (
          <> {mistBalance ? mistBalance : '0'} MIST</>
        )}
      </Wrapper>
    </Container>
  )
}

export default MistBalance
