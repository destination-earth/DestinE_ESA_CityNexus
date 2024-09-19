// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import React, {useCallback, useRef, useState} from 'react';
import styled from 'styled-components';
import {FormattedMessage} from '@kepler.gl/localization';

import {Table} from '@kepler.gl/layers';
import {rgbToHex} from '@kepler.gl/utils';
import {RGBColor} from '@kepler.gl/types';
import {StyledDatasetTitleProps, ShowDataTableProps} from './types';
import { ArrowRight } from '@kepler.gl/components/dist/common/icons';
import {
    CenterFlexbox,
    CustomPicker,
    DatasetTagFactory, DatasetTitleFactory, DatasetTitleProps,
    Portaled,
    Tooltip
} from '@kepler.gl/components';

const StyledDatasetTitle = styled.div<StyledDatasetTitleProps>`
  color: ${props => props.theme.textColor};
  display: flex;
  align-items: flex-start;

  .source-data-arrow {
    height: 16px;
  }
  :hover {
    cursor: ${props => (props.clickable ? 'pointer' : 'auto')};

    .dataset-name {
      color: ${props => (props.clickable ? props.theme.textColorHl : props.theme.textColor)};
    }

    .dataset-action {
      color: ${props => props.theme.textColor};
      opacity: 1;
    }

    .dataset-action:hover {
      color: ${props => props.theme.textColorHl};
    }
  }
`;

const DataTagAction = styled.div`
  margin-left: 12px;
  height: 16px;
  opacity: 0;
`;

type MiniDataset = {
  id: string;
  color: RGBColor;
  label?: string;
};

const ShowDataTable = ({id, showDatasetTable}: ShowDataTableProps) => (
  <DataTagAction className="dataset-action show-data-table" data-tip data-for={`data-table-${id}`}>
    <Table
      height="16px"
      onClick={e => {
        e.stopPropagation();
        showDatasetTable?.(id);
      }}
    />
    <Tooltip id={`data-table-${id}`} effect="solid">
      <span>
        <FormattedMessage id={'datasetTitle.showDataTable'} />
      </span>
    </Tooltip>
  </DataTagAction>
);

CustomDatasetTitleFactory.deps = [DatasetTagFactory];

export default function CustomDatasetTitleFactory(
  DatasetTag: ReturnType<typeof DatasetTagFactory>
): React.FC<DatasetTitleProps> {
  const DatasetTitle: React.FC<DatasetTitleProps> = ({
    showDatasetTable,
    showDeleteDataset,
    onTitleClick,
    removeDataset,
    dataset,
    updateTableColor
  }) => {
    const [displayColorPicker, setDisplayColorPicker] = useState(false);
    const root = useRef(null);
    const datasetId = dataset.id;
    const _handleClick = useCallback(() => {
      setDisplayColorPicker(!displayColorPicker);
    }, [setDisplayColorPicker, displayColorPicker]);

    const _handleClosePicker = useCallback(() => {
      setDisplayColorPicker(false);
    }, [setDisplayColorPicker]);
    const _handleCustomPicker = useCallback(
      (color: {rgb: Record<string, number>}) => {
        updateTableColor(datasetId, [color.rgb.r, color.rgb.g, color.rgb.b]);
      },
      [updateTableColor, datasetId]
    );

    const _onClickTitle = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (typeof onTitleClick === 'function') {
          onTitleClick();
        } else if (typeof showDatasetTable === 'function') {
          showDatasetTable(datasetId);
        }
      },
      [onTitleClick, showDatasetTable, datasetId]
    );

    return (
      <div className="custom-palette-panel" ref={root}>
        <StyledDatasetTitle
          className="source-data-title"
          clickable={Boolean(showDatasetTable || onTitleClick)}
        >
          <DatasetTag
            dataset={dataset}
            onClick={_onClickTitle}
            updateTableColor={updateTableColor}
            onClickSquare={_handleClick}
          />
          <Portaled
            isOpened={displayColorPicker !== false}
            left={110}
            top={-50}
            onClose={_handleClosePicker}
          >
            <CustomPicker
              color={rgbToHex(dataset.color)}
              onChange={_handleCustomPicker}
              onSwatchClose={_handleClosePicker}
            />
          </Portaled>
          {showDatasetTable ? (
            <CenterFlexbox className="source-data-arrow">
              <ArrowRight height="12px" />
            </CenterFlexbox>
          ) : null}
          {showDatasetTable ? (
            <ShowDataTable id={datasetId} showDatasetTable={showDatasetTable} />
          ) : null}
        </StyledDatasetTitle>
      </div>
    );
  };

  return DatasetTitle;
}

export function replaceDatasetTitle() {
    return [DatasetTitleFactory, CustomDatasetTitleFactory];
}