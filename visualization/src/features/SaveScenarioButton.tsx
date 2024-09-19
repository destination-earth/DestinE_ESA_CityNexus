/**
 * Getting the current state of kepler.gl for saving to a file.
 *
 * See also: https://docs.kepler.gl/docs/api-reference/advanced-usages/saving-loading-w-schema
 */
import React from 'react';
import { Icons } from '@kepler.gl/components';
import {useSelector} from "react-redux";
import {selectAuthenticated, selectHasChangedMap, setHasChangedMap} from "../components/user/userSlice";
import {updateScenario} from "./simulations/store/simulationSlice";
import {useAppDispatch} from "../hooks";

export const SaveScenarioButton = () => {
    const isAuthenticated = useSelector(selectAuthenticated)
    const visState = useSelector((state: any) => state?.demo?.keplerGl?.map?.visState);
    const changes = useSelector((state: any) => state.undoRedo.changes);
    const dispatch = useAppDispatch();
    const hasChangedMap = useSelector(selectHasChangedMap);

    const onClick = async () => {
        try {
            await dispatch(updateScenario(undefined)).unwrap();
            dispatch(setHasChangedMap(false));
        } catch (err) {
            console.error('Encountered an error: ', err)
        }
    };

    if (isAuthenticated && visState && visState.layers && visState?.layers.length === 2
        && changes.scenarioId !== "default_scenario") {
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