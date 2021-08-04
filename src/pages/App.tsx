import React, { Suspense, useState } from 'react'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Polling from '../components/Header/Polling'
import ConnectionStatus from '../components/ConnectionStatus'
// import URLWarning from '../components/Header/URLWarning'
import Popups from '../components/Popups'
import NewAppVersionAvailable from '../components/NewAppVersionAvailable'
import EIP1559InfoModal from '../components/EIP1559InfoModal'
import Web3ReactManager from '../components/Web3ReactManager'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import Swap from './Swap'
import { RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
import SideBar from '../components/SideBar'
import Overlay from '../components/SideBar/overlay'
import { ChatWidget } from 'components/ChatWidget'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  overflow-x: hidden;
  min-height: 100vh;
  background-image: url(/images/bg.svg);
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 50px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px;
    padding-top: 2rem;
    padding-bottom: 6rem;
    margin-bottom: 72px;
  `};

  z-index: 1;
`

const ConnectionsWrapper = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    bottom: 72px;
  `};
`

export default function App() {
  const [sideBarOpen, setSideBarOpen] = useState<boolean>(false)

  const toggleSideBar = () => {
    setSideBarOpen(!sideBarOpen)
  }

  return (
    <Suspense fallback={null}>
      <Route component={GoogleAnalyticsReporter} />
      <Route component={DarkModeQueryParamReader} />
      <Overlay open={sideBarOpen} toggleSideBar={toggleSideBar} />
      <AppWrapper>
        {/* <URLWarning /> */}
        <SideBar open={sideBarOpen} toggleSideBar={toggleSideBar} />
        <HeaderWrapper>
          <Header toggleSideBar={toggleSideBar} />
        </HeaderWrapper>
        <BodyWrapper>
          <ConnectionsWrapper>
            <Polling />
            <ConnectionStatus />
          </ConnectionsWrapper>
          <Web3ReactManager>
            <Switch>
              <Route exact strict path="/exchange" component={Swap} />
              <Route exact strict path="/exchange/:outputCurrency" component={RedirectToSwap} />
              <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
              <Route component={RedirectPathToSwapOnly} />
            </Switch>
          </Web3ReactManager>
          <Footer style={{ marginTop: '2.5rem' }} />
        </BodyWrapper>
      </AppWrapper>
      <Popups />
      <EIP1559InfoModal />
      <NewAppVersionAvailable />
      <ChatWidget />
    </Suspense>
  )
}
