import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {openSimulationConfigModal} from "../store/simulationSlice";
import {Icons} from "@kepler.gl/components";
import {selectAuthenticated} from "../../../components/user/userSlice";

export const StartSimulationButton = () => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectAuthenticated);
    const visState = useSelector((state: any) => state?.demo?.keplerGl?.map?.visState);
    const disabled = useSelector((state: any) =>
        state?.demo?.keplerGl?.map?.visState?.changes?.scenarioId === "default_scenario");

    const onClick = () => {
        dispatch(openSimulationConfigModal())
    }

    if (isAuthenticated && visState?.layers && visState?.layers.length === 2) {
        return (<button onClick={onClick} disabled={disabled} title={disabled ?
            "Cannot start a simulation on the default scenario, create a new scenario with Save As" :
            "Run a simulation on the current scenario"}>
            <Icons.Play/>Start Simulation...
        </button>)
    } else {
        return null;
    }
}
