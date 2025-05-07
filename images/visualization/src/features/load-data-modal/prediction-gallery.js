// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import React, {useState} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {LoadingDialog} from '@kepler.gl/components';
import Select from 'react-select';
import {useSelector} from "react-redux";
import {selectSelectedProject, selectUserToken} from "../user/userSlice";
import {DeleteSimulationButton} from "../simulations/components/buttons/DeleteSimulationButton";
import {DownloadSimulationButton} from "../simulations/components/buttons/DownloadSimulationButton";
import {DownloadXaiButton} from "../simulations/components/buttons/DownloadXaiButton";


const StyledError = styled.div`
    color: red;
    font-size: 14px;
    margin-bottom: 16px;
`;

const StyledTable = styled.table`
    border-collapse: collapse;
    width: 100%;

    th,
    td {
        border: 1px solid #000;
        padding: 8px;
        text-align: left;
    }

    th {
        cursor: pointer;
        background-color: #cacaca;
    }

    th:hover {
        background-color: #ddd;
    }

    .clickable {
        cursor: pointer;
    }

    .not-clickable {
        cursor: not-allowed;
    }

    tr:hover {
        background-color: #d2d2d2;
    }
    
    .empty-table {
        border: 0;
        background: none;
        cursor: default;
    }
    
    .empty-table-button {
        cursor: pointer;
    }
`;


const StyledFilterContainer = styled.div`
    display: flex;
    align-items: center; /* Align items vertically */
    margin-bottom: 20px;

    div {
        margin-right: 10px; /* Adjust margin between items */
    }
`;

const StyledPredictionTable = styled.div`
    width: fit-content;
    padding: 10px;
`

