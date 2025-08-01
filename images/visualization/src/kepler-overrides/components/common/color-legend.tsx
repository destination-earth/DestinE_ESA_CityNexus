// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import React, {useCallback} from 'react';
import styled, {css} from 'styled-components';

import {ColorLegendFactory, LegendRowFactory} from "@kepler.gl/components";
import {ColorLegendProps, useLayerColorLegends} from "@kepler.gl/components/dist/common/color-legend";

const GAP = 2;

const inputCss = css`
  input {
    pointer-events: none;
  }
`;
const StyledLegend = styled.div<{disableEdit: boolean; isExpanded?: boolean}>`
  ${props => props.theme.sidePanelScrollBar};
  ${props => (props.isExpanded ? '' : `max-height: 156px;`)};
  overflow: auto;
  margin-bottom: ${GAP}px;
  display: grid;
  grid-row-gap: ${GAP}px;
  padding: 2px 0;

  ${props => (props.disableEdit ? inputCss : '')}
`;

CustomColorLegendFactory.deps = ColorLegendFactory.deps;
function CustomColorLegendFactory(LegendRow: ReturnType<typeof LegendRowFactory>) {
  const ColorLegend: React.FC<ColorLegendProps> = ({
    layer,
    isFixed,
    isExpanded,
    domain,
    range,
    labelFormat,
    scaleType,
    fieldType,
    mapState,
    onUpdateColorLegend,
    displayLabel = true,
    disableEdit = false
  }) => {
    const {colorLegends} = range || {};

    const legends = useLayerColorLegends(
      layer,
      scaleType,
      domain,
      range,
      isFixed,
      fieldType,
      labelFormat,
      mapState
    );

    const onUpdateLabel = useCallback(
      (color, newValue) => {
        if (onUpdateColorLegend) {
          onUpdateColorLegend({
            ...colorLegends,
            [color]: newValue
          });
        }
      },
      [onUpdateColorLegend, colorLegends]
    );

    const onResetLabel = useCallback(
      color => {
        /* eslint-disable no-unused-vars */
        // @ts-ignore
        const {[color]: _, ...rest} = colorLegends;
        if (onUpdateColorLegend && rest) {
          onUpdateColorLegend(rest);
        }
        /* eslint-enable no-unused-vars */
      },
      [onUpdateColorLegend, colorLegends]
    );

    const filteredLegends = legends.filter(legend => legend.label !== '0 to 0');

    return (
      <StyledLegend
        className="styled-color-legend"
        disableEdit={disableEdit}
        isExpanded={isExpanded}
      >
        {(filteredLegends.length > 0 ? filteredLegends : [legends[legends.length - 1]]).map((legend, i) => (
            <LegendRow
                key={`${legend.data}-${i}`}
                label={legend.label}
                displayLabel={displayLabel}
                color={legend.data}
                onUpdateLabel={!disableEdit ? onUpdateLabel : undefined}
                onResetLabel={legend.override && !disableEdit ? onResetLabel : undefined}
            />
        ))}
      </StyledLegend>
    );
  };

  return React.memo(ColorLegend);
}

export default function replaceColorLegend() {
    return [ColorLegendFactory, CustomColorLegendFactory];
}
