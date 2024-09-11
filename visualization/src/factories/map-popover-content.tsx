// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import React from 'react';
import {injectIntl, IntlShape} from 'react-intl';
import {LayerHoverProp} from '@kepler.gl/reducers';
import {CoordinateInfoFactory, LayerHoverInfoFactory, MapPopoverContentFactory} from "@kepler.gl/components";

CustomMapPopoverContentFactory.deps = [
  ...MapPopoverContentFactory.deps
];

type MapPopoverContentProps = {
  coordinate: [number, number] | boolean;
  layerHoverProp: LayerHoverProp | null;
  zoom: number;
};

type IntlProps = {
  intl: IntlShape;
};

export default function CustomMapPopoverContentFactory(
  LayerHoverInfo: ReturnType<typeof LayerHoverInfoFactory>,
  CoordinateInfo: ReturnType<typeof CoordinateInfoFactory>
) {
  const MapPopoverContent: React.FC<MapPopoverContentProps & IntlProps> = ({
    coordinate,
    layerHoverProp,
    zoom
  }) => {
    return (
      <>
        {Array.isArray(coordinate) && <CoordinateInfo coordinate={coordinate} zoom={zoom} />}
        {layerHoverProp && <LayerHoverInfo {...layerHoverProp} />}
      </>
    );
  };
  return injectIntl(MapPopoverContent);
}

export function replaceMapPopoverContent() {
  return [MapPopoverContentFactory, CustomMapPopoverContentFactory];
}