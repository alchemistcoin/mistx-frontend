import React, { Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import { transparentize } from 'polished'

import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Polling from '../components/Header/Polling'
// import URLWarning from '../components/Header/URLWarning'
import Popups from '../components/Popups'
import Web3ReactManager from '../components/Web3ReactManager'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import Swap from './Swap'
import { RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
import { ToastContainer } from 'react-toastify'

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
  `};

  z-index: 1;
`

const Marginer = styled.div`
  margin-top: 5rem;
`

const StyledToastContainer = styled(ToastContainer).attrs({
  // custom props
})`
  .Toastify__toast-container {}
  .Toastify__toast {
    background-color: ${({ theme }) => theme.bg5}
    box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(0.95, theme.shadow1)};
    border-top: 2px solid ${({ theme }) => theme.primary2};
    border-radius: 0 0 .5rem .5rem;

    &:not(:last-child) {
      opacity: .5;
    }
  }
  .Toastify__toast--error {
    border-top: 2px solid ${({ theme }) => theme.red1};
  }
  .Toastify__toast--warning {
    border-top: 2px solid ${({ theme }) => theme.red3};
  }
  .Toastify__toast--success {
    border-top: 2px solid ${({ theme }) => theme.green1};
  }
  .Toastify__toast-body {}
  .Toastify__progress-bar {}
`;

export default function App() {
  return (
    <Suspense fallback={null}>
      <Route component={GoogleAnalyticsReporter} />
      <Route component={DarkModeQueryParamReader} />
      <AppWrapper>
        {/* <URLWarning /> */}
        <HeaderWrapper>
          <Header />
        </HeaderWrapper>
        <BodyWrapper>
          <Popups />
          <Polling />
          <Web3ReactManager>
            <Switch>
              <Route exact strict path="/exchange" component={Swap} />
              <Route exact strict path="/exchange/:outputCurrency" component={RedirectToSwap} />
              <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
              <Route component={RedirectPathToSwapOnly} />
            </Switch>
          </Web3ReactManager>
          <Marginer />
          <Footer />
        </BodyWrapper>
      </AppWrapper>
      <StyledToastContainer
        autoClose={3000}
        closeOnClick
        draggablePercent={20}
        position="bottom-right"
        hideProgressBar
      />
    </Suspense>
  )
}
