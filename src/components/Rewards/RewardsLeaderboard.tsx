import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { rgba } from 'polished'
import { getRewards, Reward } from '../../api/rewards'
import { CloseIcon, ExternalLink } from 'theme'
import dayjs from 'dayjs'
import { getEtherscanLink } from 'utils'
import { ChainId } from '@alchemist-coin/mistx-core'
import { keccak256 } from '@ethersproject/keccak256'

const Wrapper = styled.div`
  background-color: ${({ theme }) => rgba(theme.bg1, 0.92)};
  height: 100%;
  left: 0;
  overflow: auto;
  padding: 2rem 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10;
`

const CloseButton = styled.button`
  background-color: transparent;
  border: 0;
  color: ${({ theme }) => theme.text1}
  padding: .5rem;
  position: absolute;
  top: 1rem;
  right: 1rem;
`

const Title = styled.h1`
  colors: ${({ theme }) => theme.text1};
  font-family: 'Press Start 2P', 'VT323', Arial;
  font-size: 2.75rem;
  margin-bottom: 2rem;
  text-align: center;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 2.25rem;
  `};
`

const LoadMoreButton = styled.button`
  background-color: transparent;
  border: 0;
  border-radius: 4px;
  color: ${({ theme }) => theme.text1};
  cursor: pointer;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 2.5rem;
  margin-top: 1.5rem;
  width: 100%;
`

const RewardsList = styled.ul`
  font-family: 'VT323', Arial;
  font-size: 1.75rem;
  margin: auto;
  max-width: 800px;
  padding: 1rem 0;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 1.25rem;
  `};
`

const RewardItem = styled.li`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

const RewardItemCell = styled.div`
  padding: 0.5rem 1rem;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 60px;
    padding: 0.375rem .5rem;
  `};
`

const RewardItemCellNumber = styled(RewardItemCell)`
  width: 80px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 40px;
  `};
`

const RewardItemCellDate = styled(RewardItemCell)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const RewardItemCellValue = styled(RewardItemCell)`
  flex: 1;
  text-align: center;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    text-align: right;
  `};
`

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const Loader = styled.div`
  margin: 1rem 0;
  text-align: center;
`

export default function RewardsLeaderboard({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [rewards, setRewards] = useState([] as any)

  const loadRewards = async () => {
    setLoading(true)
    try {
      const response = await getRewards()

      console.log('response', response)

      setRewards(response.data)
    } catch (e) {
      console.error('Error getting rewards', e)
    }
    setLoading(false)
  }

  async function loadMoreResults() {
    setLoading(true)
    try {
      const response = await getRewards({
        skip: rewards.length
      })

      console.log('response', response)

      setRewards([...rewards, ...response.data])
    } catch (e) {
      console.error('Error loading more rewards', e)
    }
    setLoading(false)
  }

  function handleClose() {
    onClose()
  }

  useEffect(() => {
    loadRewards()
  }, [])

  return (
    <Wrapper>
      <CloseButton>
        <CloseIcon onClick={handleClose} />
      </CloseButton>
      <Title>Top Rewards</Title>
      <RewardsList>
        {rewards.map((reward: Reward, index: number) => (
          <RewardItem key={reward._id}>
            <RewardItemCellNumber>{index + 1}.</RewardItemCellNumber>
            <RewardItemCellDate>
              <StyledExternalLink
                href={getEtherscanLink(
                  ChainId.MAINNET,
                  keccak256(reward.transactions[0].serializedOrigin),
                  'transaction'
                )}
              >
                {reward.transactions[0].timestamp
                  ? dayjs(reward.transactions[0].timestamp * 1000).format('YYYY-MM-DD')
                  : 'N/A'}
              </StyledExternalLink>
            </RewardItemCellDate>
            <RewardItemCell>
              <StyledExternalLink href={getEtherscanLink(ChainId.MAINNET, reward.from, 'address')}>
                {`${reward.from.substring(0, 8)}...${reward.from.substring(36)}`}
              </StyledExternalLink>
            </RewardItemCell>
            <RewardItemCellValue>
              <StyledExternalLink
                href={getEtherscanLink(
                  ChainId.MAINNET,
                  keccak256(reward.transactions[0].serializedBackrun),
                  'transaction'
                )}
              >
                {`${reward.totalValueETH.toFixed(4)}ETH ($${reward.totalValueUSD.toFixed(2)})`}
              </StyledExternalLink>
            </RewardItemCellValue>
          </RewardItem>
        ))}
        {loading ? (
          <Loader>...Loading Rewards</Loader>
        ) : (
          rewards.length > 0 && (
            <LoadMoreButton onClick={loadMoreResults} type="button">
              Load More Rewards
            </LoadMoreButton>
          )
        )}
      </RewardsList>
    </Wrapper>
  )
}
