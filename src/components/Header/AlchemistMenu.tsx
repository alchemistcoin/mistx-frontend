import React, { useState, useRef } from 'react'
import AlchemistMenuIcon from '../../assets/svg/alchemist-menu-icon.svg'
import CrucibleIcon from '../../assets/svg/crucible-icon.svg'
import CopperIcon from '../../assets/svg/copper-icon.svg'
import MistxIcon from '../../assets/svg/mistx-icon.svg'
import StyledAlchemistLinks, { StyledList, StyledListItem } from './AlchemistMenu.styled'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'

interface ListItemsProps {
  imageSrc: string
  title: string
  description: string
  link: string
}

const ListItem = ({ imageSrc, title, description, link }: ListItemsProps) => {
  return (
    <StyledListItem>
      <a href={link} target="_blank" rel="noreferrer">
        <img src={imageSrc} />
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 16 }}>
          <span className={'title'}>{title}</span>
          <span className={'description'}>{description}</span>
        </div>
      </a>
    </StyledListItem>
  )
}

const AlchemistMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const closeMenu = () => setIsOpen(false)
  const node = useRef<HTMLDivElement>()
  useOnClickOutside(node, isOpen ? closeMenu : undefined)

  return (
    <StyledAlchemistLinks
      onClick={() => {
        setIsOpen(!isOpen)
      }}
      ref={node as any}
    >
      <button>
        <img src={AlchemistMenuIcon} />
      </button>

      {isOpen && (
        <StyledList>
          <ListItem
            imageSrc={CrucibleIcon}
            title={'Crucible'}
            description={'Non-custodial staking platform'}
            link={'https://crucible.alchemist.wtf'}
          />
          <ListItem
            imageSrc={CopperIcon}
            title={'Copper'}
            description={'Token fair Launch Auctions'}
            link={'https://copperlaunch.com'}
          />
          <ListItem
            imageSrc={MistxIcon}
            title={'Mistx'}
            description={'First FlashDEX powered by Flashbots'}
            link={'https://mistx.io'}
          />
        </StyledList>
      )}
    </StyledAlchemistLinks>
  )
}

export default AlchemistMenu
