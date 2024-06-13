// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import styled from "styled-components";
import Logo from "./citynexus_logo.svg";
import React from 'react';

const StyledLogoWrapper = styled.div`
  display: flex;
  align-items: flex-start;
`;

const StyledLogoSvgWrapper = styled.div`
  margin-top: 3px;
`;

export function LogoWrapper() {
    return (
        <StyledLogoWrapper className="side-panel-logo">
            <StyledLogoSvgWrapper>
                <Logo />
            </StyledLogoSvgWrapper>
        </StyledLogoWrapper>
    )
}
