// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import {Icons} from "@kepler.gl/components";
import styled from "styled-components";
import classnames from "classnames";
import React from 'react';
import {USER_GUIDE_DOC} from "@kepler.gl/constants";
import {PanelAction} from "./PanelAction";
import {LoginPanelAction} from "../user/LoginPanelAction";
import {LogoWrapper} from "./LogoWrapper";

const BUG_REPORT_LINK = 'mailto:citynexus@solenix.ch'

const StyledPanelHeader = styled.div.attrs(props => ({
    className: classnames('side-side-panel__header', props.className)
}))`
  background-color: ${props => props.theme.sidePanelHeaderBg};
  padding: 12px 16px 0 16px;
`;

const StyledPanelHeaderTop = styled.div.attrs(props => ({
    className: classnames('side-panel__header__top', props.className)
}))`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  width: 100%;
`;

const StyledPanelTopActions = styled.div.attrs({
    className: 'side-panel__top__actions'
})`
  display: flex;
`;

type HeaderActionWrapperProps = {
    flush?: boolean;
    active?: boolean;
    hoverColor?: string | null;
    testId?: string;
};

const HeaderActionWrapper = styled.div.attrs((props: HeaderActionWrapperProps) => ({
    dataTestId: props.testId
}))<HeaderActionWrapperProps>`
  margin-left: 8px;
  display: flex;
  align-items: center;
    color: ${props =>
            props.active ? props.theme.panelHeaderIconActive : props.theme.panelHeaderIcon};
  cursor: pointer;
    
  :hover {
    color: ${props =>
    props.hoverColor ? props.theme[props.hoverColor] : props.theme.panelHeaderIconHover};
  }

  &.disabled {
    cursor: none;
    pointer-events: none;
    opacity: 0.3;
  }
`;

export function PanelHeader() {
    const items = [
        {
            id: 'bug',
            iconComponent: Icons.Bug,
            href: BUG_REPORT_LINK,
            blank: true,
            tooltip: 'Bug Report',
            onClick: () => {}
        }, {
            id: 'docs',
            iconComponent: Icons.Docs,
            href: USER_GUIDE_DOC,
            blank: true,
            tooltip: 'User Guide',
            onClick: () => {}
        }
    ]

    return (
        <StyledPanelHeader className="side-panel__panel-header">
            <StyledPanelHeaderTop className="side-panel__panel-header__top">
                <LogoWrapper/>
                <StyledPanelTopActions>
                    {items.map(item => (
                        <div
                            className="side-panel__panel-header__right"
                            key={item.id}
                            style={{position: 'relative'}}
                        >
                            <PanelAction item={item} />
                        </div>
                    ))}
                    <LoginPanelAction />
                </StyledPanelTopActions>
            </StyledPanelHeaderTop>
        </StyledPanelHeader>
    );
}
