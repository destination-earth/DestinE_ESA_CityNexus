// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import React from 'react';
import styled from 'styled-components';
import {format} from 'd3-format';
import {FormattedMessage} from '@kepler.gl/localization';
import {DatasetInfoFactory, DatasetInfoProps} from "@kepler.gl/components";

const numFormat = format(',');

const StyledDataRowCount = styled.div`
  font-size: 11px;
  color: ${props => props.theme.subtextColor};
  padding-left: 19px;
`;

const timeSlotOptions = {
    0: '0-3h',
    3: '3-6h',
    6: '6-9h',
    9: '9-12h',
    12: '12-15h',
    15: '15-18h',
    18: '18-21h',
    21: '21-0h'
}

function CustomDatasetInfoFactory() {
  const DatasetInfo: React.FC<DatasetInfoProps> = ({dataset}: DatasetInfoProps) => {
      const isPredictionLoaded = dataset.id.startsWith('prediction_');
      const isXaiLoaded = !isPredictionLoaded && dataset.metadata.xaiConfig !== undefined;

      return (
          <>
              <StyledDataRowCount className="source-data-rows">
                  <FormattedMessage
                      id={'datasetInfo.metadata'}
                      values={{label: "City", value: dataset.metadata.city[0].toUpperCase() + dataset.metadata.city.slice(1)}}
                  />
              </StyledDataRowCount>
              {isPredictionLoaded && (
                  <>
                      <StyledDataRowCount className="source-data-rows">
                          <FormattedMessage
                              id={'datasetInfo.metadata'}
                              values={{label: "Day type", value: dataset.metadata.dayType}}
                          />
                      </StyledDataRowCount>
                      <StyledDataRowCount className="source-data-rows">
                          <FormattedMessage
                              id={'datasetInfo.metadata'}
                              values={{label: "Time slots", value: dataset.metadata.timeSlot?.map(slot => timeSlotOptions[slot] || slot).join(', ')}}
                          />
                      </StyledDataRowCount>
                      <StyledDataRowCount className="source-data-rows">
                          <FormattedMessage
                              id={'datasetInfo.metadata'}
                              values={{label: "Bicycle", value: `${dataset.metadata.bicyclePercentage * 100}%`}}
                          />
                      </StyledDataRowCount>
                      <StyledDataRowCount className="source-data-rows">
                          <FormattedMessage
                              id={'datasetInfo.metadata'}
                              values={{label: "e-vehicle", value: `${dataset.metadata.eVehiclePercentage * 100}%`}}
                          />
                      </StyledDataRowCount>
                  </>
              )}
              {isXaiLoaded && (
                  <>
                      <StyledDataRowCount className="source-data-rows">
                          <FormattedMessage
                              id={'datasetInfo.metadata'}
                              values={{label: "Day type", value: dataset.metadata.xaiConfig.day_type}}
                          />
                      </StyledDataRowCount>
                      <StyledDataRowCount className="source-data-rows">
                          <FormattedMessage
                              id={'datasetInfo.metadata'}
                              values={{label: "Time slot", value: timeSlotOptions[dataset.metadata.xaiConfig.time_slot] || dataset.metadata.xaiConfig.time_slot}}
                          />
                      </StyledDataRowCount>
                      <StyledDataRowCount className="source-data-rows">
                          <FormattedMessage
                              id={'datasetInfo.metadata'}
                              values={{label: "Attribute", value: dataset.metadata.xaiConfig.attribute}}
                          />
                      </StyledDataRowCount>
                  </>
              )}
              <StyledDataRowCount className="source-data-rows">
                  <FormattedMessage
                      id={'datasetInfo.rowCount'}
                      values={{rowCount: numFormat(dataset.dataContainer.numRows())}}
                  />
              </StyledDataRowCount>
          </>
      )
  }

  return DatasetInfo;
}

export function replaceDatasetInfo() {
    return [DatasetInfoFactory, CustomDatasetInfoFactory];
}