// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import React, {useEffect, useMemo, useState} from 'react';
import styled from 'styled-components';
import {TooltipField} from '@kepler.gl/types';
import PropTypes from 'prop-types';
import {notNullorUndefined} from '@kepler.gl/utils';
import {Layer} from '@kepler.gl/layers';
import {
    AggregationLayerHoverData,
    getTooltipDisplayDeltaValue,
    getTooltipDisplayValue
} from '@kepler.gl/reducers';
import {useIntl} from 'react-intl';
import {CenterFlexbox, LayerHoverInfoFactory} from "@kepler.gl/components";
import {Layers} from "@kepler.gl/components/dist/common/icons";

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
    & .row__name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: no-wrap;
    }
`;

const StyledDivider = styled.div`
    // offset divider to reach popover edge
    margin-left: -14px;
    margin-right: -14px;
    border-bottom: 1px solid ${props => props.theme.panelBorderColor};
`;

interface RowProps {
    name: string;
    value: string;
    deltaValue?: string | null;
    url?: string;
}

const Row: React.FC<RowProps> = ({name, value, deltaValue, url, data, parameterIdx, isMultiSelect, changes, layerName}) => {
    // State to store the edited value
    const [editedValue, setEditedValue] = useState(value);

    useEffect(() => {
        // Reset to default value whenever fields changes
        setEditedValue(value);
    }, [data]);

    // Set 'url' to 'value' if it looks like a url
    if (!url && value && typeof value === 'string' && value.match(/^http/)) {
        url = value;
    }

    const asImg = /<img>/.test(name);

    function setAndStoreParameter(dataEntry, parameterIdx, value, name) {
        // Ensure the nested structure exists
        if (!changes["model_input"]) {
            changes["model_input"] = {};
        }
        if (!changes["model_input"][layerName]) {
            changes["model_input"][layerName] = {};
        }

        if (!changes["model_input"][layerName][name]) {
            const originalValue = dataEntry.values()[parameterIdx];
            changes["model_input"][layerName][name] = {
                current: value,
                original: originalValue
            };
        } else {
            // if the changed value is identical to the original value, remove the entry from the list of changes
            if (value != changes["model_input"][layerName][name].original) {
                changes["model_input"][layerName][name].current = value;
            } else
                delete changes["model_input"][layerName][name];
        }

        dataEntry.values()[parameterIdx] = value
    }

    function setRoadParameter(value: string | boolean | number, data: any[], parameterIdx: number, name: string) {
        if (isMultiSelect) {
            data.forEach((dataEntry) => {
                setAndStoreParameter(dataEntry, parameterIdx, value, name);
            })
        } else {
            setAndStoreParameter(data, parameterIdx, value, name);
        }
        setEditedValue(value);
    }

    return (
        <tr className="layer-hover-info__row" key={name}>
            <td className="row__name" title={(() => {
                switch (name) {
                    case 'speed':
                        return "The maximum speed allowed on the segment";
                    case 'location':
                        return "Indicates the location of the road (overground, underground, ?)";
                    case 'tunnel':
                        return "Indicates if the segment is above ground or underground";
                    default:
                        return name;
                }
            })()
            }>
                {asImg ? name.replace('<img>', '') : name}
            </td>
            <td className="row__value">
                {asImg ? (
                    <img src={value}/>
                ) : url ? (
                    <a target="_blank" rel="noopener noreferrer" href={url}>
                        {editedValue}
                    </a>
                ) : (
                    (() => {
                        switch (name) {
                            case 'tile_id':
                            case 'osm_id':
                                return (<span>{editedValue}</span>);
                            case 'location':
                                return (<div>
                                    <input
                                        type="string"
                                        checked={editedValue}
                                        onChange={(event) => setRoadParameter(event.target.value, data, parameterIdx, name)}
                                    />
                                </div>)
                            case "tunnel":
                            case "closed":
                            case "underground":
                                return (<div>
                                    <input
                                        type="checkbox"
                                        checked={editedValue}
                                        onChange={(event) => setRoadParameter(event.target.checked, data, parameterIdx, name)}
                                        ref={(input) => {
                                            if (input) {
                                                input.indeterminate = editedValue === null;
                                            }
                                        }}
                                    />
                                </div>)
                            default:
                                return (<div>
                                    <input
                                        type="number"
                                        value={editedValue}
                                        onChange={(event) => setRoadParameter(Number(event.target.value), data, parameterIdx, name)}
                                    />
                                </div>)
                        }
                    })()
                )}
            </td>
            {notNullorUndefined(deltaValue) ? (
                <span
                    className={`row__delta-value ${
                        deltaValue.toString().charAt(0) === '+' ? 'positive' : 'negative'
                    }`}
                >
                {deltaValue}
              </span>
            ) : null}
        </tr>);
};

const EntryInfo = ({fieldsToShow, fields, data, primaryData, compareType, isMultiSelect, layer, changes}) => {
    const [showAdditionalRows, setShowAdditionalRows] = useState(false);

    const handleClick = () => {
        setShowAdditionalRows(!showAdditionalRows);
    };

    return (
        <tbody>
        {fieldsToShow.map(item => (
            <EntryInfoRow
                isMultiSelect={isMultiSelect}
                key={item.name}
                item={item}
                fields={fields}
                data={data}
                primaryData={primaryData}
                compareType={compareType}
                layerName={layer.config.dataId}
                changes={changes}
            />
        ))}
        {showAdditionalRows && fields
            .filter(field => field.name !== '_geojson' && !fieldsToShow.map(f => f.name).includes(field.name))
            .map(item => (
                <EntryInfoRow
                    isMultiSelect={isMultiSelect}
                    key={item.name}
                    item={item}
                    fields={fields}
                    data={data}
                    primaryData={primaryData}
                    compareType={compareType}
                    layerName={layer.config.dataId}
                    changes={changes}
                />
            ))}
        <tr>
            <td colSpan={fieldsToShow.length}>
                {!showAdditionalRows ? (
                    <button onClick={handleClick}>Show More</button>
                ) : (
                    <button onClick={handleClick}>Show Less</button>
                )}
            </td>
        </tr>
        </tbody>
    )
};

function allEntriesHaveSameValue(dataRows, idx: number): boolean {
    // Get the value at index `idx` for the first entry
    if (dataRows.length === 0) {return null}

    const firstValue = dataRows[0].valueAt(idx);

    // Check if all other entries have the same value at index `idx`
    for (let i = 1; i < dataRows.length; i++) {
        if (dataRows[i].valueAt(idx) !== firstValue) {
            return null; // Return false if any value is different
        }
    }

    return firstValue; // Return value if all values are the same
}

const EntryInfoRow = ({item, fields, data, primaryData, compareType, isMultiSelect, changes, layerName}) => {
    const fieldIdx = fields.findIndex(f => f.name === item.name);
    if (fieldIdx < 0) {
        return null;
    }
    const field = fields[fieldIdx];

    // do not display the 'changed' parameter
    if (field.name == 'changed') {
        return null;
    }

    let value;
    if (isMultiSelect) {
        value = allEntriesHaveSameValue(data, fieldIdx);
    } else {
        value = data.valueAt(fieldIdx);
    }

    const displayDeltaValue = (primaryData && !isMultiSelect)
        ? getTooltipDisplayDeltaValue({
            field,
            data,
            fieldIdx,
            primaryData,
            compareType
        })
        : null;

    return (
        <Row
            name={field.displayName || field.name}
            value={value}
            deltaValue={displayDeltaValue}
            data={data}
            parameterIdx={fieldIdx}
            isMultiSelect={isMultiSelect}
            changes={changes}
            layerName={layerName}
        />
    );
};

// TODO: supporting comparative value for aggregated cells as well
const CellInfo = ({
                      fieldsToShow,
                      data,
                      layer
                  }: {
    data: AggregationLayerHoverData;
    fieldsToShow: TooltipField[];
    layer: Layer;
}) => {
    const {colorField, sizeField} = layer.config as any;

    const colorValue = useMemo(() => {
        if (colorField && layer.visualChannels.color) {
            const item = fieldsToShow.find(field => field.name === colorField.name);
            return getTooltipDisplayValue({item, field: colorField, value: data.colorValue});
        }
        return null;
    }, [fieldsToShow, colorField, layer, data.colorValue]);

    const elevationValue = useMemo(() => {
        if (sizeField && layer.visualChannels.size) {
            const item = fieldsToShow.find(field => field.name === sizeField.name);
            return getTooltipDisplayValue({item, field: sizeField, value: data.elevationValue});
        }
        return null;
    }, [fieldsToShow, sizeField, layer, data.elevationValue]);

    const colorMeasure = layer.getVisualChannelDescription('color').measure;
    const sizeMeasure = layer.getVisualChannelDescription('size').measure;
    return (
        <tbody>
        <Row name={'total points'} key="count" value={String(data.points && data.points.length)}/>
        {colorField && layer.visualChannels.color && colorMeasure ? (
            <Row name={colorMeasure} key="color" value={colorValue || 'N/A'}/>
        ) : null}
        {sizeField && layer.visualChannels.size && sizeMeasure ? (
            <Row name={sizeMeasure} key="size" value={elevationValue || 'N/A'}/>
        ) : null}
        </tbody>
    );
};

const CustomLayerHoverInfoFactory = () => {
    const LayerHoverInfo = props => {
        const {data, layer} = props;
        const intl = useIntl();
        if (!data || !layer) {
            return null;
        }

        const hasFieldsToShow =
            (data.fieldValues && Object.keys(data.fieldValues).length > 0) ||
            (props.fieldsToShow && props.fieldsToShow.length > 0);
        const isMultiSelect = Array.isArray(data)

        if (isMultiSelect) {
            return (
                <div className="map-popover__layer-info">
                    <StyledLayerName className="map-popover__layer-name">
                        <Layers height="12px"/>
                        {props.layer.config.label}
                    </StyledLayerName>
                    {hasFieldsToShow && <StyledDivider/>}
                    <StyledTable>
                        <EntryInfo {...props} isMultiSelect={isMultiSelect} />
                    </StyledTable>
                    {hasFieldsToShow && <StyledDivider/>}
                </div>
            );
        } else {
            return (
                <div className="map-popover__layer-info">
                    <StyledLayerName className="map-popover__layer-name">
                        <Layers height="12px"/>
                        {props.layer.config.label}
                    </StyledLayerName>
                    {hasFieldsToShow && <StyledDivider/>}
                    <StyledTable>
                        {data.fieldValues ? (
                            <tbody>
                            {data.fieldValues.map(({labelMessage, value}, i) => (
                                <Row key={i} name={intl.formatMessage({id: labelMessage})} value={value}/>
                            ))}
                            </tbody>
                        ) : props.layer.isAggregated ? (
                            <CellInfo {...props} />
                        ) : (
                            <EntryInfo {...props} />
                        )}
                    </StyledTable>
                    {hasFieldsToShow && <StyledDivider/>}
                </div>
            );
        }
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