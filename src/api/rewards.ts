import axios from 'axios'
import { IBackrunTransactionProcessed } from '@alchemist-coin/mistx-connect'
import config from '../config/environment'

const baseUrl = config.ANALYTICS_API_URL

const DEFAULT_LIMIT = 16
const DEFAULT_SKIP = 0

export interface Reward {
  bundleId: string
  completedAt: Date
  createdAt: Date
  from: string
  origin: string
  totalValueETH: number
  totalValueUSD: number
  transactions: IBackrunTransactionProcessed[]
  _id: string
}

export const getRewards = ({
  account,
  limit = DEFAULT_LIMIT,
  skip = DEFAULT_SKIP
}: { account?: string; limit?: number; skip?: number } = {}) => {
  const query: {
    address?: string
    limit: number
    skip: number
  } = {
    limit,
    skip
  }

  if (account) query.address = account

  return axios.get(`${baseUrl}/rewards`, {
    params: query
  })
}

export const getTotalRewards = (address?: string) => {
  const query = {
    address
  }

  return axios.get(`${baseUrl}/rewards/totals`, {
    params: query
  })
}
