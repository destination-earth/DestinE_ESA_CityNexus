// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {LoadingDialog} from '@kepler.gl/components';
import Select from 'react-select';

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
        cursor: pointer;
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }

    th {
        background-color: #f2f2f2;
    }

    th:hover {
        background-color: #ddd;
    }

    tr:hover {
        background-color: #f8f8f8;
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


function SortableFilterableTable({data, onLoadSample}) {
    const [sortConfig, setSortConfig] = useState({key: null, direction: 'ascending'});
    const [timeSlotFilter, setTimeSlotFilter] = useState([]);
    const [dayTypeFilter, setDayTypeFilter] = useState({weekday: true, weekend: true});

    const sortTable = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({key, direction});
    };

    const filteredData = () => {
        return data.filter(item => {
            if (!dayTypeFilter.weekday && item.dayType === 'weekday') return false;
            if (!dayTypeFilter.weekend && item.dayType === 'weekend') return false;
            if (timeSlotFilter.length > 0 && !timeSlotFilter.includes(item.timeSlot)) return false;
            return true;
        });
    };

    const sortedData = () => {
        const sorted = [...filteredData()];
        sorted.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        return sorted;
    };

    const handleTimeSlotFilterChange = (selectedOptions) => {
        setTimeSlotFilter(selectedOptions.map(option => option.value));
    };

    const handleDayTypeFilterChange = (event) => {
        const {name, checked} = event.target;
        setDayTypeFilter(prevFilters => ({
            ...prevFilters,
            [name]: checked,
        }));
    };

    const timeSlotOptions = [
        {value: '0-3h', label: '0-3h'},
        {value: '3-6h', label: '3-6h'},
        {value: '6-9h', label: '6-9h'},
        {value: '9-12h', label: '9-12h'},
        {value: '12-15h', label: '12-15h'},
        {value: '15-18h', label: '15-18h'},
        {value: '18-21h', label: '18-21h'},
        {value: '21-0h', label: '21-0h'}
    ]
    return (
        <div>
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
                    <th onClick={() => sortTable('id')}>ID</th>
                    <th onClick={() => sortTable('date')}>Date</th>
                    <th onClick={() => sortTable('timeSlot')}>Time Slot</th>
                    <th onClick={() => sortTable('dayType')}>Day Type</th>
                </tr>
                </thead>
                <tbody>
                {sortedData().map((item, index) => (
                    <tr key={index} onClick={() => onLoadSample(item)}>
                        <td>{item.id}</td>
                        <td>{item.date}</td>
                        <td>{item.timeSlot}</td>
                        <td>{item.dayType}</td>
                    </tr>
                ))}
                </tbody>
            </StyledTable>
        </div>
    );
}


const PredictionScenarioGallery = ({
                                       predictionMaps,
                                       onLoadSample,
                                       error,
                                       isMapLoading,
                                       locale,
                                       loadPredictionConfigurations
                                   }) => {
    useEffect(() => {
        if (!predictionMaps.length) {
            loadPredictionConfigurations();
        }
    }, [predictionMaps, loadPredictionConfigurations]);

    return (
        <div className="sample-data-modal">
            {error ? (
                <StyledError>{error.message}</StyledError>
            ) : isMapLoading ? (
                <LoadingDialog size={64}/>
            ) : (
                <SortableFilterableTable className="sample-map-gallery" data={predictionMaps.filter(sp => sp.visible)}
                                         onLoadSample={onLoadSample}/>
            )}
        </div>
    );
};

PredictionScenarioGallery.propTypes = {
    predictionMaps: PropTypes.arrayOf(PropTypes.object),
    onLoadSample: PropTypes.func.isRequired,
    loadPredictionConfigurations: PropTypes.func.isRequired,
    error: PropTypes.object
};

export default PredictionScenarioGallery;
