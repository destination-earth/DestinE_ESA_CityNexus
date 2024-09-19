/**
 * Getting the current state of kepler.gl for saving to a file.
 *
 * See also: https://docs.kepler.gl/docs/api-reference/advanced-usages/saving-loading-w-schema
 */
import React from 'react';
import { Icons } from '@kepler.gl/components';
import { saveAs } from 'file-saver';
import {SimulationParameters} from "./simulations/models/SimulationParameters";
import {SimulationInputsFactory} from "./simulations/services/SimulationInputsFactory";
import {useSelector} from "react-redux";

export const DownloadChangesButton = () =>{
    const changes = useSelector((state: any) => state.undoRedo.changes);
    const visState = useSelector((state: any) => state?.demo?.keplerGl?.map?.visState);

    const onClick = async () => {
        try {
            const simulationInput = SimulationInputsFactory.build(changes, new SimulationParameters());
            saveAs(new Blob([JSON.stringify(simulationInput, null, 2)], {type: "application/json"}), `simulationInput_${visState.changes.scenarioName}.json`);
        } catch (err) {
            console.error('Encountered an error: ', err)
        }
    };

    if (visState && visState.layers && visState?.layers.length === 2) {
        return (
            <button onClick={onClick} title={"Download the changes made to the default scenario"}>
                <Icons.Save/>
                Download Changes
            </button>
        );
    } else {
        return null;
    }
};