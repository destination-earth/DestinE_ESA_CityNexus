// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import {Icons} from "@kepler.gl/components";
import styled from "styled-components";
import classnames from "classnames";
import React from 'react';
import {PanelAction} from "./PanelAction";
import {LoginPanelAction} from "../../features/user/LoginPanelAction";
import LogoWrapper from "./LogoWrapper";

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
            href: "https://platform.destine.eu/services/documents-and-api/doc/?service_name=citynexus",
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
