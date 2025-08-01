import {Icons} from "@kepler.gl/components";
import React from "react";
import {DATA_URL} from "../../../../constants/default-settings";
import {useSelector} from "react-redux";
import {selectAvailableCities, selectSelectedProjectTypeString} from "../../../user/userSlice";

const handleDelete = async (item, userId, setRefresh) => {
    const { id, dayType } = item;
    try {
        const response = await fetch(`${DATA_URL}/predictions/${id}?day_type=${dayType}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${userId}`
            }
        });

        if (response.ok) {
            // Remove the item with the corresponding id from filteredSampleMaps
            setRefresh(true);
        } else {
            console.error('Failed to delete scenario');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

function isPredictionDefaultScenario(item) {
    const scenarioId = item.scenarioId;
    const availableCities = useSelector(selectAvailableCities);
    const selectedProject = useSelector(selectSelectedProjectTypeString);

    const isAvailableCity = availableCities.some(city => scenarioId.startsWith(city));
    const isProjectType = selectedProject === scenarioId;

    return isAvailableCity || isProjectType;
}

export const DeleteSimulationButton = ({item, userId, setRefresh}) => {
    const isDefaultScenarioId = isPredictionDefaultScenario(item);

    let tooltipText = "Delete simulation";
    if (isDefaultScenarioId) {
      tooltipText = "Cannot delete simulations of default scenario"
    }

    return (
        <button className={"empty-table empty-table-button"}
                onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering row click event
                    handleDelete(item, userId, setRefresh);
                }}
                disabled={isDefaultScenarioId}
                title={tooltipText}
        >
            <Icons.Delete/>
        </button>
    )
}