import React from 'react'
import InputPanel from './InputPanel'
import SwitchInputPanel from './SwitchInputPanel'

const Swap = () => {
  return (
    <>
      <InputPanel type="LEFT" />
      <SwitchInputPanel />
      <InputPanel type="RIGHT" />
    </>
  )
}

export default Swap
