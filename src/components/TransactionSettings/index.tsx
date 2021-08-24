import React, { useState, useRef, useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import QuestionHelper from '../QuestionHelper'
import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'
import FATHOM_GOALS from '../../constants/fathom'

import { darken } from 'polished'

enum SlippageError {
  InvalidInput = 'InvalidInput',
  RiskyLow = 'RiskyLow',
  RiskyHigh = 'RiskyHigh'
}

enum DeadlineError {
  InvalidInput = 'InvalidInput'
}

const StyledRowFixed = styled(RowFixed)`
  width: 100%;
  justify-content: space-between;
`

const FancyButton = styled.button`
  align-items: center;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.primary2};
  border-radius: 8px;
  color: ${({ theme }) => theme.text1};
  font-size: 1rem;
  height: 2rem;
  min-width: 3.5rem;
  outline: none;
  width: auto;

  :hover {
    border: 1px solid ${({ theme }) => darken(0.1, theme.primary2)};
  }

  :focus {
    border: 1px solid ${({ theme }) => darken(0.1, theme.primary2)};
  }
`
const FancyDiv = FancyButton.withComponent('div')

const Option = styled(FancyButton)<{ active: boolean }>`
  background-color: ${({ active, theme }) => active && theme.primary2};
  color: ${({ active, theme }) => (active ? theme.text5 : theme.text1)};
  margin-right: 1rem;

  :hover {
    cursor: pointer;
  }
`

const OptionCustom = styled(FancyDiv)<{ active?: boolean; warning?: boolean }>`
  align-items: center;
  background-color: #35404e;
  border: ${({ theme, active, warning }) => `1px solid ${active ? (warning ? theme.red1 : '#35404E') : '#35404E'}`};
  display: flex;
  flex: 1;
  font-weight: 700;
  height: 2rem;
  padding: 0 0.75rem;
  position: relative;

  :hover {
    border: ${({ theme, active, warning }) =>
      active && `1px solid ${warning ? darken(0.1, theme.red1) : darken(0.1, theme.primary2)}`};
  }
`

const Input = styled.input`
  border-radius: 8px;
  color: ${({ theme, color }) => (color === 'red' ? theme.red1 : theme.text1)};
  font-size: 16px;
  outline: none;
  text-align: right;
  width: auto;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
`

const SlippageInput = styled(Input)`
  background-color: inherit;
  border: 0;
  border-radius: 8px;
  height: 100%;
  width: 100%;
`

const DeadlineInput = styled(Input)`
  background-color: #35404e;
  border: 1px solid #35404e;
  flex: 1;
  font-weight: 700;
  height: 2rem;
  margin-right: 0.5rem;
  position: relative;

  :hover {
    border: ${({ theme }) => `1px solid ${darken(0.1, theme.primary2)}`};
  }
`

const SlippageEmojiContainer = styled.span`
  color: #f3841e;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;  
  `}
