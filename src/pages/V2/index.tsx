import React from 'react'
import styled from 'styled-components'
import Swap from '../../components-v2/swap'

const Wrapper = styled.div`
  position: relative;
`

const Index = () => {
  return (
    <Wrapper>
      <Swap />
    </Wrapper>
  )
}

export default Index
