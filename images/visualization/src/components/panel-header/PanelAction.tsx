// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import React, {useCallback} from "react";
import {Tooltip} from "@kepler.gl/components";
import {FormattedMessage} from "kepler.gl/src/localization";
import styled from "styled-components";

type StyledPanelActionProps = {
    active?: boolean;
};

const StyledPanelAction = styled.div.attrs({
    className: 'side-panel__panel-header__action'
})<StyledPanelActionProps>`
  align-items: center;
  border-radius: 2px;
  color: ${props => (props.active ? props.theme.textColorHl : props.theme.subtextColor)};
  display: flex;
  height: 26px;
  justify-content: space-between;
  margin-left: 4px;
  padding: 5px;
  font-weight: bold;
  p {
    display: inline-block;
    margin-right: 6px;
  }
  a {
    height: 20px;
  }

  :hover {
    cursor: pointer;
    color: ${props => props.theme.textColorHl};

    a {
      color: ${props => props.theme.textColorHl};
    }
  }
`;

export function PanelAction(props) {
    const {item, showExportDropdown} = props;
    const onClick = useCallback(() => {
        if (item.dropdownComponent) {
            showExportDropdown(item.id);
        } else {
            item.onClick && item.onClick();
        }
    }, [item, showExportDropdown]);

    return (
        <StyledPanelAction
            id={`${item.id}-action`}
            data-tip
            data-for={`${item.id}-action`}
            onClick={onClick}
        >
            {item.label ? <p>{item.label}</p> : null}
            <a target={item.blank ? '_blank' : ''} href={item.href} rel="noreferrer">
                <item.iconComponent height="20px" {...item.iconComponentProps} />
            </a>
            {item.tooltip ? (
                <Tooltip id={`${item.id}-action`} place="bottom" delayShow={500} effect="solid">
                    <FormattedMessage id={item.tooltip} />
                </Tooltip>
            ) : null}
        </StyledPanelAction>
    );
}
