import { Currency, CurrencyAmount, Ether, JSBI, Token } from '@alchemist-coin/mistx-core'
import { useMemo } from 'react'
import ERC20_INTERFACE from '../../constants/abis/erc20'
import { useAllTokens } from '../../hooks/Tokens'
import { useActiveWeb3React } from '../../hooks'
import { useMulticallContract } from '../../hooks/useContract'
import { isAddress } from '../../utils'
import { useSingleContractMultipleData, useMultipleContractSingleData } from '../multicall/hooks'
import { useAlchemistToken } from '../../state/lists/hooks'

/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 */
function useETHBalances(
  uncheckedAddresses?: (string | undefined)[]
): { [address: string]: CurrencyAmount<Currency> | undefined } {
  const multicallContract = useMulticallContract()
  const { chainId } = useActiveWeb3React()

  const addresses: string[] = useMemo(
    () =>
      uncheckedAddresses
        ? uncheckedAddresses
            .map(isAddress)
            .filter((a): a is string => a !== false)
            .sort()
        : [],
    [uncheckedAddresses]
  )

  const addressArrays = useMemo(() => addresses.map(address => [address]), [addresses])
  const results = useSingleContractMultipleData(multicallContract, 'getEthBalance', addressArrays)

  return useMemo(() => {
    if (!chainId) return {}
    return addresses.reduce<{ [address: string]: CurrencyAmount<Currency> }>((memo, address, i) => {
      const value = results?.[i]?.result?.[0]
      if (value) memo[address] = CurrencyAmount.fromRawAmount(Ether.onChain(chainId), JSBI.BigInt(value.toString()))
      return memo
    }, {})
  }, [addresses, chainId, results])
}

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export function useTokenBalancesWithLoadingIndicator(
  address?: string,
  tokens?: (Token | undefined)[]
): [{ [tokenAddress: string]: CurrencyAmount<Token> | undefined }, boolean] {
  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens]
  )

  const validatedTokenAddresses = useMemo(() => validatedTokens.map(vt => vt.address), [validatedTokens])
  const addresses = useMemo(() => [address], [address])
  const balances = useMultipleContractSingleData(validatedTokenAddresses, ERC20_INTERFACE, 'balanceOf', addresses)

  const anyLoading: boolean = useMemo(() => balances.some(callState => callState.loading), [balances])

  return [
    useMemo(
      () =>
        address && validatedTokens.length > 0
          ? validatedTokens.reduce<{ [tokenAddress: string]: CurrencyAmount<Token> | undefined }>((memo, token, i) => {
              const value = balances?.[i]?.result?.[0]
              const amount = value ? JSBI.BigInt(value.toString()) : undefined
              if (amount) {
                memo[token.address] = CurrencyAmount.fromRawAmount(token, amount)
              }
              return memo
            }, {})
          : {},
      [address, validatedTokens, balances]
    ),
    anyLoading
  ]
}

export function useTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[]
): { [tokenAddress: string]: CurrencyAmount<Token> | undefined } {
  return useTokenBalancesWithLoadingIndicator(address, tokens)[0]
}

// get the balance for a single token/account combo
export function useTokenBalance(account?: string, token?: Token): CurrencyAmount<Token> | undefined {
  const tokens = useMemo(() => [token], [token])
  const tokenBalances = useTokenBalances(account, tokens)

  if (!token) return undefined

  return tokenBalances[token.address]
}

export function useCurrencyBalances(
  account?: string,
  currencies?: (Currency | undefined)[]
): (CurrencyAmount<Currency> | undefined)[] {
  const tokens = useMemo(() => currencies?.filter((currency): currency is Token => currency instanceof Token) ?? [], [
    currencies
  ])

  const tokenBalances = useTokenBalances(account, tokens)
  const containsETH: boolean = useMemo(() => currencies?.some(currency => currency?.isNative) ?? false, [currencies])
  const addresses = useMemo(() => (containsETH ? [account] : []), [containsETH, account])
  const ethBalance = useETHBalances(addresses)

  return useMemo(
    () =>
      currencies?.map(currency => {
        if (!account || !currency) return undefined
        if (currency.isToken) return tokenBalances[currency.address]
        if (currency.isNative) return ethBalance[account]
        return undefined
      }) ?? [],
    [account, currencies, ethBalance, tokenBalances]
  )
}

export function useCurrencyBalance(account?: string, currency?: Currency): CurrencyAmount<Currency> | undefined {
  const currencies = useMemo(() => [currency], [currency])
  return useCurrencyBalances(account, currencies)[0]
}

// mimics useAllBalances
export function useAllTokenBalances(): { [tokenAddress: string]: CurrencyAmount<Token> | undefined } {
  const { account } = useActiveWeb3React()
  const allTokens = useAllTokens()
  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens])
  const balances = useTokenBalances(account ?? undefined, allTokensArray)
  return balances ?? {}
}

export function useMistBalance(long?: boolean): any {
  const { account } = useActiveWeb3React()
  const alchemistToken = useAlchemistToken(1) // default ot mainnet as there is no mist token on other networks - value will fallback to 0 on other networks
  const balance = useCurrencyBalance(account ?? undefined, alchemistToken.token)
  if (!account) return 0
  if (long) return balance?.greaterThan('1') ? balance?.toFixed(4) : balance?.toFixed(0)
  const mistBalance = balance?.greaterThan('1')
    ? balance?.greaterThan('100')
      ? balance?.toFixed(0) // ex. 100
      : balance?.greaterThan('10')
      ? balance?.toFixed(1) // ex. 11.0
      : balance?.toFixed(2) // ex. 1.00
    : balance?.toSignificant(2) // ex. .00012
  return mistBalance
}
