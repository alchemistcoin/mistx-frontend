import axios, { AxiosResponse } from 'axios'
import config from 'config/environment'

interface GasUsed {
  gasUsed: number
}

const baseUrl = config.ANALYTICS_API_URL

export const getGasUsedForPath = (path: string[]): Promise<AxiosResponse<GasUsed>> => {
  if (!path.includes('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')) {
    path.splice(1, 0, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')
  }

  const pathString = path.join('-')
  return axios.get<GasUsed>(`${baseUrl}/gas_used/${pathString}`)
}
