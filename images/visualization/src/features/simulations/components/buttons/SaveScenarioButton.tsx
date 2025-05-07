/**
 * Getting the current state of kepler.gl for saving to a file.
 *
 * See also: https://docs.kepler.gl/docs/api-reference/advanced-usages/saving-loading-w-schema
 */
import React from 'react';
import { Icons } from '@kepler.gl/components';
import {useSelector} from "react-redux";
import {
    isDefaultScenario,
    selectAuthenticated,
    selectHasChangedMap,
    setHasChangedMap
} from "../../../user/userSlice";
import {updateScenario} from "../../store/simulationSlice";
import {useAppDispatch} from "../../../../hooks";

export const SaveScenarioButton = () => {
    const isAuthenticated = useSelector(selectAuthenticated)
    const visState = useSelector((state: any) => state?.demo?.keplerGl?.map?.visState);
    const dispatch = useAppDispatch();
    const hasChangedMap = useSelector(selectHasChangedMap);
    const isDefaultScenarioId = useSelector(isDefaultScenario);
    const isScenarioLoaded = visState?.layers?.length > 0 && (visState?.layers[0]?.id === "road_network" || visState?.layers[0]?.id === "grid");

    const onClick = async () => {
        try {
            await dispatch(updateScenario(undefined)).unwrap();
            dispatch(setHasChangedMap(false));
        } catch (err) {
            console.error('Encountered an error: ', err)
        }
    };

    if (isAuthenticated && isScenarioLoaded && !isDefaultScenarioId) {
        return (
            <button onClick={onClick} disabled={!hasChangedMap}
                    title={hasChangedMap ? "Save changes to the scenario" : "No changes made"}>
                <Icons.Save/>
                Save
            </button>
        );
    } else {
        return null;
    }
};