import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {openSimulationConfigModal} from "../store/simulationSlice";
import {Icons} from "@kepler.gl/components";
import {selectAuthenticated, isDefaultScenario} from "../../user/userSlice";

export const StartSimulationButton = () => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectAuthenticated);
    const visState = useSelector((state: any) => state?.demo?.keplerGl?.map?.visState);
    const isDefaultScenarioId = useSelector(isDefaultScenario);
    const isScenarioLoaded = visState?.layers?.length > 0 && (visState?.layers[0]?.id === "road_network" || visState?.layers[0]?.id === "grid");

    const onClick = () => {
        dispatch(openSimulationConfigModal())
    }

    if (isAuthenticated && isScenarioLoaded) {
        return (<button onClick={onClick} disabled={isDefaultScenarioId} title={isDefaultScenarioId ?
            "Cannot start a simulation on the default scenario, create a new scenario with Save As" :
            "Run a simulation on the current scenario"}>
            <Icons.Play/>Start Simulation...
        </button>)
    } else {
        return null;
    }
}
