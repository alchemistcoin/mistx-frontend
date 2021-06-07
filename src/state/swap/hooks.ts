import useENS from '../../hooks/useENS'
import { Version } from '../../hooks/useToggledVersion'
import { parseUnits } from '@ethersproject/units'
import {
  Currency,
  CurrencyAmount,
  ETHER,
  Exchange,
  JSBI,
  Token,
  TokenAmount,
  Trade,
  TradeType
} from '@alchemistcoin/sdk'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useV1Trade } from '../../data/V1'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { useTradeExactIn, useTradeExactOut, useMinTradeAmount, MinTradeEstimates } from '../../hooks/Trades'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import useLatestGasPrice from '../../hooks/useLatestGasPrice'
import { isAddress } from '../../utils'
import { isETHTrade, isTradeBetter } from '../../utils/trades'
import { AppDispatch, AppState } from '../index'
import { useCurrencyBalance, useCurrencyBalances } from '../wallet/hooks'
import { Field, replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput } from './actions'
import { SwapState } from './reducer'
import useToggledVersion from '../../hooks/useToggledVersion'
import { useUserSlippageTolerance, useUserBribeMargin } from '../user/hooks'
import { computeSlippageAdjustedAmounts } from '../../utils/prices'
import { BigNumber } from '@ethersproject/bignumber'
import { MIN_TRADE_MARGIN, BETTER_TRADE_LESS_HOPS_THRESHOLD } from '../../constants'

export function useSwapState(): AppState['swap'] {
  return useSelector<AppState, AppState['swap']>(state => state.swap)
}

export function useSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
} {
  const dispatch = useDispatch<AppDispatch>()
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency instanceof Token ? currency.address : currency === ETHER ? 'ETH' : ''
        })
      )
    },
    [dispatch]
  )

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies())
  }, [dispatch])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient
  }
}

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string, currency?: Currency): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

