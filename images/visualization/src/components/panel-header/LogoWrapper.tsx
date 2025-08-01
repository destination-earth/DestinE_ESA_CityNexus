// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import styled from "styled-components";
import React, {useEffect} from 'react';
import {useSelector} from "react-redux";
import {
    selectIsProjectImmerseon,
} from "../../features/user/userSlice";

const StyledLogoWrapper = styled.div`
  display: flex;
  align-items: flex-start;
`;

const StyledLogoSvgWrapper = styled.div`
  margin-top: 3px;
`;

const LogoWrapper = () => {
  const isProjectImmerseon = useSelector(selectIsProjectImmerseon);

  useEffect(() => {}, [isProjectImmerseon]);

  return (
    <StyledLogoWrapper className="side-panel-logo">
        <StyledLogoSvgWrapper>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <img id="logo" alt="service-logo" height="28"
                     src={`desp/assets/solenix_logo.png`}
                     style={{paddingTop: 0, paddingBottom: '5px', paddingRight: '5px', paddingLeft: '5px'}}/>
                <img id="logo" alt="service-logo" height="28"
                     src={`desp/assets/mindearth_logo.png`}
                     style={{paddingTop: 0, paddingBottom: '5px', paddingRight: '5px', paddingLeft: '5px'}}/>
            </div>
        </StyledLogoSvgWrapper>
    </StyledLogoWrapper>
  );
};

export default LogoWrapper;
