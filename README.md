# MistX Interface V1

[![Netlify Status](https://api.netlify.com/api/v1/badges/0a896031-c171-4032-8b00-f0104c10005a/deploy-status)](https://app.netlify.com/sites/alchemist-mistx-0523/deploys)
[![Unit Tests](https://github.com/alchemistcoin/mistx-frontend/actions/workflows/unit-tests.yaml/badge.svg)](https://github.com/alchemistcoin/mistx-frontend/actions/workflows/unit-tests.yaml)
[![Lint](https://github.com/alchemistcoin/mistx-frontend/actions/actions/workflows/lint.yml/badge.svg)](https://github.com/alchemistcoin/mistx-frontend/actions/workflows/lint.yml)

An open source interface for MistX -- a protocol for decentralized exchange of Ethereum tokens.

- Website: [mistx.io](https://mistx.io/)
- Interface: [app.mistx.io](https://app.mistx.io)
- Docs: [docs.alchemist.wtf/mist](https://docs.alchemist.wtf/mist/)
- Twitter: [@_alchemistcoin_](https://twitter.com/_alchemistcoin)
- Reddit: [/r/alchemistcoin](https://www.reddit.com/r/alchemistcoin/)
- Email: [contact@alchemist.wtf](mailto:contact@alchemist.wtf)
- Discord: [Alchemist](https://discord.gg/4CEvN6ZBnt)

## Accessing the MistX Interface

To access the MistX Interface, visit [app.mistx.io](https://app.mistx.io).

## Listing a token

Please see the
[@alchemistcoin/default-token-list](https://github.com/alchemistcoin/default-token-list) 
repository.

## Development

### Install Dependencies

```bash
yarn
```

### Run

```bash
yarn start
```

### Configuring the environment (optional)

To have the interface default to a different network when a wallet is not connected:

1. Make a copy of `.env` named `.env.local`
2. Change `REACT_APP_NETWORK_ID` to `"{YOUR_NETWORK_ID}"`
3. Change `REACT_APP_NETWORK_URL` to e.g. `"https://{YOUR_NETWORK_ID}.infura.io/v3/{YOUR_INFURA_KEY}"` 

Note that the interface only works on testnets where both 
[Uniswap V2](https://uniswap.org/docs/v2/smart-contracts/factory/) and 
[multicall](https://github.com/makerdao/multicall) are deployed.
The interface will not work on other networks.

## Contributions

**Please open all pull requests against the `dev` branch.** 
CI checks will run against all PRs.
