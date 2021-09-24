import axios from 'axios'

const baseUrl = process.env.REACT_APP_ANALYTICS_API_URL || 'http://localhost:3002'

const DEFAULT_LIMIT = 12
const DEFAULT_SKIP = 0

export interface Reward {
  bundleId: string
  completedAt: Date
  createdAt: Date
  from: string
  origin: string
  totalValueETH: number
  totalValueUSD: number
  transactions: any[]
  _id: string
}

export const getRewards = ({ limit = DEFAULT_LIMIT, skip = DEFAULT_SKIP }: { limit?: number; skip?: number } = {}) => {
  const query = {
    limit,
    skip
  }

  return axios.get(`${baseUrl}/rewards`, {
    params: query
  })
}
