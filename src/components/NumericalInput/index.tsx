import React, { useCallback } from 'react'
import styled from 'styled-components'
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler'
import { escapeRegExp } from '../../utils'

const StyledInput = styled.input<{
  error?: boolean
  align?: string
  fontSize?: string
  fontWeight?: string
}>`
  color: ${({ error, theme }) => (error ? theme.red1 : theme.text1)};
  width: 0;
  position: relative;
  font-weight: 600;
  outline: none;
  border: none;
  flex: 1 1 auto;
  background-color: inherit;
  text-align: ${({ align }) => align && align};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0px;
  -webkit-appearance: textfield;
  font: inherit;
  font-size: ${({ fontSize }) => fontSize ?? '24px'};
  font-weight: 700;
  margin: 0 0 0.5rem 0;

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  [type='number'] {
    -moz-appearance: textfield;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  ::placeholder {
    color: ${({ theme }) => theme.text1};
    font-weight: 600;
  }
`

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group

export const Input = React.memo(function InnerInput({
  value,
  onUserInput,
  placeholder,
  ...rest
}: {
  value: string | number
  onUserInput: (input: string) => void
  error?: boolean
  fontSize?: string
  fontWeight?: string
  align?: 'right' | 'left'
} & Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'>) {
  const enforcer = useCallback(
    (nextUserInput: string) => {
      if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
        onUserInput(nextUserInput)
      }
    },
    [onUserInput]
  )

  const [defaultValue, onChange] = useDebouncedChangeHandler(`${value}`, enforcer, 400)

  return (
    <StyledInput
      {...rest}
      defaultValue={defaultValue}
      onChange={event => {
        // replace commas with periods, because uniswap exclusively uses period as the decimal separator
        onChange(event.target.value.replace(/,/g, '.'))
      }}
      // universal input options
      inputMode="decimal"
      title="Token Amount"
      fontSize={'2.2rem'}
      autoComplete="off"
      autoCorrect="off"
      // text-specific options
      type="text"
      pattern="^[0-9]*[.,]?[0-9]*$"
      placeholder={placeholder || '0'}
      minLength={1}
      maxLength={79}
      spellCheck="false"
    />
  )
})

export default Input

// const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group
