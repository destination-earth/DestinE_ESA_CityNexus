// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {format} from 'd3-format';
import {LoadingDialog} from '@kepler.gl/components';
import {FormattedMessage} from 'react-intl';
import {useSelector} from "react-redux";
import {
  roleToProjectName,
  selectCurrentScenarioId,
  selectProjectTypes, selectSelectedProjectType,
  selectUsername,
  selectUserToken
} from "../user/userSlice";
import PredictionScenarioGallery from "./prediction-gallery";
import {DATA_URL} from "../../constants/default-settings";
import {DownloadScenarioButton} from "../../features/DownloadScenarioButton";

const numFormat = format(',');

const StyledSampleGallery = styled.div`
  display: grid;
  grid-auto-flow: row dense;
  grid-template-columns: repeat(3, 1fr);
`;

const StyledSampleMap = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.textColorLT};
  line-height: 22px;
  max-width: 480px;

  .sample-map {
    padding: 5px;
    position: relative;
  }

  .sample-map.selected {
    background-color: #e4e4e4;
    border-radius: 5px 5px 0 0;
  }

  .sample-map__image {
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 12px;
    opacity: 0.9;
    transition: opacity 0.4s ease;
    position: relative;
    line-height: 0;

    img {
      max-width: 100%;
    }
  }

  .sample-map__size {
    font-size: 12px;
    font-weight: 400;
    line-height: 24px;
  }

  :hover {
    .sample-map__image__caption {
      opacity: 0.8;
      transition: opacity 0.4s ease;
    }
  }
`;

const StyledTableRow = styled.div`
  grid-column: 1 / -1; /* Span the entire row */
  background-color: #e4e4e4;
`

const StyledImageCaption = styled.div`
  color: ${props => props.theme.labelColorLT};
  font-size: 11px;
  font-weight: 400;
  line-height: 16px;
  margin-top: 10px;
  opacity: 0;
`;

const StyledError = styled.div`
  color: red;
  font-size: 14px;
  margin-bottom: 16px;
`;

const SampleMapButtons = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  top: 0;
  left: 0;
  bottom: 10px;
  right: 10px;
  flex-direction: column;
  justify-content: right;
  align-items: self-end;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  opacity: 0.8;
  transition: opacity 0.4s ease;

  button {
    display: inline-block;
    padding: 8px 10px;
    margin: 10px auto 0;
    font-size: 14px;
    justify-self: center;
    font-weight: 600;
    width: 130px;
    border: solid black;
    border-radius: 5px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    text-decoration: none;
  }
`;

const UtilityButtons = styled(SampleMapButtons)`
  background-color: rgba(0, 0, 0, 0);
  margin-top: 10px;
`

