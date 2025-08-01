import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useDispatch} from "react-redux";
import {
    SimulationDataValidation
} from "../simulations/components/simulation-config-modal/SimulationConfigModal";
import {applyChanges} from "../undo-redo/store/UndoRedoReducer";
import {notNullorUndefined} from "@kepler.gl/utils";

import {fieldUnits} from "./field-units";

interface RowProps {
    name: string;
    value: string;
    deltaValue?: string | null;
    url?: string;
    data: any;
    parameterIdx: number;
    isMultiSelect: boolean;
    layerName: string;
    type: string;
}

function formatEpochToTime(epoch: number) {
  const date = new Date(epoch * 1000);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getRowTitle(name: string): string {
    switch (name) {
        case 'id':
        case 'h3-id':
            return "Unique internal identifier for the segment";
        case 'speed':
            return "The maximum speed allowed on the segment (in kilometers per hour)";
        case 'underground':
            return "Indicates whether the segment is underground or not";
        case 'closed':
            return "Indicates whether the segment is closed or not";
        case 'tunnel':
            return "Indicates whether the segment is part of a tunnel or not";
        case 'no2':
        case 'co2':
        case 'nox':
        case 'pmx':
        case 'hc':
        case 'co':
            return `Amount of emitted ${name} pollutant on the road segment during the time slot, measured in grams`;
        case 'fuel':
            return "Total fuel consumption on the segment during the time slot, measured in grams";
        case 'no2 mcg/m3':
            return "Average concentration of nitrogen dioxide in the air during the time slot, measured in micrograms per cubic meter";
        case 'occupancy':
            return "Average number of vehicles driving on the segment during the time slot";
        case 'time_window':
            return "Time window for data aggregation, formatted as hours and minutes (hh:mm)";
        case 'agricultural_landuse':
        case 'commercial_landuse':
        case 'industrial_landuse':
        case 'natural_landuse':
        case 'residential_landuse':
            return "Land area dedicated to the specified land use category, measured in square meters";
        case 'food_pois':
        case 'fun_pois':
        case 'health_pois':
        case 'infrastructure_pois':
        case 'school_pois':
        case 'services_pois':
        case 'shop_pois':
        case 'sport_pois':
        case 'tourism_pois':
            return "Number of nearby points of interest (POIs) related to the specified category";
        case 'static_population':
            return "Total number of people residing in the area";
        default:
            const [baseName, ...rest] = name.split('_');
            if (rest.includes('impact')) {
                return `The positive or negative environmental impact caused by ${baseName} calculated for each road modification`;
            } else if (rest.length === 1 && !isNaN(parseInt(rest[0], 10))) {
                return `The simulation result of ${baseName} when only modifications of road ${rest[0]} are taken into account`;
            } else if (rest.length === 2 && rest[0] === 'diff' && !isNaN(parseInt(rest[1], 10))) {
                return `The difference of the simulation result of ${baseName} for the modification of ${rest[1]}`;
            }
            return '';
    }
}

function formatDisplayValue(val: any) {
    // Only format numbers, and only floats
    if (typeof val === 'number' && !Number.isInteger(val)) {
        return val.toFixed(2);
    }
    if (!isNaN(Number(val)) && val !== '' && val !== null && val !== undefined) {
        const num = Number(val);
        if (!Number.isInteger(num)) {
            return num.toFixed(2);
        }
    }
    return val ?? '';
}

export const Row: React.FC<RowProps> = React.memo(({
    name,
    value,
    deltaValue,
    url: urlProp,
    data,
    parameterIdx,
    isMultiSelect,
    layerName,
    type
}) => {
    const [editedValue, setEditedValue] = useState(value);
    const [displayValue, setDisplayValue] = useState(() => formatDisplayValue(value));
    const dispatch = useDispatch();

    // Memoize url, asImg, and title
    const url = useMemo(() => {
        if (urlProp) return urlProp;
        if (value && typeof value === 'string' && value.match(/^http/)) {
            return value;
        }
        return undefined;
    }, [urlProp, value]);
    const asImg = useMemo(() => /<img>/.test(name), [name]);
    const title = useMemo(() => getRowTitle(name), [name]);

    const setRoadParameter = useCallback((val: string | boolean | number, data: any[], parameterIdx: number, name: string) => {
        dispatch(applyChanges({
            isMultiSelect,
            value: val,
            data,
            parameterIdx,
            name,
            layerName
        }));
        setEditedValue(val);
    }, [dispatch, isMultiSelect, layerName]);

    const handleInputChange = useCallback((fieldName: string, newValue: number, data: any[], parameterIdx: number) => {
        const validationRules = SimulationDataValidation[fieldName];
        if (validationRules) {
            const {min, max, type} = validationRules;
            let limitedValue = Math.max(min, Math.min(max, newValue));
            if (type === 'int' && !Number.isInteger(limitedValue)) {
                limitedValue = Math.round(limitedValue);
            }
            setRoadParameter(limitedValue, data, parameterIdx, name);
            return limitedValue;
        }
    }, [setRoadParameter, name]);

    function getRowHtml() {
        switch (name) {
            case 'h3-id':
            case 'id':
            case 'type':
                return (<span>{editedValue}</span>);
            case 'tunnel':
            case 'closed':
            case 'underground':
                return (
                    <div>
                        <input
                            type="checkbox"
                            checked={!!editedValue}
                            onChange={(event) => setRoadParameter(event.target.checked, data, parameterIdx, name)}
                            ref={input => {
                                if (input) input.indeterminate = editedValue === null;
                            }}
                        />
                    </div>
                );
            case 'day_type':
                return <span>{editedValue}</span>;
            case 'time_window':
                return <span>{formatEpochToTime(Number(editedValue))}</span>;
            default:
                if (layerName === 'grid' || layerName === 'road_network') {
                    return (
                        <div>
                            <input
                                type="number"
                                placeholder="multiple values"
                                value={displayValue}
                                onChange={event => {
                                    // when the user modifies the field, we update the edited value and the display value (without formatting)
                                    setEditedValue(event.target.value);
                                    setDisplayValue(event.target.value);
                                }}
                                onBlur={event => {
                                    // when the user leaves the field, we handle the input change (which updates the edited value)
                                    // and we update the display value (with 2 decimals)
                                    const val = event.target.value;
                                    const newVal = handleInputChange(name, val === '' ? '' : Number(val), data, parameterIdx);
                                    if (newVal !== null) {
                                        setDisplayValue(formatDisplayValue(newVal));
                                    }
                                }}
                                onFocus={event => {
                                    // when the user enters the field, we update the display value (without formatting)
                                    setDisplayValue(editedValue ?? '');
                                    event.target.select();
                                }}
                                onKeyDown={event => {
                                    // same functionality as onBlur
                                    if (event.key === 'Enter') {
                                        event.target.blur();
                                    }
                                }}
                            />
                        </div>
                    );
                } else if (layerName.startsWith('prediction_')) {
                    return <span>{Number.isInteger(editedValue) ? editedValue : Number(editedValue).toFixed(2)}</span>;
                } else {
                    return <span>{editedValue}</span>;
                }
        }
    }

    const renderValueCell = useMemo(() => {
        if (asImg) {
            return <img src={value}/>;
        }
        if (url) {
            return <a target="_blank" rel="noopener noreferrer" href={url}>{editedValue}</a>;
        }
        return getRowHtml();
    }, [asImg, url, editedValue, displayValue, name, data, parameterIdx, setRoadParameter, handleInputChange, layerName, type]);

    const renderDeltaCell = useMemo(() => {
        if (!notNullorUndefined(deltaValue)) return null;
        if (!(deltaValue === 'true' || deltaValue === 'false')) {
            return (
                <span
                    className={`row__delta-value ${deltaValue.toString().charAt(0) === '+' ? 'positive' : 'negative'}`}
                    title={`This field changed by ${deltaValue}`}>
                    {deltaValue}
                </span>
            );
        }
        // else {
        //     return (
        //         <span className={`row__delta-value ${deltaValue === 'true' ? 'positive' : 'negative'}`}
        //               title={`This checkbox was originally ${deltaValue ? 'unchecked' : 'checked'}`}>
        //             (was
        //             <input
        //                 type="checkbox"
        //                 checked={deltaValue === 'true'}
        //                 disabled={true}
        //                 style={{pointerEvents: 'none'}}
        //             />)
        //         </span>
        //     );
        // }
    }, [deltaValue]);

    return (
        <tr className="layer-hover-info__row" key={name}>
            <td className="row__name" title={title}>
                {asImg ? name.replace('<img>', '') : name}
                {fieldUnits[name] && (
                    <span style={{ color: 'grey', fontSize: '0.85em', marginLeft: '0.5em' }}>
                        ({fieldUnits[name]})
                    </span>
                )}
            </td>
            <td className="row__value">{renderValueCell}</td>
            <td className="row__delta">{renderDeltaCell}</td>
        </tr>
    );
});