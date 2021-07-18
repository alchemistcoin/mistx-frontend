import React, { useState, useContext } from 'react'
import { Range, getTrackBackground } from 'react-range'
import { ThemeContext } from 'styled-components'
import MinerBribePrice from './MinerTipPrice'

type Props = {
  max: number
  min: number
  onChange: any
  value: number
  step: number
}

type ITrackProps = {
  props: {
    style: React.CSSProperties
    ref: React.RefObject<any>
    onMouseDown: (e: React.MouseEvent) => void
    onTouchStart: (e: React.TouchEvent) => void
  }
  children: React.ReactNode
  isDragged: boolean
  disabled: boolean
}

type IMarkProps = {
  props: {
    key: string
    style: React.CSSProperties
    ref: React.RefObject<any>
  }
  index: number
}

const SLIDER_VALUE_TO_LABEL_MAP: string[] = ['min success', 'med success', 'high success', 'max success']

const Slider = ({ max, min, onChange, value, step }: Props) => {
  const theme = useContext(ThemeContext)
  const [sliderValue, setSliderValue] = useState<number>(value)

  const onSliderChange = (values: any) => {
    setSliderValue(values)
    onChange(values[0])
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        margin: '2rem 0 0'
      }}
    >
      <Range
        values={[sliderValue]}
        step={step}
        min={min}
        max={max}
        onChange={values => onSliderChange(values)}
        renderMark={(props: IMarkProps) => (
          <>
            <div
              {...props.props}
              style={{
                ...props.props.style,
                height: '16px',
                width: '5px',
                backgroundColor: '#192431',
                cursor: 'pointer'
              }}
            />
            <div
              style={{
                ...props.props.style,
                position: 'absolute',
                bottom: '-40px'
              }}
            >
              <div
                style={{
                  ...props.props.style,
                  position: 'relative',
                  width: '70px',
                  left: '-35px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    textAlign: 'center',
                    alignItems: 'center',
                    fontSize: '14px',
                    lineHeight: '14px'
                  }}
                >
                  {SLIDER_VALUE_TO_LABEL_MAP[props.index]}
                </div>
                <div
                  style={{
                    display: 'flex',
                    textAlign: 'center',
                    alignItems: 'center',
                    fontSize: '14px'
                  }}
                >
                  {/*minerBribeContent(props.index)*/}
                </div>
              </div>
            </div>
          </>
        )}
        renderTrack={(props: ITrackProps) => (
          <div
            onMouseDown={props.props.onMouseDown}
            onTouchStart={props.props.onTouchStart}
            style={{
              height: '36px',
              display: 'flex',
              width: '100%',
              position: 'relative'
            }}
          >
            <div
              ref={props.props.ref}
              style={{
                height: '5px',
                width: '100%',
                borderRadius: '4px',
                background: getTrackBackground({
                  values: [value],
                  colors: ['#192431', '#192431'],
                  min: min,
                  max: max
                }),
                alignSelf: 'center',
                cursor: 'pointer'
              }}
            >
              {props.children}
            </div>
            <div
              style={{
                position: 'absolute',
                height: '5px',
                width: 'auto',
                left: '-30px',
                right: '-30px',
                top: '16px',
                zIndex: 1,
                borderRadius: '4px',
                background: '#192431',
                cursor: 'pointer'
              }}
            />
          </div>
        )}
        renderThumb={({ props, isDragged }) => (
          <div
            {...props}
            style={{
              height: '32px',
              width: '32px',
              borderRadius: '100%',
              backgroundColor: 'rgba(255, 191, 0, 0.22)',
              border: `2px solid ${theme.primary2}`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              zIndex: 3,
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-38px',
                fontWeight: 700,
                fontSize: '14px',
                borderRadius: '4px',
                backgroundColor: '#222e3b',
                border: '1px solid #ffbf01',
                color: theme.text1,
                padding: '0.25rem 0.5rem',
                cursor: 'pointer',
                minWidth: '150px',
                textAlign: 'center',
                zIndex: 3
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  bottom: '-7px',
                  left: '50%',
                  marginLeft: '-8px',
                  fontWeight: 700,
                  zIndex: 2,
                  borderLeft: '8px solid transparent',
                  borderTop: '7px solid #ffbf01',
                  borderRight: '8px solid transparent'
                }}
              />
              <MinerBribePrice />
            </div>
            <div
              style={{
                height: '14px',
                width: '14px',
                borderRadius: '100%',
                backgroundColor: isDragged ? '#FFF' : '#FFF',
                cursor: 'pointer',
                zIndex: 3
              }}
            />
          </div>
        )}
      />
    </div>
  )
}

export default Slider
