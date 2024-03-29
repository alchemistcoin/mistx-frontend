import React, { useContext, useRef, useState } from 'react'
import { X } from 'react-feather'
import { Text } from 'rebass'
import { useDispatch } from 'react-redux'
import { lighten, rem, darken } from 'polished'
import styled, { ThemeContext } from 'styled-components'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { updateFeeDisplayCurrency } from '../../state/user/actions'
import { useUserBribeMargin } from '../../state/user/hooks'
import { TipSettingsSteps, tipSettingToValue, tipValueToSetting } from '../../state/user/reducer'
import { useModalOpen, useToggleSettingsMenu } from '../../state/application/hooks'
import {
  useExpertModeManager,
  useUserTransactionTTL,
  useUserSlippageTolerance,
  useUserSingleHopOnly
} from '../../state/user/hooks'
import { TYPE } from '../../theme'
// components
import { SettingsHeader, SettingsHeaderEnd } from '../shared/header/styled'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'
import Toggle from '../Toggle'
import MinerBribeSlider from './MinerBribeSlider'
import TransactionSettings from '../TransactionSettings'
import { Cog, Close } from '../Icons'
import useFeeDisplayCurrency from '../../hooks/useFeeDisplayCurrency'
import FATHOM_GOALS from '../../constants/fathom'

const StyledCloseIcon = styled(X)`
  height: 20px;
  width: 20px;

  :hover {
    cursor: pointer;
  }
`

const StyledMenuButton = styled.button`
  align-items: center;
  position: relative;
  border: 1px solid ${({ theme }) => theme.primary2};
  background-color: transparent;
  display: flex;
  justify-content: center;
  margin: 0;
  padding: 0;
  width: ${rem(36)};
  height: ${rem(36)};
  border-radius: 100%;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    border: 1px solid ${({ theme }) => lighten(0.1, theme.primary2)};
  }
`

const StyledMenuIcon = styled.div`
  display: flex;
  align-items: center;

  svg {
    display: flex;
    width: ${rem(24)};
    height: ${rem(24)};

    path {
      fill: ${({ theme }) => theme.primary2};
    }
  }
`

const EmojiWrapper = styled.div`
  position: absolute;
  bottom: -6px;
  right: 0px;
  font-size: 14px;
`

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

const MenuFlyout = styled.span`
  min-width: ${rem(428)};
  background-color: ${({ theme }) => theme.bg5};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.1), 0px 4px 8px rgba(0, 0, 0, 0.1), 0px 16px 24px rgba(0, 0, 0, 0.1),
    0px 24px 32px rgba(0, 0, 0, 0.1);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 58px;
  right: 0rem;
  z-index: 100;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    top: 52px;
    right: 0;
    left: 0;
    min-width: auto;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    left: 0;
    max-height: 110%;
    min-width: auto;
    overflow-x: hidden;
    overflow-y: auto;
    right: 0;
    top: 52px;
  `};
`

const Break = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg3};
`

const ModalContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 0 2rem 0;
  background-color: ${({ theme }) => theme.bg2};
  border-radius: 20px;
`
const SettingWrapper = styled.div<{ darkBg?: boolean }>`
  padding: 1.5rem 1.5rem;
  background-color: ${({ theme, darkBg }) => darkBg && '#232E3B'};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 1.5rem 1rem;
  `}
`

const StyledRowFixed = styled(RowFixed)`
  width: 100%;
`

const ToggleButton = styled.button<{ active: boolean }>`
  color: ${({ theme }) => theme.text1};
  align-items: center;
  height: 2rem;
  border-radius: 8px;
  font-size: 1rem;
  width: auto;
  min-width: 3.5rem;
  border: 1px solid ${({ theme }) => theme.primary2};
  outline: none;
  background: transparent;
  font-weight: 600;
  background: transparent;
  cursor: pointer;
  color: ${({ theme }) => theme.text1};

  ${({ active, theme }) =>
    active &&
    `
      background: ${theme.primary2};
      color: ${theme.text5};
  `}

  &:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 0;
  }

  &:last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  :hover {
    border-color: solid ${({ theme }) => darken(0.1, theme.primary2)};
  }
  :focus {
    background: ${({ theme }) => darken(0.1, theme.primary2)};
  }
`

