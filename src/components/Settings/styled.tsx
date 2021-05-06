// import React from 'react'
import styled from 'styled-components'

export const StyledMinerBribe = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;  

  > div {
    display: flex;
    padding: 0 0 0 1rem;
    min-width: 4rem;
    justify-content: flex-end;
  }

  input[type=range] {
    display: flex;
    flex-grow: 1;
    -webkit-appearance: none;
    width: 100%;
    background-color: transparent;
    -webkit-appearance: none;
    &:focus {
      outline: none;
    }
  }

input[type=range]::-webkit-slider-runnable-track {
  background: rgba(153, 153, 153, 0.78);
  border: 0.2px solid rgba(153, 153, 153, 0);
  border-radius: 1.3px;
  width: 100%;
  height: 8px;
  cursor: pointer;
}
input[type=range]::-webkit-slider-thumb {
  margin-top: -7.2px;
  width: 22px;
  height: 22px;
  background: #0e0f1e;
  border: 1.8px solid #0e0f1e;
  border-radius: 15px;
  cursor: pointer;
  -webkit-appearance: none;
}
input[type=range]:focus::-webkit-slider-runnable-track {
  background: #a6a6a6;
}
input[type=range]::-moz-range-track {
  background: rgba(153, 153, 153, 0.78);
  border: 0.2px solid rgba(153, 153, 153, 0);
  border-radius: 1.3px;
  width: 100%;
  height: 8px;
  cursor: pointer;
}
input[type=range]::-moz-range-thumb {
  width: 22px;
  height: 22px;
  background: #0e0f1e;
  border: 1.8px solid #0e0f1e;
  border-radius: 15px;
  cursor: pointer;
}
input[type=range]::-ms-track {
  background: transparent;
  border-color: transparent;
  border-width: 7.9px 0;
  color: transparent;
  width: 100%;
  height: 8px;
  cursor: pointer;
}
input[type=range]::-ms-fill-lower {
  background: #8c8c8c;
  border: 0.2px solid rgba(153, 153, 153, 0);
  border-radius: 2.6px;
}
input[type=range]::-ms-fill-upper {
  background: rgba(153, 153, 153, 0.78);
  border: 0.2px solid rgba(153, 153, 153, 0);
  border-radius: 2.6px;
}
input[type=range]::-ms-thumb {
  width: 22px;
  height: 22px;
  background: #0e0f1e;
  border: 1.8px solid #0e0f1e;
  border-radius: 15px;
  cursor: pointer;
  margin-top: 0px;
  /*Needed to keep the Edge thumb centred*/
}
input[type=range]:focus::-ms-fill-lower {
  background: rgba(153, 153, 153, 0.78);
}
input[type=range]:focus::-ms-fill-upper {
  background: #a6a6a6;
}
/*TODO: Use one of the selectors from https://stackoverflow.com/a/20541859/7077589 and figure out
how to remove the virtical space around the range input in IE*/
@supports (-ms-ime-align:auto) {
  /* Pre-Chromium Edge only styles, selector taken from hhttps://stackoverflow.com/a/32202953/7077589 */
  input[type=range] {
    margin: 0;
    /*Edge starts the margin from the thumb, not the track as other browsers do*/
  }
}


`