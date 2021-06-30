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
`

const Left = styled.div`
  position: relative;
  display: flex;
  min-width: 40px;
  align-content: center;
  justify-items: center;
  flex-direction: column;
  width: auto;
  height: 43px;
  border: 2px solid #ba900e;
  border-right: 0;
  border-radius: 0;
  padding: 7px 0 7px 14px;
  border-radius: 30px 0 0 30px;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
  justify-content: center;
  white-space: pre;
  cursor: pointer;
`

const Right = styled.div`
  position: relative;
  display: flex;
  width: 30px;
  height: 43px;
  border: 2px solid #ba900e;
  border-left: 0;
`

const StyledLoader = styled(Loader)`
  display: flex;
`
const MistBalance = () => {
  const { account } = useActiveWeb3React()
  const { onCurrencySelection } = useSwapActionHandlers()
  const alchemistToken = useAlchmeistToken(1) // default ot mainnet as there is no mist token on other networks - value will fallback to 0 on other networks
  const balance = useCurrencyBalance(account ?? undefined, alchemistToken.token)
  const mistBalance = balance?.toSignificant(2)
  const handleOutputSelect = () => onCurrencySelection(Field.OUTPUT, alchemistToken.token)
  if (!account) return null
  return (
    <Container>
      <Left onClick={handleOutputSelect}>
        {account && !mistBalance ? (
          <StyledLoader stroke="#fff" size="20px" />
        ) : (
          <> {mistBalance ? mistBalance : '0'} MIST</>
        )}
      </Left>
      <Right />
    </Container>
  )
}

export default MistBalance
