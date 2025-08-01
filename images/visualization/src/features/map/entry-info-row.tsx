import {useSelector} from "react-redux";
import {Row} from "./row";
import React, {useMemo} from "react";
import {getTooltipDisplayDeltaValue} from "../../kepler-overrides/components/map/layer-hover-info";

function allEntriesHaveSameValue(dataRows, idx, layerName, selectedRoadTypes, roadTypeIdx) {
    const isGridOrNoRoadsTypesSelected = layerName !== 'road_network' || selectedRoadTypes.length === 0;

    if (!dataRows.length) return null;
    let firstValue = isGridOrNoRoadsTypesSelected ?
        dataRows[0] :
        dataRows.find(d => selectedRoadTypes.includes(d.valueAt(roadTypeIdx)));

    // if we cannot find a row with a value, then all the selected roads have no value
    if (firstValue === undefined) {
        return null;
    } else {
        firstValue = firstValue.valueAt(idx);
    }

    const differentValue = isGridOrNoRoadsTypesSelected ?
        dataRows.find(d => d.valueAt(idx) !== firstValue) :
        dataRows.find(d => selectedRoadTypes.includes(d.valueAt(roadTypeIdx)) && d.valueAt(idx) !== firstValue);

    // if we cannot find a row with a different value, then all the selected roads have the same value
    if (differentValue !== undefined) {
        return null;
    } else {
        return firstValue;
    }
}

export const EntryInfoRow = ({item, fields, data, primaryData, compareType, isMultiSelect, layerName}) => {
    const selectedIndexes = useSelector((state) =>
        state.demo?.undoRedo?.selectedIndexes
    );

    const selectedRoadTypes = useSelector(state => state.demo.undoRedo.selectedRoadTypes);

    const fieldIdx = useMemo(() => fields.findIndex(f => f.name === item.name), [fields, item.name]);

    if (fieldIdx < 0) return null;
    const field = useMemo(() => fields[fieldIdx], [fields, fieldIdx]);

    // Memoize value and itemId
    const {value, itemId} = useMemo(() => {
        if (isMultiSelect) {
            const filtered = data.filter((i, _) => selectedIndexes && selectedIndexes.has(i._rowIndex));
            const roadTypeIdx = fields.findIndex(f => f.name === 'type');
            return {value: allEntriesHaveSameValue(filtered, fieldIdx, layerName, selectedRoadTypes, roadTypeIdx), itemId: undefined};
        } else {
            return {
                value: data.valueAt(fieldIdx),
                itemId: data.valueAt(1)
            };
        }
    }, [isMultiSelect, data, selectedIndexes, fieldIdx, selectedRoadTypes, layerName, fields]);

    // Use a single selector for all needed state
    const originalValue = useSelector((state) =>
        state.demo.undoRedo?.changes?.original?.mobility_model_input?.[layerName]?.[itemId]?.[item.name]
    );

    // Memoize delta value
    const displayDeltaValue = useMemo(() => {
        if ((layerName === 'road_network' || layerName === 'grid') && !isMultiSelect) {
            const changedIdx = fields.findIndex(f => f.name === 'changed');
            const isChanged = data.valueAt(changedIdx);
            if (isChanged && originalValue !== undefined) {
                return getTooltipDisplayDeltaValue({
                    field,
                    data,
                    fieldIdx,
                    originalValue,
                    compareType
                });
            }
        }
        return null;
    }, [layerName, isMultiSelect, data, fields, field, fieldIdx, originalValue, compareType]);

    return (
        <Row
            name={field.displayName || field.name}
            type={field.analyzerType}
            value={value}
            deltaValue={displayDeltaValue}
            data={data}
            parameterIdx={fieldIdx}
            isMultiSelect={isMultiSelect}
            layerName={layerName}
        />
    );
};