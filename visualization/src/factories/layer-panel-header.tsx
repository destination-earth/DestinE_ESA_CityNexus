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
  showRemoveLayer: true
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
      allowDuplicate,
      isVisible,
      isValid,
      layerId,
      onToggleVisibility,
      onResetIsValid,
      onToggleEnableConfig,
      onDuplicateLayer,
      onRemoveLayer,
      showRemoveLayer,
      isEditingLabel,
      // TODO: may not contain all necessary icons for all actions, e.g. actionIcons.duplicate. Need to to merge rather than replace
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
