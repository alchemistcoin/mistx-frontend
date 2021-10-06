import axios from 'axios'
import config from 'config/environment'

const baseUrl = config.ANALYTICS_API_URL

export const getGasUsedForPath = (path: string[]) => {
  if (!path.includes('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')) {
    path.splice(1, 0, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')
  }

  const pathString = path.join('-')
  return axios.get(`${baseUrl}/gas_used/${pathString}`)
}
