import React from 'react';

import {useDispatch, useSelector} from "react-redux";
import {openConfigureVisualizationModal} from "./store/ConfigureVisualizationSlice";

export const ConfigureVisualizationButton = () => {
    const dispatch = useDispatch();
    const visState = useSelector((state: any) => state?.demo?.keplerGl?.map?.visState);
    const isPredictionLoaded = visState?.layers?.length > 0 && visState?.layers[0]?.id.startsWith('prediction_');

    const onClick = async () => {
        try {
            dispatch(openConfigureVisualizationModal())
        } catch (err) {
            console.error('Encountered an error: ', err)
        }
    };

     if (isPredictionLoaded && visState?.layers?.length > 0) {
        return (
            <button onClick={onClick} title={"Configure"}>
                Configure
            </button>
        );
    } else {
        return null;
    }
};