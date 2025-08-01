// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import classnames from 'classnames';
import styled from 'styled-components';
import {
  LayerPanelHeaderActionSectionFactory, LayerPanelHeaderProps,
  PanelHeaderActionFactory
} from "@kepler.gl/components";
import {ArrowDown, Copy, EyeSeen, EyeUnseen, Reset, Trash} from "@kepler.gl/components/dist/common/icons";
import React from 'react';

type HeaderActionSectionProps = {
  isEditingLabel: boolean;
};

export type LayerPanelHeaderActionSectionProps = LayerPanelHeaderProps & HeaderActionSectionProps;

export const defaultProps = {
  isDragNDropEnabled: true,
};

const HeaderActionSection = styled.div<HeaderActionSectionProps>`
  display: flex;
  position: absolute;
  height: 100%;
  align-items: stretch;
  right: 10px;
  pointer-events: ${props => (props.isEditingLabel ? 'none' : 'all')};
  :hover {
    .layer-panel__header__actions__hidden {
      opacity: 1;
      background-color: ${props => props.theme.panelBackgroundHover};
    }
  }
`;

type StyledPanelHeaderHiddenActionsProps = {
  isConfigActive: LayerPanelHeaderProps['isConfigActive'];
};

const StyledPanelHeaderHiddenActions = styled.div.attrs({
  className: 'layer-panel__header__actions__hidden'
})<StyledPanelHeaderHiddenActionsProps>`
  opacity: 0;
  display: flex;
  align-items: center;
  background-color: ${props =>
    props.isConfigActive ? props.theme.panelBackgroundHover : props.theme.panelBackground};
  transition: opacity 0.4s ease, background-color 0.4s ease;

  :hover {
    opacity: 1;
  }
`;

const defaultActionIcons = {
  remove: Trash,
  visible: EyeSeen,
  hidden: EyeUnseen,
  enableConfig: ArrowDown,
  duplicate: Copy,
  resetIsValid: Reset
};

CustomLayerPanelHeaderActionSectionFactory.deps = [PanelHeaderActionFactory];

export function CustomLayerPanelHeaderActionSectionFactory(
  PanelHeaderAction: ReturnType<typeof PanelHeaderActionFactory>
) {
  const LayerPanelHeaderActionSection: React.FC<LayerPanelHeaderActionSectionProps> = (
    props: LayerPanelHeaderActionSectionProps
  ) => {
    const {
      isConfigActive,
      isVisible,
      isValid,
      layerId,
      onToggleVisibility,
      onResetIsValid,
      onToggleEnableConfig,
      isEditingLabel,
      actionIcons = defaultActionIcons
    } = props;
    return (
      <HeaderActionSection className="layer-panel__header__actions" isEditingLabel={isEditingLabel}>
        {isValid ? (
          <PanelHeaderAction
            className="layer__visibility-toggle"
            id={layerId}
            tooltip={isVisible ? 'tooltip.hideLayer' : 'tooltip.showLayer'}
            onClick={onToggleVisibility}
            IconComponent={isVisible ? actionIcons.visible : actionIcons.hidden}
          />
        ) : (
          <PanelHeaderAction
            className="layer__is-valid-refresh"
            id={layerId}
            tooltip={'tooltip.resetAfterError'}
            onClick={onResetIsValid}
            IconComponent={actionIcons.resetIsValid}
          />
        )}

        <PanelHeaderAction
          className={classnames('layer__enable-config ', {
            'is-open': isConfigActive
          })}
          id={layerId}
          tooltip={'tooltip.layerSettings'}
          onClick={onToggleEnableConfig}
          IconComponent={actionIcons.enableConfig}
        />
      </HeaderActionSection>
    );
  };

  return LayerPanelHeaderActionSection;
}

export function replaceLayerPanelHeaderActionSection() {
    return [LayerPanelHeaderActionSectionFactory, CustomLayerPanelHeaderActionSectionFactory];
}