function SortableFilterableTable({predictionMaps, onLoadPrediction, onLoadXai, scenarioId, userId, setRefresh}) {
    const [sortConfig, setSortConfig] = useState({key: null, direction: 'ascending'});
    const [timeSlotFilter, setTimeSlotFilter] = useState([]);
    const [dayTypeFilter, setDayTypeFilter] = useState({weekday: true, weekend: true});
    const [processingStatusFilter, setProcessingStatusFilter] = useState([]);
    const projectType = useSelector(selectSelectedProject);

    const sortTable = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({key, direction});
    };

    const handleTimeSlotFilterChange = (selectedOptions) => {
        setTimeSlotFilter(selectedOptions.map(option => option.value));
    };

    const handleProcessingStatusFilterChange = (selectedOptions) => {
        setProcessingStatusFilter(selectedOptions.map(option => option.value));
    };

    const handleDayTypeFilterChange = (event) => {
        const {name, checked} = event.target;
        setDayTypeFilter(prevFilters => ({
            ...prevFilters,
            [name]: checked,
        }));
    };

    const timeSlotOptions = [
        {value: '0', label: '0-3h'},
        {value: '3', label: '3-6h'},
        {value: '6', label: '6-9h'},
        {value: '9', label: '9-12h'},
        {value: '12', label: '12-15h'},
        {value: '15', label: '15-18h'},
        {value: '18', label: '18-21h'},
        {value: '21', label: '21-0h'}
    ]
    const processingStatusOptions = [
        {value: 'DONE', label: 'Done'},
        {value: 'PENDING', label: 'Pending'},
        {value: 'ERROR', label: 'Error'},
    ]

    const predictionList = predictionMaps
        .filter(sp => sp.visible && sp.project === projectType.project)
        .filter(item => {
            if (scenarioId !== item.scenarioId) return false;
            if (!dayTypeFilter.weekday && item.dayType === 'weekday') return false;
            if (!dayTypeFilter.weekend && item.dayType === 'weekend') return false;
            if (timeSlotFilter.length > 0 && !timeSlotFilter.includes(item.timeSlot)) return false;
            if (processingStatusFilter.length > 0 && !processingStatusFilter.includes(item.processingStatus)) return false;
            return true;
        }).sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

    return (
        <StyledPredictionTable>
            <StyledFilterContainer>
                <div className="filter-item">
                    Time Slot Filter:
                </div>
                <div className="filter-item">
                    <Select
                        options={timeSlotOptions}
                        onChange={handleTimeSlotFilterChange}
                        isSearchable={true}
                        isClearable={true}
                        isMulti
                    />
                </div>
                <div className="filter-item">
                    Processing Status Filter:
                </div>
                <div className="filter-item">
                    <Select
                        options={processingStatusOptions}
                        onChange={handleProcessingStatusFilterChange}
                        isSearchable={true}
                        isClearable={true}
                        isMulti
                    />
                </div>
                <div className="filter-item">
                    <label>
                        <input
                            type="checkbox"
                            name="weekday"
                            checked={dayTypeFilter.weekday}
                            onChange={handleDayTypeFilterChange}
                        />
                        Weekday
                    </label>
                </div>
                <div className="filter-item">
                    <label>
                        <input
                            type="checkbox"
                            name="weekend"
                            checked={dayTypeFilter.weekend}
                            onChange={handleDayTypeFilterChange}
                        />
                        Weekend
                    </label>
                </div>
            </StyledFilterContainer>
            <StyledTable className="sortable-table">
                <thead>
                <tr>
                    <th onClick={() => sortTable('name')}>Name</th>
                    <th onClick={() => sortTable('date')}>Date</th>
                    <th onClick={() => sortTable('timeSlot')}>Time Slot</th>
                    <th onClick={() => sortTable('dayType')}>Day Type</th>
                    <th onClick={() => sortTable('eVehiclePercentage')}>e-Vehicle %</th>
                    <th onClick={() => sortTable('bicyclePercentage')}>Bicycle %</th>
                    <th onClick={() => sortTable('processingStatus')}>Processing Status</th>
                    <th className={"empty-table"}></th>
                </tr>
                </thead>
                <tbody>
                {predictionList.flatMap((item, index) => {
                        const timeSlots = item.timeSlot.map(slot => {
                            const option = timeSlotOptions.find(option => option.value == slot);
                            return option ? option.label : slot;
                        }).join(', ');
                        const isProcessingDone = item.processingStatus === 'DONE';

                        const baseRow = (
                            <tr key={index} className={isProcessingDone ? 'clickable' : 'not-clickable'}
                                onClick={isProcessingDone ? () => onLoadPrediction(item, userId) : null}>
                                <td>{item.name ? item.name : "No name"}</td>
                                <td>{item.date}</td>
                                <td>{timeSlots}</td>
                                <td>{item.dayType}</td>
                                <td>{item.eVehiclePercentage}</td>
                                <td>{item.bicyclePercentage}</td>
                                <td>{item.processingStatus}</td>
                                <td className={"empty-table"}>
                                    <DeleteSimulationButton item={item}
                                                            userId={userId}
                                                            setRefresh={setRefresh}/>
                                    <DownloadSimulationButton item={item}
                                                              userId={userId}/>
                                </td>
                            </tr>
                        )

                        const xaiRow = item.xaiConfig ? (
                            <tr key={index + "_xai"} className={isProcessingDone ? 'clickable' : 'not-clickable'}
                                onClick={isProcessingDone ? () => onLoadXai(item, userId) : null}>
                                <td>{item.name ? `${item.name} (XAI)` : "No name (XAI)"}</td>
                                <td>{item.date}</td>
                                <td>{timeSlotOptions.find(option => option.value == item.xaiConfig.time_slot)?.label}</td>
                                <td>{item.xaiConfig.day_type}</td>
                                <td>{item.eVehiclePercentage}</td>
                                <td>{item.bicyclePercentage}</td>
                                <td>{item.processingStatus}</td>
                                <td className={"empty-table"}>
                                    <DownloadXaiButton item={item}
                                                      userId={userId}
                                                      projectType={projectType}/>
                                </td>
                            </tr>
                        ) : null;

                        return xaiRow ? [baseRow, xaiRow] : [baseRow];
                        }
                    )}
                </tbody>
            </StyledTable>
        </StyledPredictionTable>
    );
}


const PredictionScenarioGallery = ({
                                       predictionMaps,
                                       onLoadPrediction,
                                       onLoadXai,
                                       scenarioId,
                                       error,
                                       isMapLoading,
                                       locale,
                                       setRefresh
                                   }) => {
    const userId = useSelector(selectUserToken);

    return (
        <div>
            {error ? (
                <StyledError>{error.message}</StyledError>
            ) : isMapLoading ? (
                <LoadingDialog size={64}/>
            ) : (
                <SortableFilterableTable className="sample-map-gallery" predictionMaps={predictionMaps}
                                         scenarioId={scenarioId} setRefresh={setRefresh} onLoadXai={onLoadXai}
                                         onLoadPrediction={onLoadPrediction} userId={userId}/>
            )}
        </div>
    );
};

PredictionScenarioGallery.propTypes = {
    predictionMaps: PropTypes.arrayOf(PropTypes.object),
    onLoadPrediction: PropTypes.func.isRequired,
    error: PropTypes.object
};

export default PredictionScenarioGallery;