function SettingsMenu({ toggle }: { toggle: () => void }) {
  const dispatch = useDispatch()
  const node = useRef<HTMLDivElement>()
  const [userBribeMargin, setUserBribeMargin] = useUserBribeMargin()
  const [stateBribeMargin, setStateBribeMargin] = useState<number>(userBribeMargin)
  const theme = useContext(ThemeContext)
  const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance()
  const [stateUserSlippage, setStateUserSlippage] = useState<number>(userSlippageTolerance)
  const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly()
  const [stateSingleHopOnly, setStateSingleHopOnly] = useState<boolean>(singleHopOnly)

  const onTipChange = (setting: number) => {
    setStateBribeMargin(tipSettingToValue(setting))
  }
  const [ttl, setTtl] = useUserTransactionTTL()

  const saveState = () => {
    setUserBribeMargin(stateBribeMargin, userBribeMargin)
    setUserslippageTolerance(stateUserSlippage, userSlippageTolerance)
    setSingleHopOnly(stateSingleHopOnly)
  }

  const handleToggle = () => {
    saveState()
    toggle()
  }

  useOnClickOutside(node, handleToggle)

  const feeDisplayCurrency = useFeeDisplayCurrency()

  return (
    <MenuFlyout ref={node as any}>
      <AutoColumn gap="md">
        <SettingWrapper>
          <StyledRowFixed>
            <SettingsHeader>
              <Text fontWeight={600} fontSize={20}>
                MistX Protection
                <QuestionHelper text="Represents a fee sent to the miner to include your transaction privately and a fee sent to Alchemist for providing mistX protection services. Higher tips are more likely to be accepted." />
              </Text>
              <SettingsHeaderEnd>
                <ToggleButton
                  onClick={() => dispatch(updateFeeDisplayCurrency('USD'))}
                  active={feeDisplayCurrency === 'USD'}
                >
                  USD
                </ToggleButton>
                <ToggleButton
                  onClick={() => dispatch(updateFeeDisplayCurrency('ETH'))}
                  active={feeDisplayCurrency === 'ETH'}
                >
                  ETH
                </ToggleButton>
              </SettingsHeaderEnd>
            </SettingsHeader>
          </StyledRowFixed>
          <MinerBribeSlider
            value={tipValueToSetting(stateBribeMargin)}
            steps={TipSettingsSteps}
            onChange={onTipChange}
          />
        </SettingWrapper>
        <SettingWrapper darkBg>
          <SettingsHeader>
            <Text fontWeight={600} fontSize={20}>
              Transaction Settings
            </Text>
          </SettingsHeader>
          <TransactionSettings
            rawSlippage={stateUserSlippage}
            setRawSlippage={setStateUserSlippage}
            deadline={ttl}
            setDeadline={setTtl}
          />
        </SettingWrapper>
        <SettingWrapper>
          <SettingsHeader>
            <Text fontWeight={600} fontSize={20}>
              Interface Settings
            </Text>
          </SettingsHeader>
          <RowBetween flexDirection="column">
            <StyledRowFixed>
              <TYPE.black fontWeight={400} fontSize={16} color={theme.text1}>
                DISABLE MULTIHOPS
              </TYPE.black>
              <QuestionHelper text="Restricts swaps to direct pairs only." />
            </StyledRowFixed>
            <StyledRowFixed marginTop="0.5rem">
              <Toggle
                id="toggle-disable-multihop-button"
                isActive={stateSingleHopOnly}
                toggle={() => {
                  // TODO: replace will alternative tracking
                  // ReactGA.event({
                  //   category: 'Routing',
                  //   action: singleHopOnly ? 'disable single hop' : 'enable single hop'
                  // })
                  setStateSingleHopOnly(!stateSingleHopOnly)
                }}
              />
            </StyledRowFixed>
          </RowBetween>
        </SettingWrapper>
      </AutoColumn>
    </MenuFlyout>
  )
}

export default function Settings() {
  const open = useModalOpen(ApplicationModal.SETTINGS)
  const toggle = useToggleSettingsMenu()
  const [expertMode, toggleExpertMode] = useExpertModeManager()
  // show confirmation view before turning on
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleDismiss = () => {
    setShowConfirmation(false)
  }

  const handleMenuButton = () => {
    if (!open) {
      toggle()
      if (window.fathom) {
        window.fathom.trackGoal(FATHOM_GOALS.SETTINGS_OPENED, 0)
      }
    }
  }

  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
  return (
    <>
      <StyledMenu>
        <Modal isOpen={showConfirmation} onDismiss={handleDismiss} maxHeight={100}>
          <ModalContentWrapper>
            <AutoColumn gap="lg">
              <RowBetween style={{ padding: '0 2rem' }}>
                <Text fontWeight={500} fontSize={24}>
                  Are you sure?
                </Text>
                <StyledCloseIcon onClick={() => setShowConfirmation(false)} />
              </RowBetween>
              <Break />
              <AutoColumn gap="lg" style={{ padding: '0 2rem' }}>
                <Text fontWeight={500} fontSize={20}>
                  Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result
                  in bad rates and lost funds.
                </Text>
                <Text fontWeight={600} fontSize={20}>
                  ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.
                </Text>
                <ButtonError
                  error={true}
                  padding={'12px'}
                  onClick={() => {
                    if (window.prompt(`Please type the word "confirm" to enable expert mode.`) === 'confirm') {
                      toggleExpertMode()
                      setShowConfirmation(false)
                    }
                  }}
                >
                  <Text fontSize={20} fontWeight={500} id="confirm-expert-mode">
                    Turn On Expert Mode
                  </Text>
                </ButtonError>
              </AutoColumn>
            </AutoColumn>
          </ModalContentWrapper>
        </Modal>
        <StyledMenuButton onClick={handleMenuButton} id="open-settings-dialog-button">
          <StyledMenuIcon>{open ? <Close /> : <Cog />}</StyledMenuIcon>
          {expertMode ? (
            <EmojiWrapper>
              <span role="img" aria-label="wizard-icon">
                🧙
              </span>
            </EmojiWrapper>
          ) : null}
        </StyledMenuButton>
      </StyledMenu>
      {open && <SettingsMenu toggle={toggle} />}
    </>
  )
}
