// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {format} from 'd3-format';
import {LoadingDialog} from '@kepler.gl/components';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from "react-redux";
import {
  selectCurrentScenarioId,
  selectSelectedCityName,
  selectAvailableCities,
  selectSelectedProjectTypeString,
  selectUsername,
  selectUserToken,
  setSelectedCityType,
  setAvailableCities,
  selectSelectedProjectTypeFormattedString, selectSelectedCityType, selectIsProjectImmerseon
} from "../user/userSlice";
import PredictionScenarioGallery from "./prediction-gallery";
import {DATA_URL} from "../../constants/default-settings";
import {DownloadScenarioButton} from "../simulations/components/buttons/DownloadScenarioButton";

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

  button, select {
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
  onLoadXai,
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
  const availableCities = useSelector(selectAvailableCities);
  const selectedCityType = useSelector(selectSelectedCityType);
  const [selectedCityIndex, setSelectedCityIndex] = useState(selectedCityType);
  const selectedCityName = useSelector(selectSelectedCityName);
  const selectedProjectName = useSelector(selectSelectedProjectTypeString);
  const selectedProjectNameFormatted = useSelector(selectSelectedProjectTypeFormattedString);
  const isProjectImmerseon = useSelector(selectIsProjectImmerseon);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setAvailableCities([...new Set(sampleMaps.map(s => s?.city).filter(Boolean))]));
  }, [sampleMaps]);

  useEffect(() => {
    dispatch(setSelectedCityType(selectedCityIndex));
    const title = (selectedProjectName === "citynexus" && selectedCityName) ?
        `${selectedProjectNameFormatted} - ${selectedCityName.charAt(0).toUpperCase() + selectedCityName.slice(1)}`
        : selectedProjectNameFormatted
    document.title = `${title} - Prototype`
    loadSampleConfigurations(userId, selectedProjectName);
    loadPredictionConfigurations(userId);

    // The cleanest way I found to modify the title without overriding half of the kepler.gl code is to modify the DOM directly
    const modalTitleElement = document.querySelector('.modal--title');
    if (modalTitleElement) {
      modalTitleElement.textContent = `${title} - ${username || "Guest User"}`;
    }
  }, [selectedProjectName, selectedCityName, selectedCityIndex, userId]);

  useEffect(() => {
    if (refresh) {
      loadSampleConfigurations(userId, selectedProjectName);
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

  if (error) {
    return (
        <div className="sample-data-modal">
          <StyledError>{error.message}</StyledError>
        </div>
    )
  } else if (isMapLoading) {
    return (
        <div className="sample-data-modal">
          <LoadingDialog size={64}/>
        </div>
    )
  } else {
    return (
        <div className="sample-data-modal">
          <StyledSampleGallery className="sample-map-gallery">
            <StyledSampleMap id="default-sample" className="sample-map-gallery__item">
              <div className="sample-map">
                <UtilityButtons className="sample-map__buttons">
                  {!isProjectImmerseon && <select
                      id="project-select"
                      value={selectedCityIndex}
                      onChange={(e) => setSelectedCityIndex(Number(e.target.value))}
                      required
                  >
                    <option value="" disabled>Select a project</option>
                    {availableCities.map((cityName, index) => (
                        <option key={cityName} value={index}>
                          {cityName.charAt(0).toUpperCase() + cityName.slice(1)}
                        </option>
                    ))}
                  </select>}
                  <button onClick={() => setRefresh(true)}>Reload</button>
                </UtilityButtons>
              </div>
            </StyledSampleMap>
            {sampleMaps // only select the scenarios that belong to the selected city or, if the selected project is immerseon, all immerseon scenarios
                .filter(sp => sp.visible && (sp.city === selectedCityName || (isProjectImmerseon && sp.project === 'immerseon')))
                .map((sp, index) => {
                  const isCurrentScenarioId = sp.id === scenarioId;
                  const isOriginalDefaultScenarioId = sp.id === `${selectedCityName}_default` || sp.id === 'immerseon';
                  const isDefaultScenarioId = sp.id.startsWith(selectedCityName) || sp.id === 'immerseon';
                  const isHovered = hoveredCell === index;
                  const isTableShown = showTable === index;

                  let tooltipText = "Delete scenario";
                  if (isDefaultScenarioId) {
                    tooltipText = "Cannot delete default scenario"
                  } else if (isCurrentScenarioId) {
                    tooltipText = "Cannot delete currently loaded scenario"
                  }

                  return (
                      <React.Fragment key={sp.id}>
                        <StyledSampleMap id={sp.id} className="sample-map-gallery__item"
                                         onMouseEnter={() => handleMouseEnter(index)}
                                         onMouseLeave={handleMouseLeave}>
                          <div className={`sample-map ${isTableShown ? 'selected' : ''}`}>
                            <div className="sample-map__image">
                              <img
                                  src={`desp/assets/${selectedProjectName === 'immerseon' ? selectedProjectName : selectedCityName}.jpg`}
                                  alt="Sample Map"/>
                            </div>
                            <div className="sample-map__title">{sp.label}</div>
                            <div className="sample-map__size">
                              {isOriginalDefaultScenarioId ? <FormattedMessage
                                  id={'sampleDataViewer.rowCount'}
                                  values={{rowCount: numFormat(sp.size)}}
                              /> : <span>{numFormat(sp.size)} changes</span>}
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
                              <DownloadScenarioButton item={sp} userId={userId}/>
                              <button onClick={() => handleShowResults(index)}>Show Results</button>
                            </SampleMapButtons>}
                          </div>
                        </StyledSampleMap>
                        <StyledTableRow>
                          {isTableShown &&
                              <PredictionScenarioGallery className="table-row" predictionMaps={predictionMaps}
                                                         onLoadPrediction={onLoadPrediction}
                                                         onLoadXai={onLoadXai}
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
        </div>
    )
  }
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column', // Stack elements vertically
    alignItems: 'center', // Center horizontally
    justifyContent: 'center', // Center vertically (optional)
    gap: '15px', // Space between elements
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    width: '300px', // Adjust width to fit your needs
    margin: '0 auto', // Horizontally center the form
  },
  select: {
    width: '100%', // Full width of the form
    padding: '8px',
    fontSize: '16px',
  },
  button: {
    display: 'inline-block',
    padding: '8px 10px',
    margin: '10px auto 0',
    fontSize: '14px',
    justifySelf: 'center',
    fontWeight: '600',
    width: '130px',
    border: 'solid black',
    borderRadius: '5px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    textDecoration: 'none',
  }
};

WhatIfScenarioGallery.propTypes = {
  sampleMaps: PropTypes.arrayOf(PropTypes.object),
  predictionMaps: PropTypes.arrayOf(PropTypes.object),
  onLoadXai: PropTypes.func.isRequired,
  onLoadScenario: PropTypes.func.isRequired,
  onLoadPrediction: PropTypes.func.isRequired,
  loadSampleConfigurations: PropTypes.func.isRequired,
  loadPredictionConfigurations: PropTypes.func.isRequired,
  error: PropTypes.object
};

export default WhatIfScenarioGallery;
