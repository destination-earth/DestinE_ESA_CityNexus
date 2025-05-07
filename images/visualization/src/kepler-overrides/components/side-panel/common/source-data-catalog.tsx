// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import React from 'react';
import styled from 'styled-components';

import {
  DatasetInfoFactory,
  DatasetTitleFactory, SidePanelSection,
  SourceDataCatalogFactory,
  SourceDataCatalogProps
} from "@kepler.gl/components";

const SourceDataCatalogWrapper = styled.div`
  transition: ${props => props.theme.transition};
`;

CustomSourceDataCatalogFactory.deps = SourceDataCatalogFactory.deps;

function CustomSourceDataCatalogFactory(
  DatasetTitle: ReturnType<typeof DatasetTitleFactory>,
  DatasetInfo: ReturnType<typeof DatasetInfoFactory>
) {
  const SourceDataCatalog: React.FC<SourceDataCatalogProps> = ({
    datasets,
    showDatasetTable,
    removeDataset,
    onTitleClick,
    updateTableColor,
    showDeleteDataset = false
  }: SourceDataCatalogProps) => (
    <SourceDataCatalogWrapper className="source-data-catalog">
      {Object.values(datasets).map(dataset => (
        <SidePanelSection key={dataset.id}>
          <DatasetTitle
            showDatasetTable={showDatasetTable}
            showDeleteDataset={showDeleteDataset}
            removeDataset={removeDataset}
            dataset={dataset}
            onTitleClick={onTitleClick}
            updateTableColor={updateTableColor}
          />
          {showDatasetTable ? <DatasetInfo dataset={dataset} /> : null}
        </SidePanelSection>
      ))}
    </SourceDataCatalogWrapper>
  );

  return SourceDataCatalog;
}

export function replaceSourceDataCatalogFactory() {
    return [SourceDataCatalogFactory, CustomSourceDataCatalogFactory];
}