`

const slippageDefaults = [10, 50, 100]

export interface SlippageTabsProps {
  rawSlippage: number
  setRawSlippage: (rawSlippage: number) => void
  deadline: number
  setDeadline: (deadline: number) => void
}

const trackSlippageChange = () => {
  if (window.fathom) {
    window.fathom.trackGoal(FATHOM_GOALS.LEDGER_CONNECTED, 0)
  }
}

export default function SlippageTabs({ rawSlippage, setRawSlippage, deadline, setDeadline }: SlippageTabsProps) {
  const theme = useContext(ThemeContext)

  const inputRef = useRef<HTMLInputElement>()

  const [slippageInput, setSlippageInput] = useState(
    !slippageDefaults.includes(rawSlippage) ? `${rawSlippage / 100}` : ''
  )
  const [deadlineInput, setDeadlineInput] = useState('')

  const slippageInputIsValid =
    slippageInput === '' || (rawSlippage / 100).toFixed(2) === Number.parseFloat(slippageInput).toFixed(2)
  const deadlineInputIsValid = deadlineInput === '' || (deadline / 60).toString() === deadlineInput

  let slippageError: SlippageError | undefined
  if (slippageInput !== '' && !slippageInputIsValid) {
    slippageError = SlippageError.InvalidInput
  } else if (slippageInputIsValid && rawSlippage < 50) {
    slippageError = SlippageError.RiskyLow
  } else if (slippageInputIsValid && rawSlippage > 500) {
    slippageError = SlippageError.RiskyHigh
  } else {
    slippageError = undefined
  }

  let deadlineError: DeadlineError | undefined
  if (deadlineInput !== '' && !deadlineInputIsValid) {
    deadlineError = DeadlineError.InvalidInput
  } else {
    deadlineError = undefined
  }

  function parseCustomSlippage(value: string) {
    setSlippageInput(value)

    try {
      const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(value) * 100).toString())
      if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < 5000) {
        setRawSlippage(valueAsIntFromRoundedFloat)
      }
    } catch {}
  }

  function parseCustomDeadline(value: string) {
    setDeadlineInput(value)
    try {
      const valueAsInt: number = Number.parseInt(value) * 60

      if (!Number.isNaN(valueAsInt) && valueAsInt > 0) {
        setDeadline(valueAsInt)
        if (deadline !== valueAsInt) {
          if (window.fathom) {
            window.fathom.trackGoal(FATHOM_GOALS.SETTINGS_DEADLINE_CHANGED, 0)
          }
        }
      }
    } catch {}
  }

  return (
    <AutoColumn gap="md">
      <AutoColumn gap="sm">
        <StyledRowFixed marginBottom="1rem">
          <TYPE.black fontWeight={400} fontSize={16} color={theme.text1}>
            SLIPPAGE TOLERANCE
          </TYPE.black>
          <QuestionHelper text="Your transaction will revert if the price changes unfavorably by more than this percentage." />
        </StyledRowFixed>
        <RowBetween>
          {slippageDefaults.map((slippageValue: number) => (
            <Option
              onClick={() => {
                setSlippageInput('')
                setRawSlippage(slippageValue)
                trackSlippageChange()
              }}
              active={rawSlippage === slippageValue}
              key={slippageValue}
            >
              {slippageValue / 100}%
            </Option>
          ))}
          <OptionCustom active={![10, 50, 100].includes(rawSlippage)} warning={!slippageInputIsValid}>
            {!!slippageInput &&
            (slippageError === SlippageError.RiskyLow || slippageError === SlippageError.RiskyHigh) ? (
              <SlippageEmojiContainer>
                <span role="img" aria-label="warning">
                  ⚠️
                </span>
              </SlippageEmojiContainer>
            ) : null}
            {/* https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451 */}
            <SlippageInput
              ref={inputRef as any}
              placeholder="Custom"
              value={slippageInput}
              onBlur={() => {
                parseCustomSlippage((rawSlippage / 100).toFixed(2))
              }}
              onChange={e => parseCustomSlippage(e.target.value)}
              color={!slippageInputIsValid ? 'red' : ''}
            />
            %
          </OptionCustom>
        </RowBetween>
        {!!slippageError && (
          <RowBetween
            style={{
              fontSize: '14px',
              paddingTop: '7px',
              color: slippageError === SlippageError.InvalidInput ? 'red' : '#F3841E'
            }}
          >
            {slippageError === SlippageError.InvalidInput
              ? 'Enter a valid slippage percentage'
              : slippageError === SlippageError.RiskyLow
              ? 'Your transaction may fail'
              : 'Beware of high slippage in volatile markets'}
          </RowBetween>
        )}
      </AutoColumn>
      <AutoColumn gap="sm">
        <StyledRowFixed marginBottom="0.5rem" marginTop="1rem">
          <TYPE.black fontSize={16} fontWeight={400} color={theme.text1}>
            TRANSACTON DEADLINE
          </TYPE.black>
          <QuestionHelper text="Your transaction will revert if it is pending for more than this long." />
        </StyledRowFixed>
        <RowFixed>
          <DeadlineInput
            color={!!deadlineError ? 'red' : undefined}
            onBlur={() => {
              parseCustomDeadline((deadline / 60).toString())
            }}
            placeholder={(deadline / 60).toString()}
            value={deadlineInput}
            onChange={e => parseCustomDeadline(e.target.value)}
            style={{ width: '60px' }}
          />
          <TYPE.body style={{ paddingLeft: '8px' }} fontSize={14}>
            minutes
          </TYPE.body>
        </RowFixed>
      </AutoColumn>
    </AutoColumn>
  )
}
