// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import React, {useMemo} from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {DataRow, defaultFormatter, getFormatter, isNumber} from '@kepler.gl/utils';
import {useIntl} from 'react-intl';
import {CenterFlexbox, LayerHoverInfoFactory} from "@kepler.gl/components";
import {Layers} from "@kepler.gl/components/dist/common/icons";
import {StyledDivider} from "./map-popover";
import {CompareType, Field} from "@kepler.gl/types";
import {ALL_FIELD_TYPES, COMPARE_TYPES, TOOLTIP_FORMATS, TOOLTIP_KEY} from "@kepler.gl/constants";
import {NEGATIVE_SIGNS, TOOLTIP_MINUS_SIGN} from "@kepler.gl/reducers/dist/interaction-utils";
import {Row} from "../../../features/map/row";
import {EntryInfo} from "../../../features/map/entry-info";

export const StyledLayerName = styled(CenterFlexbox)`
    color: ${props => props.theme.textColorHl};
    font-size: 12px;
    letter-spacing: 0.43px;
    text-transform: capitalize;

    svg {
        margin-right: 4px;
    }
`;

const StyledTable = styled.table`
    & .row__delta-value {
        text-align: right;
        margin-left: 6px;

        &.positive {
            color: ${props => props.theme.notificationColors.success};
        }

        &.negative {
            color: ${props => props.theme.negativeBtnActBgd};
        }
    }

    & .row__value,
    & .row__name,
    & .row__delta {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: no-wrap;
    }
`;

export function getTooltipDisplayDeltaValue({
  originalValue,
  field,
  compareType,
  data,
  fieldIdx
}: {
  field: Field;
  data: DataRow;
  fieldIdx: number;
  originalValue: any;
  compareType: CompareType;
}): string | null {
  let displayDeltaValue: string | null = null;

  if (
    originalValue !== undefined &&
    // comparison mode only works for numeric field
    (field.type === ALL_FIELD_TYPES.integer || field.type === ALL_FIELD_TYPES.real)
  ) {
    const dp = data.valueAt(fieldIdx);
    if (isNumber(originalValue) && isNumber(dp)) {
      const deltaValue = compareType === COMPARE_TYPES.RELATIVE ? dp / originalValue - 1 : dp - originalValue;

      // do not show too small deltas
      if (deltaValue < 0.01 && deltaValue > -0.01) {
        return undefined;
      }

      const deltaFormat =
        compareType === COMPARE_TYPES.RELATIVE
          ? TOOLTIP_FORMATS.DECIMAL_PERCENT_FULL_2[TOOLTIP_KEY]
          : field.displayFormat || TOOLTIP_FORMATS.DECIMAL_DECIMAL_FIXED_3[TOOLTIP_KEY];

      displayDeltaValue = getFormatter(deltaFormat, field)(deltaValue);

      // safely cast string
      displayDeltaValue = defaultFormatter(displayDeltaValue) as string;
      const deltaFirstChar = displayDeltaValue.charAt(0);

      if (deltaFirstChar !== '+' && !NEGATIVE_SIGNS.includes(deltaFirstChar)) {
        displayDeltaValue = `+${displayDeltaValue}`;
      }
    } else {
      displayDeltaValue = TOOLTIP_MINUS_SIGN;
    }
  } else if (field.type === ALL_FIELD_TYPES.boolean) {
      displayDeltaValue = originalValue ? 'true' : 'false';
  }

  return displayDeltaValue;
}

const CustomLayerHoverInfoFactory = () => {
    const LayerHoverInfo = props => {
        const {data, layer, fieldsToShow} = props;
        const intl = useIntl();

        // Memoize derived values
        const hasFieldsToShow = useMemo(() =>
            (data.fieldValues && Object.keys(data.fieldValues).length > 0) ||
            (fieldsToShow && fieldsToShow.length > 0),
            [data.fieldValues, fieldsToShow]
        );
        const isMultiSelect = useMemo(() => Array.isArray(data), [data]);

        // Memoize label
        const layerLabel = useMemo(() => layer.config.label, [layer.config.label]);

        // Memoize EntryInfo props
        const entryInfoProps = useMemo(() => ({...props, isMultiSelect}), [props, isMultiSelect]);

        // Early return if missing required props
        if (!data || !layer) return null;

        return (
            <div className="map-popover__layer-info">
                <StyledLayerName className="map-popover__layer-name">
                    <Layers height="12px"/>
                    {layerLabel}
                </StyledLayerName>
                {hasFieldsToShow && <StyledDivider/>}
                <StyledTable>
                    {isMultiSelect ? (
                        <EntryInfo {...entryInfoProps} />
                    ) : (
                        data.fieldValues ? (
                            <tbody>
                                {data.fieldValues.map(({labelMessage, value}, i) => (
                                    <Row key={i} name={intl.formatMessage({id: labelMessage})} value={value}/>
                                ))}
                            </tbody>
                        ) : (
                            <EntryInfo {...entryInfoProps} />
                        )
                    )}
                </StyledTable>
                {hasFieldsToShow && <StyledDivider/>}
            </div>
        );
    };

    LayerHoverInfo.propTypes = {
        fields: PropTypes.arrayOf(PropTypes.any),
        fieldsToShow: PropTypes.arrayOf(PropTypes.any),
        layer: PropTypes.object,
        data: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.any), PropTypes.object]),
        changes: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.any), PropTypes.object])
    };
    return LayerHoverInfo;
};

export function replaceLayerHoverInfo() {
    return [LayerHoverInfoFactory, CustomLayerHoverInfoFactory];
}