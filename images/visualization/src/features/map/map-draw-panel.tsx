// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import React, {useCallback, useEffect} from 'react';
import classnames from 'classnames';

import {EDITOR_MODES} from '@kepler.gl/constants';
import {
    MapControlButton,
    MapControlToolbarFactory,
    MapControlTooltipFactory,
    MapDrawPanelFactory, MapDrawPanelProps,
    ToolbarItem
} from "@kepler.gl/components";
import {CursorClick, DrawPolygon, EyeSeen, EyeUnseen, Polygon, Rectangle} from "@kepler.gl/components/dist/common/icons";
import {useSelector} from "react-redux";

CustomMapDrawPanelFactory.deps = MapDrawPanelFactory.deps;

function CustomMapDrawPanelFactory(
  MapControlTooltip: ReturnType<typeof MapControlTooltipFactory>,
  MapControlToolbar: ReturnType<typeof MapControlToolbarFactory>
) {
  const defaultActionIcons = {
    visible: EyeSeen,
    hidden: EyeUnseen,
    polygon: DrawPolygon,
    cursor: CursorClick,
    innerPolygon: Polygon,
    rectangle: Rectangle
  };
  const MapDrawPanel: React.FC<MapDrawPanelProps> = React.memo(
    ({
      editor,
      mapControls,
      onToggleMapControl,
      onSetEditorMode,
      actionIcons = defaultActionIcons
    }) => {
      const isActive = mapControls?.mapDraw?.active;
      const numberOfMultiSelections = useSelector(state => state.demo.keplerGl.map.visState.filters.length);
      const isMultiSelected = numberOfMultiSelections > 0;
      const onToggleMenuPanel = useCallback(() => onToggleMapControl('mapDraw'), [
        onToggleMapControl
      ]);

      if (!mapControls?.mapDraw?.show) {
        return null;
      }

      // automatically close the menu if there is a multi selection
      useEffect(() => {
        if (isActive && isMultiSelected) {
          onToggleMapControl('mapDraw');
        }
      }, [isActive, isMultiSelected]);

      return (
        <div className="map-draw-controls" style={{position: 'relative'}} title={isMultiSelected ? 'Only one selection allowed, delete the existing selection first' : undefined}>
          {isActive ? (
            <MapControlToolbar show={isActive}>
              <ToolbarItem
                className="edit-feature"
                onClick={() => {
                  onSetEditorMode(EDITOR_MODES.EDIT);
                }}
                label="toolbar.select"
                icon={actionIcons.cursor}
                active={editor.mode === EDITOR_MODES.EDIT}
              />
              <ToolbarItem
                className="draw-feature"
                onClick={() => {
                  onSetEditorMode(EDITOR_MODES.DRAW_POLYGON);
                }}
                label="toolbar.polygon"
                icon={actionIcons.innerPolygon}
                active={editor.mode === EDITOR_MODES.DRAW_POLYGON}
              />
              <ToolbarItem
                className="draw-rectangle"
                onClick={() => {
                  onSetEditorMode(EDITOR_MODES.DRAW_RECTANGLE);
                }}
                label="toolbar.rectangle"
                icon={actionIcons.rectangle}
                active={editor.mode === EDITOR_MODES.DRAW_RECTANGLE}
              />
            </MapControlToolbar>
          ) : null}
          <MapControlTooltip
            id="map-draw"
            message={'tooltip.DrawOnMap'}
          >
            <MapControlButton
              className={classnames('map-control-button', 'map-draw', {isActive})}
              onClick={onToggleMenuPanel}
              active={isActive}
              disabled={isMultiSelected}
            >
              <actionIcons.polygon height="22px" />
            </MapControlButton>
          </MapControlTooltip>
        </div>
      );
    }
  );

  MapDrawPanel.displayName = 'MapDrawPanel';
  return MapDrawPanel;
}

export function replaceMapDrawPanel() {
    return [MapDrawPanelFactory, CustomMapDrawPanelFactory]
}
