/**
 * Getting the current state of kepler.gl for saving to a file.
 *
 * See also: https://docs.kepler.gl/docs/api-reference/advanced-usages/saving-loading-w-schema
 */
import React from 'react';
import { Icons } from '@kepler.gl/components';
import { saveAs } from 'file-saver';
import {SimulationParameters} from "../../models/SimulationParameters";
import {SimulationInputsFactory} from "../../services/SimulationInputsFactory";
import {useSelector} from "react-redux";
import {selectIsProjectImmerseon} from "../../../user/userSlice";

export const DownloadChangesButton = () =>{
    const changes = useSelector((state: any) => state.demo.undoRedo.changes);
    const visState = useSelector((state: any) => state?.demo?.keplerGl?.map?.visState);
    const isProjectImmerseon = useSelector(selectIsProjectImmerseon);
    const isScenarioLoaded = visState?.layers?.length > 0 && (visState?.layers[0]?.id === "road_network" || visState?.layers[0]?.id === "grid");

    const onClick = async () => {
        try {
            const simulationInput = SimulationInputsFactory.build(changes, new SimulationParameters(), isProjectImmerseon);
            saveAs(new Blob([JSON.stringify(simulationInput, null, 2)], {type: "application/json"}), `${changes.scenarioName}.json`);
        } catch (err) {
            console.error('Encountered an error: ', err)
        }
    };

    if (isScenarioLoaded) {
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