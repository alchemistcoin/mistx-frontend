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
import { Twitter } from 'react-feather'
import { Close } from 'components/Icons'

const Wrapper = styled.div`
  background-color: ${({ theme }) => rgba(theme.bg2, 0.92)};
  color: ${({ theme }) => theme.text1};
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
  display: flex;
  font-family: 'Press Start 2P', 'VT323', Arial;
  font-size: 2.75rem;
  justify-content: center;
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

const StyledExternalIconLink = styled(ExternalLink)`
  align-items: center;
  color: inherit;
  display: inline-flex;
  justify-content: center;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
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
  font-family: 'VT323', Arial;
  font-size: 1rem;
  font-weight: 500;
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

const CheckboxContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 0 auto;
  max-width: 720px;
  padding: 0 1rem;
`

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  // Hide checkbox visually but remain accessible to screen readers.
  // Source: https://polished.js.org/docs/#hidevisually
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`

const StyledCheckbox = styled.div<{ checked?: boolean }>`
  display: inline-block;
  width: 20px;
  height: 20px;
  background: ${({ checked, theme }) => (checked ? theme.text1 : 'transparent')};
  border-radius: 1px;
  border: 2px solid ${({ theme }) => theme.text1}
  margin-right: .5rem;
  transition: all 150ms;

  > svg > path {
    fill: ${({ theme }) => theme.bg2};
  }
`

const CheckboxLabel = styled.label`
  align-items: center;
  cursor: pointer;
  font-family: 'VT323', Arial;
  display: flex;
`

const prettyNumberString = (str: string) => {
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const getTweetText = ({
  myRewardsETH,
  myRewardsUSD,
  totalCount,
  totalRewardsUSD
}: {
  myRewardsETH?: number
  myRewardsUSD?: number
  totalCount: number
  totalRewardsUSD: number
}) => {
  if (myRewardsETH && myRewardsUSD) {
    return `I’ve earned $${prettyNumberString(myRewardsUSD.toFixed(0))} (${prettyNumberString(
      myRewardsETH.toFixed(3)
    )}ETH) instant cashback trading on mistX.io. A total of $${prettyNumberString(
      totalRewardsUSD.toFixed(2)
    )} has been paid out so far, will you be next? $mist ⚗️`
  }

  return `mistX.io gave me the opportunity to earn cashback on my trades. A total of $${prettyNumberString(
    totalRewardsUSD.toFixed(0)
  )} has been paid out so far, will you be next? $mist ⚗️`
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
  const [showAccountRewardsOnly, setShowAccountRewardsOnly] = useState(false)

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

  const loadRewards = async (account?: string) => {
    setLoading(true)
    try {
      const response = await getRewards({ account })

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

  function handleShowMyRewards() {
    setShowAccountRewardsOnly(!showAccountRewardsOnly)
  }

  useEffect(() => {
    if (showAccountRewardsOnly) {
      if (account) {
        loadRewards(account)
      }
    } else {
      loadRewards()
    }
  }, [account, showAccountRewardsOnly])

  useEffect(() => {
    loadTotals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Wrapper>
      <CloseButton>
        <CloseIcon onClick={handleClose} />
      </CloseButton>
      <Title>
        Top Rewards.
        {totalRewardsUSD && totalRewardsCount && (
          <StyledExternalIconLink
            className="twitter-share-button"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              getTweetText({ myRewardsETH, myRewardsUSD, totalRewardsUSD, totalCount: totalRewardsCount })
            )}`}
            style={{ margin: '0 .75rem' }}
          >
            <Twitter size={28} />
          </StyledExternalIconLink>
        )}
      </Title>
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
              </TotalLabel>
            </TotalContainer>
          </>
        )}
      </Totals>
      {account && (
        <CheckboxContainer>
          <CheckboxLabel>
            <HiddenCheckbox checked={showAccountRewardsOnly} onChange={handleShowMyRewards} />
            <StyledCheckbox checked={showAccountRewardsOnly}>{showAccountRewardsOnly && <Close />}</StyledCheckbox>
            <span>Show Only My Rewards</span>
          </CheckboxLabel>
        </CheckboxContainer>
      )}
      <RewardsList>
        {rewards.length > 0
          ? rewards.map((reward: Reward, index: number) => (
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
            ))
          : !loading && <Loader>There are no rewards here yet...</Loader>}
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
