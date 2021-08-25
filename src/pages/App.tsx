import React, { Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
import Web3ReactManager from '../components/Web3ReactManager'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import Index from './V2/index'
import { RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
import { theme } from '../theme-v2'
import { GlobalStyles } from '../theme-v2/global'

export default function App() {
  return (
    <Suspense fallback={null}>
      <Route component={GoogleAnalyticsReporter} />
      <Route component={DarkModeQueryParamReader} />
      <Web3ReactManager>
        <Switch>
          <ThemeProvider theme={theme()}>
            <GlobalStyles />
            <Route exact strict path="/" component={Index} />
          </ThemeProvider>
          <Route exact strict path="/exchange/:outputCurrency" component={RedirectToSwap} />
          <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
          <Route component={RedirectPathToSwapOnly} />
        </Switch>
      </Web3ReactManager>
    </Suspense>
  )
}
