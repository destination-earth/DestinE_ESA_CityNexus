// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {notNullorUndefined} from '@kepler.gl/utils';
import {
    getTooltipDisplayDeltaValue
} from '@kepler.gl/reducers';
import {useIntl} from 'react-intl';
import {CenterFlexbox, LayerHoverInfoFactory} from "@kepler.gl/components";
import {Layers} from "@kepler.gl/components/dist/common/icons";
import {useDispatch} from "react-redux";
import {StyledDivider} from "./map-popover";
import {applyChanges, redo, resetHistory, undo} from "../features/undo-redo/store/UndoRedoReducer";

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

interface RowProps {
    name: string;
    value: string;
    deltaValue?: string | null;
    url?: string;
    data: any;
    parameterIdx: number;
    isMultiSelect: boolean;
    layerName: string;
}

const Row: React.FC<RowProps> = ({
                                     name,
                                     value,
                                     deltaValue,
                                     url,
                                     data,
                                     parameterIdx,
                                     isMultiSelect,
                                     layerName
                                 }) => {
    // State to store the edited value
    const [editedValue, setEditedValue] = useState(value);
    const dispatch = useDispatch();

    useEffect(() => {
        // Reset to default value whenever fields changes
        setEditedValue(value);
    }, [data]);

    // Set 'url' to 'value' if it looks like a url
    if (!url && value && typeof value === 'string' && value.match(/^http/)) {
        url = value;
    }

    const asImg = /<img>/.test(name);

    function setRoadParameter(value: string | boolean | number, data: any[], parameterIdx: number, name: string) {
        dispatch(applyChanges({
            isMultiSelect: isMultiSelect,
            value: value,
            data: data,
            parameterIdx: parameterIdx,
            name: name,
            layerName: layerName
        }));
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
                            case 'h3-id':
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

const EntryInfo = ({fieldsToShow, fields, data, primaryData, compareType, isMultiSelect, layer}) => {
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
                />
            ))}
        {fields.filter(field => field.name !== '_geojson' && field.name !== 'changed').length > fieldsToShow.length ? (
            <tr>
                <td colSpan={fieldsToShow.length}>
                    {!showAdditionalRows ? (
                        <button onClick={handleClick}>Show More</button>
                    ) : (
                        <button onClick={handleClick}>Show Less</button>
                    )}
                </td>
            </tr>
        ) : null}
        </tbody>
    )
};

function allEntriesHaveSameValue(dataRows, idx: number): boolean {
    // Get the value at index `idx` for the first entry
    if (dataRows.length === 0) {
        return null
    }

    const firstValue = dataRows[0].valueAt(idx);

    // Check if all other entries have the same value at index `idx`
    for (let i = 1; i < dataRows.length; i++) {
        if (dataRows[i].valueAt(idx) !== firstValue) {
            return null; // Return false if any value is different
        }
    }

    return firstValue; // Return value if all values are the same
}

const EntryInfoRow = ({item, fields, data, primaryData, compareType, isMultiSelect, layerName}) => {
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
            layerName={layerName}
        />
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
                        <EntryInfo {...props} isMultiSelect={isMultiSelect}/>
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