const WhatIfScenarioGallery = ({
  sampleMaps,
  predictionMaps,
  onLoadScenario,
  onLoadPrediction,
  error,
  isMapLoading,
  locale,
  loadSampleConfigurations,
  loadPredictionConfigurations
}) => {
  const userId = useSelector(selectUserToken);
  const username = useSelector(selectUsername);
  const scenarioId = useSelector(selectCurrentScenarioId);
  const [showTable, setShowTable] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [refresh, setRefresh] = useState(null);
  const [isProjectChoiceDisabled, setIsProjectChoiceDisabled] = useState(false);
  const projectTypes = useSelector(selectProjectTypes);
  const selectedProjectType = useSelector(selectSelectedProjectType);
  const [selectedProject, setSelectedProject] = useState(selectedProjectType);

  useEffect(() => {
    loadSampleConfigurations(userId);
    loadPredictionConfigurations(userId);

    // The cleanest way I found to modify the title without overriding half of the kepler.gl code is to modify the DOM directly
    const modalTitleElement = document.querySelector('.modal--title');
    if (modalTitleElement) {
        // If user has access to only one project, update text content
        if (projectTypes.length === 1 || isProjectChoiceDisabled) {
            modalTitleElement.textContent = `${roleToProjectName[projectTypes[selectedProject].project]} - ${username ? username : "Guest User"}`;
        // If user has access to multiple projects, render a combobox
        } else if (projectTypes.length > 1) {
            // Define the inner HTML for the modal title element
          // TODO figure out how to change styling of button to match Reload button
          // TODO also have the elements centered horizontally and stacked vertically
            modalTitleElement.innerHTML = `
                <label for="project-select">Please select a project:</label>
                <select id="project-select">
                    ${projectTypes.map((projectType, index) => 
                        `<option value="${index}">${roleToProjectName[projectType.project]}</option>`
                    ).join('')}
                </select>
                <SampleMapButtons>
                    <button id="submit-button" type="button">Submit</button>
                </SampleMapButtons>
            `;

            // Get the dynamically created elements
            const selectElement = document.getElementById('project-select');
            const submitButton = document.getElementById('submit-button');

            // Set the initial selected project
            selectElement.value = selectedProject;
            selectElement.disabled = isProjectChoiceDisabled; // Initially enable or disable combobox

            // Event listener for the submit button
            submitButton.addEventListener('click', () => {
                setSelectedProject(selectElement.value); // Set selected project when submit is clicked
                setIsProjectChoiceDisabled(true);        // Disable the combobox
                selectElement.disabled = true;           // Disable combobox in DOM
                submitButton.disabled = true;            // Disable the submit button after submission
            });
        }
    }
  }, [userId, isProjectChoiceDisabled]);

  useEffect(() => {
    if (refresh) {
      loadSampleConfigurations(userId);
      loadPredictionConfigurations(userId);
      setRefresh(false);
    }
  }, [refresh]);

  const handleShowResults = (index) => {
    setShowTable(index === showTable ? null : index);
  }

  const handleMouseEnter = (index) => {
    setHoveredCell(index);
  }

  const handleMouseLeave = () => {
    setHoveredCell(null);
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${DATA_URL}/scenarios/${id}`, {
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

  return isProjectChoiceDisabled  && (
    <div className="sample-data-modal">
      {error ? (
        <StyledError>{error.message}</StyledError>
      ) : isMapLoading ? (
        <LoadingDialog size={64} />
      ) : (
        <StyledSampleGallery className="sample-map-gallery">
          <StyledSampleMap id="default-sample" className="sample-map-gallery__item">
            <div className="sample-map">
              <UtilityButtons className="sample-map__buttons">
                <button onClick={() => setRefresh(true)}>Reload</button>
              </UtilityButtons>
            </div>
          </StyledSampleMap>
          {sampleMaps
              .filter(sp => sp.visible && sp.project === projectTypes[selectedProject].project)
              .map((sp, index) => {
                const isCurrentScenarioId = sp.id === scenarioId;
                const isDefaultScenarioId = sp.id === "default_scenario";
                const isHovered = hoveredCell === index;
                const isTableShown = showTable === index;

                let tooltipText = "Delete scenario";
                if (isDefaultScenarioId) {
                  tooltipText = "Cannot delete default scenario"
                } else if (isCurrentScenarioId) {
                  tooltipText = "Cannot delete currently loaded scenario"
                }

                return (
                    <React.Fragment key={index}>
                      <StyledSampleMap id={sp.id} className="sample-map-gallery__item"
                                       onMouseEnter={() => handleMouseEnter(index)}
                                       onMouseLeave={handleMouseLeave}>
                        <div
                            className={`sample-map ${isTableShown ? 'selected' : ''}`}>
                          <div className="sample-map__image">
                            {sp.imageUrl && <img src={sp.imageUrl} alt="Sample Map"/>}
                          </div>
                          <div className="sample-map__title">{sp.label}</div>
                          <div className="sample-map__size">
                            {isDefaultScenarioId ? <FormattedMessage
                                id={'sampleDataViewer.rowCount'}
                                values={{rowCount: numFormat(sp.size)}}
                            /> : <FormattedMessage
                                id={`${numFormat(sp.size)} changes`}
                            />}
                          </div>
                          <StyledImageCaption className="sample-map__image__caption">
                            {sp.description}
                          </StyledImageCaption>
                          {isHovered && <SampleMapButtons className="sample-map__buttons">
                            <button onClick={() => handleDelete(sp.id)}
                                    disabled={isDefaultScenarioId || isCurrentScenarioId}
                                    title={tooltipText}>Delete
                            </button>
                            <button onClick={() => onLoadScenario(sp, userId)}>Load Scenario</button>
                            <DownloadScenarioButton item={sp} userId={userId} />
                            <button onClick={() => handleShowResults(index)}>Show Results</button>
                          </SampleMapButtons>}
                        </div>
                      </StyledSampleMap>
                      <StyledTableRow>
                        {isTableShown &&
                            <PredictionScenarioGallery className="table-row" predictionMaps={predictionMaps}
                                                       onLoadPrediction={onLoadPrediction}
                                                       scenarioId={sp.id}
                                                       error={error}
                                                       isMapLoading={isMapLoading}
                                                       locale={locale}
                                                       setRefresh={setRefresh}/>}
                      </StyledTableRow>
                    </React.Fragment>
                )
              })}
        </StyledSampleGallery>
      )}
    </div>
  );
};

WhatIfScenarioGallery.propTypes = {
  sampleMaps: PropTypes.arrayOf(PropTypes.object),
  predictionMaps: PropTypes.arrayOf(PropTypes.object),
  onLoadScenario: PropTypes.func.isRequired,
  onLoadPrediction: PropTypes.func.isRequired,
  loadSampleConfigurations: PropTypes.func.isRequired,
  loadPredictionConfigurations: PropTypes.func.isRequired,
  error: PropTypes.object
};

export default WhatIfScenarioGallery;
