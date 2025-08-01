import React from "react";
import styled from "styled-components";
import KeplerGlLogo from "@kepler.gl/components/dist/common/logo";
import {
  LayerSelectorPanelFactory, LocalePanelFactory,
  MapControlFactory, MapControlProps, MapDrawPanelFactory, MapLegendPanelFactory,
  SplitMapButtonFactory,
  Toggle3dButtonFactory
} from "@kepler.gl/components";

interface StyledMapControlProps {
  top?: number;
}

const StyledMapControl = styled.div<StyledMapControlProps>`
  right: 0;
  padding: ${props => props.theme.mapControl.padding}px;
  z-index: 10;
  margin-top: ${props => props.top || 0}px;
  position: absolute;
  display: grid;
  row-gap: 8px;
  justify-items: end;
  pointer-events: none; /* prevent padding from blocking input */
  & > * {
    /* all children should allow input */
    pointer-events: all;
  }
`;

const LegendLogo = <KeplerGlLogo version={false} appName="kepler.gl" />;

CustomMapControlFactory.deps = MapControlFactory.deps;

function CustomMapControlFactory(
  SplitMapButton: ReturnType<typeof SplitMapButtonFactory>,
  Toggle3dButton: ReturnType<typeof Toggle3dButtonFactory>,
  LayerSelectorPanel: ReturnType<typeof LayerSelectorPanelFactory>,
  MapLegendPanel: ReturnType<typeof MapLegendPanelFactory>,
  MapDrawPanel: ReturnType<typeof MapDrawPanelFactory>,
  LocalePanel: ReturnType<typeof LocalePanelFactory>
) {
  const DEFAULT_ACTIONS = [
    SplitMapButton,
    LayerSelectorPanel,
    Toggle3dButton,
    MapDrawPanel,
    LocalePanel,
    MapLegendPanel
  ];

  const MapControl: React.FC<MapControlProps> = React.memo(
    ({actionComponents = DEFAULT_ACTIONS, ...props}) => {
      const isPredictionLayer = props.isPredictionLayer;
      return (
        <StyledMapControl className="map-control" top={props.top}>
          {actionComponents.filter(action => !isPredictionLayer || action !== MapDrawPanel).map((ActionComponent, index) => (
            <ActionComponent key={index} className="map-control-action" {...props} />
          ))}
        </StyledMapControl>
      );
    }
  );

  MapControl.defaultProps = {
    isSplit: false,
    top: 0,
    mapIndex: 0,
    logoComponent: LegendLogo,
    actionComponents: DEFAULT_ACTIONS
  };

  MapControl.displayName = 'MapControl';

  return MapControl;
}

export function replaceMapControl() {
    return [MapControlFactory, CustomMapControlFactory];
}
