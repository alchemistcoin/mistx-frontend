import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { rgba } from 'polished'
import { getRewards, getTotalRewards, Reward } from '../../api/rewards'
import { CloseIcon, ExternalLink } from 'theme'
import dayjs from 'dayjs'
import { getEtherscanLink } from 'utils'
import { ChainId } from '@alchemist-coin/mistx-core'
import { keccak256 } from '@ethersproject/keccak256'
import { useActiveWeb3React } from 'hooks'
import { Share } from 'react-feather'

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

const Totals = styled.ul`
  display: flex;
  justify-content: space-around;
  list-style-type: none;
  margin: auto;
  max-width: 960px;
  padding: 0 1rem;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    flex-wrap: wrap;
  `};
`

const TotalContainer = styled.li`
  width: 20%;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 40%;
  `};
`

const Total = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 112px;
  justify-content: center;
  padding: 1rem;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 0;
    height: 68px;
  `};
`

const TotalReward = styled.div`
  font-family: 'Press Start 2P', 'VT323', Arial;
  text-align: center;
`

const TotalCount = styled(TotalReward)`
  font-size: 2rem;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 1.5rem;
  `};
`

const ETHReward = styled(TotalReward)`
  font-size: 1.25rem;
  margin-bottom: 1rem;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 1rem;
    margin-bottom: .5rem;
  `};
`

const USDReward = styled(TotalReward)`
  font-size: 1rem;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: .75rem;
  `};
`

const TotalLabel = styled.h5`
  align-items: center;
  border-top: 4px solid rgba(255, 255, 255, 0.3);
  display: flex;
  font-size: 0.75rem;
  font-weight: 600;
  justify-content: space-between;
  margin: 0 0 2rem;
  padding-left: 0.75rem;
  padding-top: 0.75rem;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-bottom: 1rem;
    padding-left: .25rem;
    padding-top: .5rem;
  `};
`

const LoaderTotal = styled.div`
  align-items: center;
  display: flex;
  font-family: 'VT323', Arial;
  font-size: 1rem;
  justify-content: center;
`

const prettyNumberString = (str: string) => {
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export default function RewardsLeaderboard({ onClose }: { onClose: () => void }) {
  const { account } = useActiveWeb3React()
  const [loading, setLoading] = useState(false)
  const [loadingTotals, setLoadingTotals] = useState(false)
  const [rewards, setRewards] = useState([] as any)
  const [totalRewardsCount, setTotalRewardsCount] = useState<number | undefined>()
  const [totalRewardsETH, setTotalRewardsETH] = useState<number | undefined>()
  const [totalRewardsUSD, setTotalRewardsUSD] = useState<number | undefined>()
  const [myRewardsCount, setMyRewardsCount] = useState<number | undefined>()
  const [myRewardsETH, setMyRewardsETH] = useState<number | undefined>()
  const [myRewardsUSD, setMyRewardsUSD] = useState<number | undefined>()

  const loadTotals = async () => {
    setLoadingTotals(true)
    try {
      const promises = [getTotalRewards()]
      if (account) promises.push(getTotalRewards(account))

      const [totalRewards, myRewards] = await Promise.all(promises)

      setTotalRewardsCount(totalRewards.data.count)
      setTotalRewardsETH(totalRewards.data.totals.totalValueETH)
      setTotalRewardsUSD(totalRewards.data.totals.totalValueUSD)

      if (myRewards) {
        setMyRewardsCount(myRewards.data.count)
        setMyRewardsETH(myRewards.data.totals.totalValueETH)
        setMyRewardsUSD(myRewards.data.totals.totalValueUSD)
      }
      console.log('total rewards', totalRewards, myRewards)
    } catch (e) {
      console.error('Error getting rewards', e)
    }
    setLoadingTotals(false)
  }

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

  useEffect(() => {
    loadTotals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Wrapper>
      <CloseButton>
        <CloseIcon onClick={handleClose} />
      </CloseButton>
      <Title>Top Rewards</Title>
      <Totals>
        <TotalContainer>
          <Total>
            {loadingTotals ? (
              <LoaderTotal>Loading...</LoaderTotal>
            ) : (
              <TotalCount>{prettyNumberString(totalRewardsCount?.toString() || '0')}</TotalCount>
            )}
          </Total>
          <TotalLabel>
            # Total Swaps
            <br />
            With Rewards
          </TotalLabel>
        </TotalContainer>
        <TotalContainer>
          <Total>
            {loadingTotals ? (
              <LoaderTotal>Loading...</LoaderTotal>
            ) : (
              <>
                {totalRewardsETH && <ETHReward>{totalRewardsETH.toFixed(3)}ETH</ETHReward>}
                {totalRewardsUSD && <USDReward>${prettyNumberString(totalRewardsUSD.toFixed(2) || '0')}</USDReward>}
              </>
            )}
          </Total>
          <TotalLabel>
            Total Rewards
            <br />
            Distributed
          </TotalLabel>
        </TotalContainer>
        {account && (
          <>
            <TotalContainer>
              <Total>
                {loadingTotals ? (
                  <LoaderTotal>Loading...</LoaderTotal>
                ) : (
                  <TotalCount>{prettyNumberString(myRewardsCount?.toString() || '0')}</TotalCount>
                )}
              </Total>
              <TotalLabel>
                {`# Times I've`}
                <br />
                Been Rewarded
              </TotalLabel>
            </TotalContainer>
            <TotalContainer>
              <Total>
                {loadingTotals ? (
                  <LoaderTotal>Loading...</LoaderTotal>
                ) : (
                  <>
                    <ETHReward>{myRewardsETH?.toFixed(3) || 0}ETH</ETHReward>
                    <USDReward>${prettyNumberString(myRewardsUSD?.toFixed(2) || '0')}</USDReward>
                  </>
                )}
              </Total>
              <TotalLabel>
                <span>
                  My Total
                  <br />
                  Rewards
                </span>
                {myRewardsETH && myRewardsETH > 0 && (
                  <StyledExternalLink
                    className="twitter-share-button"
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `I've received ${prettyNumberString(myRewardsETH?.toFixed(3) || '0')}ETH ($${prettyNumberString(
                        myRewardsUSD?.toFixed(2) || '0'
                      )}) in total rewards trading on https://app.mistx.io!`
                    )}`}
                  >
                    <Share size={16} />
                  </StyledExternalLink>
                )}
              </TotalLabel>
            </TotalContainer>
          </>
        )}
      </Totals>
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
