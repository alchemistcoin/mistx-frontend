import React, { useContext, useRef, useState } from 'react'
import { X } from 'react-feather'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import { lighten, rem } from 'polished'
import styled, { ThemeContext } from 'styled-components'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleSettingsMenu } from '../../state/application/hooks'
import {
  useExpertModeManager,
  useUserTransactionTTL,
  useUserSlippageTolerance,
  useUserSingleHopOnly
} from '../../state/user/hooks'
import { TYPE } from '../../theme'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'
import Toggle from '../Toggle'
import MinerBribeSlider from './MinerBribeSlider'
import TransactionSettings from '../TransactionSettings'
import { Cog, Close } from '../Icons'

const StyledCloseIcon = styled(X)`
  height: 20px;
  width: 20px;

  :hover {
    cursor: pointer;
  }

  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

const StyledMenuButton = styled.button`
  align-items: center;
  position: relative;
  border: 2px solid ${({ theme }) => theme.primary2};
  background-color: transparent;
  display: flex;
  justify-content: center;
  margin: 0;
  padding: 0;
  width: ${rem(36)};
  height: ${rem(36)};
  padding: 0.3rem;
  border-radius: 100%;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    border: 2px solid ${({ theme }) => lighten(0.1, theme.primary2)};
  }
`

const StyledMenuIcon = styled.div`
  width: ${rem(36)};
  height: ${rem(36)};

  svg {
    width: 100%;
    height: 100%;

    > * {
      stroke: ${({ theme }) => theme.primary2};
    }
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
`

const SettingsHeader = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  margin: 0 0 1.5rem;
  color: ${({ theme }) => theme.text1};
  align-items: center;
  justify-content: space-between;

  &:before {
    position: absolute;
    left: -1.5rem;
    top: 3px;
    height: 24px;
    width: 2px;
    content: '';
    background-color: ${({ theme }) => theme.primary2};
  }
`

const StyledRowFixed = styled(RowFixed)`
  width: 100%;
`

export default function SettingsTab() {
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.SETTINGS)
  const toggle = useToggleSettingsMenu()

  const theme = useContext(ThemeContext)
  const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance()

  const [ttl, setTtl] = useUserTransactionTTL()

  const [expertMode, toggleExpertMode] = useExpertModeManager()

  const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly()

  // show confirmation view before turning on
  const [showConfirmation, setShowConfirmation] = useState(false)

  useOnClickOutside(node, open ? toggle : undefined)

  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
  return (
    <>
      <StyledMenu>
        <Modal isOpen={showConfirmation} onDismiss={() => setShowConfirmation(false)} maxHeight={100}>
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
        <StyledMenuButton onClick={toggle} id="open-settings-dialog-button">
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
      {open && (
        <MenuFlyout ref={node as any}>
          <AutoColumn gap="md">
            <SettingWrapper>
              <StyledRowFixed>
                <SettingsHeader>
                  <Text fontWeight={600} fontSize={20}>
                    Miner Bribe Margin
                  </Text>
                  <QuestionHelper text="Lorem ipsum" />
                </SettingsHeader>
              </StyledRowFixed>
              <MinerBribeSlider />
            </SettingWrapper>
            <SettingWrapper darkBg>
              <SettingsHeader>
                <Text fontWeight={600} fontSize={20}>
                  Transaction Settings
                </Text>
              </SettingsHeader>
              <TransactionSettings
                rawSlippage={userSlippageTolerance}
                setRawSlippage={setUserslippageTolerance}
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
                    isActive={singleHopOnly}
                    toggle={() => {
                      ReactGA.event({
                        category: 'Routing',
                        action: singleHopOnly ? 'disable single hop' : 'enable single hop'
                      })
                      setSingleHopOnly(!singleHopOnly)
                    }}
                  />
                </StyledRowFixed>
              </RowBetween>
            </SettingWrapper>
          </AutoColumn>
        </MenuFlyout>
      )}
    </>
  )
}
