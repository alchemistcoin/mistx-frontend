import React from 'react'
import * as S from './styled'
import { ReactComponent as PanelTopLeft } from '../../../assets-v2/svg/input-panel-top-left.svg'
import { ReactComponent as PanelBottomLeft } from '../../../assets-v2/svg/input-panel-bottom-left.svg'
import { ReactComponent as PanelTopRight } from '../../../assets-v2/svg/input-panel-top-right.svg'
import { ReactComponent as PanelBottomRight } from '../../../assets-v2/svg/input-panel-bottom-right.svg'

type InputPanelProps = {
  type: 'LEFT' | 'RIGHT'
}

const InputPanel = ({ type }: InputPanelProps) => {
  return (
    <S.Wrapper type={type}>
      <S.TopWrapper type={type}>{type === 'LEFT' ? <PanelTopLeft /> : <PanelTopRight />}</S.TopWrapper>
      <S.InnerWrapper type={type}></S.InnerWrapper>
      <S.TopWrapper type={type}>{type === 'LEFT' ? <PanelBottomLeft /> : <PanelBottomRight />}</S.TopWrapper>
    </S.Wrapper>
  )
}

export default InputPanel
