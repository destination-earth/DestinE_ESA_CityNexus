// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import React from 'react';
import styled from 'styled-components';

import {UIStateActions, VisStateActions, ActionHandler} from '@kepler.gl/actions';
import {Datasets} from '@kepler.gl/table';
import {AddDataButtonFactory, DatasetSectionFactory, SourceDataCatalogFactory} from "@kepler.gl/components";

type DatasetSectionProps = {
  datasets: Datasets;
  showDatasetList?: boolean;
  showDeleteDataset?: boolean;
  showDatasetTable: ActionHandler<typeof VisStateActions.showDatasetTable>;
  updateTableColor: ActionHandler<typeof VisStateActions.updateTableColor>;
  removeDataset: ActionHandler<typeof UIStateActions.openDeleteModal>;
  showAddDataModal: () => void;
};

const StyledDatasetTitle = styled.div<{showDatasetList?: boolean}>`
  line-height: ${props => props.theme.sidePanelTitleLineHeight};
  font-weight: 400;
  letter-spacing: 1.25px;
  color: ${props => props.theme.subtextColor};
  font-size: 11px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => (props.showDatasetList ? '16px' : '4px')};
`;

const StyledDatasetSection = styled.div`
  border-bottom: 1px solid ${props => props.theme.sidePanelBorderColor};
`;

CustomDatasetSectionFactory.deps = DatasetSectionFactory.deps;

function CustomDatasetSectionFactory(
  SourceDataCatalog: ReturnType<typeof SourceDataCatalogFactory>,
  AddDataButton: ReturnType<typeof AddDataButtonFactory>
) {
  const DatasetSection: React.FC<DatasetSectionProps> = props => {
    const {
      datasets,
      showDatasetTable,
      updateTableColor,
      showDeleteDataset,
      removeDataset,
      showDatasetList,
    } = props;

    return (
      <StyledDatasetSection>
        {showDatasetList && (
          <SourceDataCatalog
            datasets={datasets}
            showDatasetTable={showDatasetTable}
            updateTableColor={updateTableColor}
            removeDataset={removeDataset}
            showDeleteDataset={showDeleteDataset}
          />
        )}
      </StyledDatasetSection>
    );
  };

  return DatasetSection;
}

export default function replaceDatasetSection() {
  return [DatasetSectionFactory, CustomDatasetSectionFactory];
}