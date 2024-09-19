/**
 * Getting the current state of kepler.gl for saving to a file.
 *
 * See also: https://docs.kepler.gl/docs/api-reference/advanced-usages/saving-loading-w-schema
 */
import React from 'react';
import { Icons } from '@kepler.gl/components';
import {useDispatch, useSelector} from "react-redux";
import {selectAuthenticated} from "../components/user/userSlice";
import {openScenarioCreateModal} from "./simulations/store/simulationSlice";

export const SaveAsScenarioButton = () => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectAuthenticated)
    const visState = useSelector((state: any) => state?.demo?.keplerGl?.map?.visState);

    const onClick = async () => {
        try {
            dispatch(openScenarioCreateModal())
        } catch (err) {
            console.error('Encountered an error: ', err)
        }
    };

    if (isAuthenticated && visState && visState.layers && visState?.layers.length === 2) {
        return (
            <button onClick={onClick} title={"Save changes as a new scenario"}>
                <Icons.Save2/>
                Save As...
            </button>
        );
    } else {
        return null;
    }
};