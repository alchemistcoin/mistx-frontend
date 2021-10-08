import { useMemo } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import useETHPrice from './useEthPrice'
import useBaseFeePerGas from './useBaseFeePerGas'
import { Currency, CurrencyAmount, Token, Trade, TradeType, WETH } from '@alchemist-coin/mistx-core'
import { useActiveWeb3React } from 'hooks'
import { computeTradePriceBreakdown } from 'utils/prices'
import { useGasLimitForPath } from './useGasLimit'

export default function useTotalFeesForTrade(trade: Trade<Currency, Currency, TradeType>) {
  const { chainId } = useActiveWeb3React()
  const { realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const ethPrice = useETHPrice(trade.inputAmount.currency.wrapped)
  const { maxBaseFeePerGas, minBaseFeePerGas, baseFeePerGas } = useBaseFeePerGas()
  const gasLimit = useGasLimitForPath(trade.route.path.map((t: Token) => t.address))

  return useMemo(() => {
    let totalFeeInEth: CurrencyAmount<Currency> | undefined
    let maxTotalFeeInEth: CurrencyAmount<Currency> | undefined
    let maxBaseFeeInEth: CurrencyAmount<Currency> | undefined
    let minBaseFeeInEth: CurrencyAmount<Currency> | undefined
    let baseFeeInEth: CurrencyAmount<Currency> | undefined
    let realizedLPFeeInEth: CurrencyAmount<Currency> | undefined

    if (ethPrice && realizedLPFee) {
      realizedLPFeeInEth = ethPrice.quote(realizedLPFee?.wrapped)
      totalFeeInEth = realizedLPFeeInEth.add(trade.minerBribe)
      maxTotalFeeInEth = realizedLPFeeInEth.add(trade.minerBribe)

      if (maxBaseFeePerGas && minBaseFeePerGas) {
        maxBaseFeeInEth = CurrencyAmount.fromRawAmount(
          WETH[chainId || 1],
          BigNumber.from(gasLimit || trade.estimatedGas)
            .mul(maxBaseFeePerGas)
            .toString()
        )

        console.log('GAS LIMIT', gasLimit, trade.estimatedGas)
        minBaseFeeInEth = CurrencyAmount.fromRawAmount(
          WETH[chainId || 1],
          BigNumber.from(gasLimit || trade.estimatedGas)
            .mul(minBaseFeePerGas)
            .toString()
        )
        baseFeeInEth = CurrencyAmount.fromRawAmount(
          WETH[chainId || 1],
          BigNumber.from(gasLimit || trade.estimatedGas)
            .mul(BigNumber.from(baseFeePerGas))
            .toString()
        )
        totalFeeInEth = totalFeeInEth.add(baseFeeInEth) // add the base fee
        maxTotalFeeInEth = maxTotalFeeInEth.add(maxBaseFeeInEth) // add max base fee
      }
    }

    return {
      maxBaseFeeInEth,
      minBaseFeeInEth,
      baseFeeInEth,
      minerBribe: trade.minerBribe,
      realizedLPFeeInEth,
      maxTotalFeeInEth,
      totalFeeInEth
    }
  }, [
    gasLimit,
    maxBaseFeePerGas,
    minBaseFeePerGas,
    chainId,
    ethPrice,
    realizedLPFee,
    trade.estimatedGas,
    trade.minerBribe,
    baseFeePerGas
  ])
}
