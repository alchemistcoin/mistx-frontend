import styled from 'styled-components'

const StyledAlchemistLinks = styled.div`
  color: #190134;
  display: flex;
  align-items: center;
  margin: 0 20px 0 0;

  button {
    padding: 0;
    margin: 0;
    background: none;
    border: none;
    cursor: pointer;
    vertical-align: middle;
    margin-right: 4px;
    line-height: 10px;
    @media only screen and (max-width: 600px) {
      line-height: 8px;
    }
  }
`

export const StyledList = styled.ul`
  list-style-type: none;
  padding: 10px;
  position: absolute;
  width: 331px;
  left: 20px;
  top: 70px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #293745;
  box-shadow: 0px 0px 10px 2px rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  z-index: 9;
  ${({ theme }) => theme.mediaWidth.upToMedium`
      left: 0;
  `}
`

export const StyledListItem = styled.li`
  width: 100%;
  a {
    display: flex;
    width: 100%;
    height: 69px;
    padding: 0px 14px;
    justify-content: flex-start;
    align-items: center;
    border-radius: 8px;
    color: #fff;
    text-decoration: none;
  }
  &:hover {
    background-color: #242d3d;
  }
  img {
    flex: 0;
    height: 40px;
  }
  .title {
    font-size: 16px;
    line-height: 24px;
  }
  .description {
    font-weight: normal;
    font-size: 12px;
    line-height: 18px;
  }
`

export default StyledAlchemistLinks
