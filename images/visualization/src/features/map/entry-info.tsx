import React, {useState, useMemo, useCallback} from "react";
import {Row} from "./row";
import {EntryInfoRow} from "./entry-info-row";

function extractDayType(str) {
    const match = str.split('_');
    return match && match.length > 2 ? match.at(-1) : null;
}

export const EntryInfo = ({fieldsToShow, fields, data, primaryData, compareType, isMultiSelect, layer}) => {
    const [showAdditionalRows, setShowAdditionalRows] = useState(false);

    const layerName = useMemo(() => layer.config.dataId, [layer.config.dataId]);
    const day_type = useMemo(() => extractDayType(layer.config.dataId), [layer.config.dataId]);
    const extraFields = useMemo(() => fields.filter(field => field.name !== '_geojson' && field.name !== 'changed' && field.name !== 'selected'), [fields]);
    const fieldsToShowNames = useMemo(() => new Set(fieldsToShow.map(f => f.name)), [fieldsToShow]);

    const handleClick = useCallback(() => {
        setShowAdditionalRows(v => !v);
    }, []);

    const additionalRows = useMemo(() => showAdditionalRows
        ? extraFields.filter(field => !fieldsToShowNames.has(field.name))
        : [], [showAdditionalRows, extraFields, fieldsToShowNames]);

    const showMoreButton = extraFields.length > fieldsToShow.length;

    return (
        <tbody>
        {day_type && (
            <Row key="day_type" name="day_type" value={day_type} />
        )}
        {fieldsToShow.map(item => (
            <EntryInfoRow
                isMultiSelect={isMultiSelect}
                key={item.name}
                item={item}
                fields={fields}
                data={data}
                primaryData={primaryData}
                compareType={compareType}
                layerName={layerName}
            />
        ))}
        {additionalRows.map(item => (
            <EntryInfoRow
                isMultiSelect={isMultiSelect}
                key={item.name}
                item={item}
                fields={fields}
                data={data}
                primaryData={primaryData}
                compareType={compareType}
                layerName={layerName}
            />
        ))}
        {showMoreButton && (
            <tr>
                <td colSpan={fieldsToShow.length}>
                    <button onClick={handleClick}>{showAdditionalRows ? "Show Less" : "Show More"}</button>
                </td>
            </tr>
        )}
        </tbody>
    )
};