const BAD_RECIPIENT_ADDRESSES: string[] = [
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a', // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' // v2 router 02
]

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
function involvesAddress(trade: Trade, checksummedAddress: string): boolean {
  return (
    trade.route.path.some(token => token.address === checksummedAddress) ||
    trade.route.pairs.some(pair => pair.liquidityToken.address === checksummedAddress)
  )
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(): {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmount: CurrencyAmount | undefined
  v2Trade: Trade | undefined
  minTradeAmounts: MinTradeEstimates
  inputError?: string
  minAmountError?: boolean
  v1Trade: Trade | undefined
} {
  const { account } = useActiveWeb3React()

  const toggledVersion = useToggledVersion()

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient
  } = useSwapState()
  const [userBribeMargin] = useUserBribeMargin()
  const gasPriceToBeat = useLatestGasPrice()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const recipientLookup = useENS(recipient ?? undefined)
  const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined
  ])

  const ethBalance = useCurrencyBalance(account ?? undefined, Currency.ETHER)

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)

  const minTradeAmounts = useMinTradeAmount(
    inputCurrency as Currency,
    outputCurrency as Currency,
    gasPriceToBeat,
    BigNumber.from(userBribeMargin),
    BigNumber.from(MIN_TRADE_MARGIN)
  )

  const bestTradeExactIn = useTradeExactIn(
    Exchange.UNI,
    minTradeAmounts[Exchange.UNI],
    isExactIn ? parsedAmount : undefined,
    outputCurrency ?? undefined,
    gasPriceToBeat,
    BigNumber.from(userBribeMargin)
  )
  const bestTradeExactInSushi = useTradeExactIn(
    Exchange.SUSHI,
    minTradeAmounts[Exchange.SUSHI],
    isExactIn ? parsedAmount : undefined,
    outputCurrency ?? undefined,
    gasPriceToBeat,
    BigNumber.from(userBribeMargin)
  )
  const bestTradeExactOut = useTradeExactOut(
    Exchange.UNI,
    minTradeAmounts[Exchange.UNI],
    inputCurrency ?? undefined,
    !isExactIn ? parsedAmount : undefined,
    gasPriceToBeat,
    BigNumber.from(userBribeMargin)
  )
  const bestTradeExactOutSushi = useTradeExactOut(
    Exchange.SUSHI,
    minTradeAmounts[Exchange.SUSHI],
    inputCurrency ?? undefined,
    !isExactIn ? parsedAmount : undefined,
    gasPriceToBeat,
    BigNumber.from(userBribeMargin)
  )
  //compare quotes
  let v2Trade
  if (isExactIn) {
    //simpler?
    if (bestTradeExactIn || bestTradeExactInSushi) {
      v2Trade = isTradeBetter(bestTradeExactInSushi, bestTradeExactIn, BETTER_TRADE_LESS_HOPS_THRESHOLD)
        ? bestTradeExactIn
        : bestTradeExactInSushi
    }
  } else {
    if (bestTradeExactOut || bestTradeExactOutSushi) {
      v2Trade = isTradeBetter(bestTradeExactOutSushi, bestTradeExactOut, BETTER_TRADE_LESS_HOPS_THRESHOLD)
        ? bestTradeExactOut
        : bestTradeExactOutSushi
    }
  }

  //from here on we already set the right exchange for the trade - just need to set the router contract
  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1]
  }

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined
  }

  // get link to trade on v1, if a better rate exists
  const v1Trade = useV1Trade(isExactIn, currencies[Field.INPUT], currencies[Field.OUTPUT], parsedAmount)

  let inputError: string | undefined
  if (!account) {
    inputError = 'Connect Wallet'
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Swap'
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? 'Swap'
  }

  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? 'Enter a recipient'
  } else {
    if (
      BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1 ||
      (bestTradeExactIn && involvesAddress(bestTradeExactIn, formattedTo)) ||
      (bestTradeExactOut && involvesAddress(bestTradeExactOut, formattedTo))
    ) {
      inputError = inputError ?? 'Invalid recipient'
    }
  }

  const [allowedSlippage] = useUserSlippageTolerance()

  const slippageAdjustedAmounts = v2Trade && allowedSlippage && computeSlippageAdjustedAmounts(v2Trade, allowedSlippage)

  const slippageAdjustedAmountsV1 =
    v1Trade && allowedSlippage && computeSlippageAdjustedAmounts(v1Trade, allowedSlippage)

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [
    currencyBalances[Field.INPUT],
    toggledVersion === Version.v1
      ? slippageAdjustedAmountsV1
        ? slippageAdjustedAmountsV1[Field.INPUT]
        : null
      : slippageAdjustedAmounts
      ? slippageAdjustedAmounts[Field.INPUT]
      : null
  ]

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    inputError = 'Insufficient ' + amountIn.currency.symbol + ' balance'
  }

  // check if input amount is too low
  let minAmountError = false
  const minTradeAmountsForBestExchange = minTradeAmounts[v2Trade ? v2Trade.exchange : Exchange.UNDEFINED]
  if (minTradeAmountsForBestExchange && parsedAmount) {
    if (
      minTradeAmountsForBestExchange[isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT] &&
      minTradeAmountsForBestExchange[isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT].greaterThan(
        parsedAmount
      )
    ) {
      minAmountError = true
    }
  } else if (parsedAmount && (minTradeAmounts[Exchange.UNI] || minTradeAmounts[Exchange.SUSHI])) {
    minAmountError = true
  }

  if (minAmountError) {
    inputError = 'Min trade amount not met'
  }

  // check if the user has ETH to pay the bribe for token -> token swap
  // what do we display if we have multiple inputErrors? (order)
  const ethTrade = isETHTrade(v2Trade)
  if (ethTrade !== undefined && !ethTrade && JSBI.LT(ethBalance?.raw, v2Trade?.minerBribe.raw)) {
    inputError = 'Insufficient ' + ethBalance?.currency.symbol + ' balance (bribe)'
  }

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade: v2Trade ?? undefined,
    minTradeAmounts,
    inputError,
    minAmountError,
    v1Trade
  }
}

function parseCurrencyFromURLParameter(urlParam: any): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    if (urlParam.toUpperCase() === 'ETH') return 'ETH'
    if (valid === false) return 'ETH'
  }
  return 'ETH' ?? ''
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  if (ENS_NAME_REGEX.test(recipient)) return recipient
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}

export function queryParametersToSwapState(parsedQs: ParsedQs): SwapState {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency)
  if (inputCurrency === outputCurrency) {
    if (typeof parsedQs.outputCurrency === 'string') {
      inputCurrency = ''
    } else {
      outputCurrency = ''
    }
  }

  const recipient = validatedRecipient(parsedQs.recipient)

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient
  }
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch():
  | { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined }
  | undefined {
  const { chainId } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()
  const parsedQs = useParsedQueryString()
  const [result, setResult] = useState<
    { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
  >()

  useEffect(() => {
    if (!chainId) return
    const parsed = queryParametersToSwapState(parsedQs)

    dispatch(
      replaceSwapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: parsed[Field.INPUT].currencyId,
        outputCurrencyId: parsed[Field.OUTPUT].currencyId,
        recipient: parsed.recipient
      })
    )

    setResult({ inputCurrencyId: parsed[Field.INPUT].currencyId, outputCurrencyId: parsed[Field.OUTPUT].currencyId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId])

  return result
}
