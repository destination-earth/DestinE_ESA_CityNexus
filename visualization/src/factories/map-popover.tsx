import { updateVisData } from '@kepler.gl/actions';
import { Icons, MapPopoverFactory, RootContext, withState } from '@kepler.gl/components';
import { LAYER_TYPES } from '@kepler.gl/constants';
import { parseGeoJsonRawFeature } from '@kepler.gl/layers';
import { generateHashId } from '@kepler.gl/utils';
import Tippy from '@tippyjs/react/headless';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

const SELECTABLE_LAYERS = [LAYER_TYPES.hexagonId, LAYER_TYPES.geojson];
const MAX_WIDTH = 500;
const MAX_HEIGHT = 600;

const StyledMapPopover = styled.div`
  display: flex;
  flex-direction: column;
  max-width: ${MAX_WIDTH}px;
  max-height: ${MAX_HEIGHT}px;
  padding: 14px;
  & > * + * {
    margin-top: 6px;
  }
  ${props => props.theme.scrollBar};
  font-family: ${props => props.theme.fontFamily};
  font-size: 11px;
  font-weight: 500;
  background-color: ${props => props.theme.panelBackground};
  color: ${props => props.theme.textColor};
  z-index: 1000;
  overflow-x: auto;
  box-shadow: ${props => props.theme.panelBoxShadow};

  :hover {
    background-color: ${props => `${props.theme.panelBackground}dd`};
  }

  .primary-label {
    color: ${props => props.theme.notificationColors.success};
    font-size: 10px;
  }

  .map-popover__layer-info,
  .coordingate-hover-info {
    & > * + * {
      margin-top: 7px;
    }
  }

  table {
    width: auto;
    display: grid;
    border-collapse: collapse;
    row-gap: 5px;
    column-gap: 5px;
  }

  .coordingate-hover-info > table {
    grid-template-columns: auto auto auto;
  }
  .map-popover__layer-info > table {
    grid-template-columns: auto auto;
  }

  tbody,
  tr {
    display: contents;
  }

  td {
    border-color: transparent;
    color: ${props => props.theme.textColor};
  }

  td.row__value {
    text-align: right;
    font-weight: 500;
    color: ${props => props.theme.textColorHl};
  }
`;

const PinnedButtons = styled.div`
  display: flex;
  align-self: center;
  align-items: center;
  justify-items: center;
  & > * + * {
    margin-left: 10px;
  }
`;

const PopoverContent = styled.div`
  display: flex;
  flex-direction: column;
  & > * + * {
    margin-top: 12px;
  }
`;

const StyledIcon = styled.div`
  color: ${props => props.theme.activeColor};

  :hover {
    cursor: pointer;
    color: ${props => props.theme.linkBtnColor};
  }
`;

const StyledSelectGeometry = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.theme.textColorHl};
  svg {
    margin-right: 6px;
  }

  :hover {
    cursor: pointer;
    color: ${props => props.theme.linkBtnColor};
  }
`;

CustomMapPopoverFactory.deps = [
    ...MapPopoverFactory.deps
];

function createVirtualReference(container, x, y, size = 0) {
    const bounds =
        container && container.getBoundingClientRect ? container.getBoundingClientRect() : {};
    const left = (bounds.left || 0) + x - size / 2;
    const top = (bounds.top || 0) + y - size / 2;
    return {
        left,
        top,
        right: left + size,
        bottom: top + size,
        width: size,
        height: size,
        // These properties are present to meet the DOMRect interface
        y: top,
        x: left,
        toJSON() {
            return this;
        }
    };
}

function getOffsetForPlacement({ placement, reference, popper }, gap = 20) {
    switch (placement) {
        case 'top-start':
        case 'bottom-start':
            return [gap, gap];
        case 'top-end':
        case 'bottom-end':
            return [-gap, gap];
        default:
            return [0, 0];
    }
}

export function getSelectedFeature(layerHoverProp) {
    const layer = layerHoverProp?.layer;
    let fieldIdx;
    let selectedFeature;
    switch (layer?.type) {
        case LAYER_TYPES.hexagonId:
            fieldIdx = layer.config?.columns?.hex_id?.fieldIdx;
            selectedFeature = idToPolygonGeo({ id: layerHoverProp?.data?.[fieldIdx] }, { isClosed: true });
            break;
        case LAYER_TYPES.geojson:
            fieldIdx = layer.config?.columns?.geojson?.fieldIdx;
            selectedFeature = parseGeoJsonRawFeature(layerHoverProp?.data?.[fieldIdx]);
            break;
        default:
            break;
    }

    return {
        ...selectedFeature,
        // unique id should be assigned to features in the editor
        id: generateHashId(8)
    };
}

function CustomMapPopoverFactory(MapPopoverContent, ...deps) {

    const MapPopoverWrapper = ({
        x,
        y,
        frozen,
        coordinate,
        layerHoverProp,
        isBase,
        zoom,
        container,
        onClose,
        instanceState,
        updateVisData
    }) => {
        const [horizontalPlacement] = useState('start');
        const moveLeft = () => setHorizontalPlacement('end');
        const moveRight = () => setHorizontalPlacement('start');

        const onSetRoadType = useCallback((roadType) => {
            layerHoverProp.layer.dataContainer._rows[layerHoverProp.data._rowIndex][4] = roadType;
            updateVisData(instanceState.visState, {
                datasets: {
                    data: {
                        fields: layerHoverProp.fields,
                        rows: layerHoverProp.data._dataContainer._rows
                    }
                }
            });
        }, []);

        return (
            <RootContext.Consumer>
                {context => (
                    <Tippy
                        popperOptions={{
                            modifiers: [
                                {
                                    name: 'preventOverflow',
                                    options: {
                                        boundary: container
                                    }
                                }
                            ]
                        }}
                        zIndex={98} /* should be below side panel's z-index of 99  */
                        visible={true}
                        interactive={true}
                        // @ts-ignore
                        getReferenceClientRect={() => createVirtualReference(container, x, y)}
                        // @ts-ignore
                        placement={`bottom-${horizontalPlacement}`}
                        // @ts-ignore
                        offset={getOffsetForPlacement}
                        appendTo={context?.current || document.body}
                        render={attrs => (
                            <StyledMapPopover {...attrs} className="map-popover">
                                {frozen ? (
                                    <PinnedButtons>
                                        {horizontalPlacement === 'start' && (
                                            <StyledIcon className="popover-arrow-left" onClick={moveLeft}>
                                                <Icons.ArrowLeft />
                                            </StyledIcon>
                                        )}
                                        <StyledIcon className="popover-pin" onClick={onClose}>
                                            <Icons.Pin height="16px" />
                                        </StyledIcon>
                                        {horizontalPlacement === 'end' && (
                                            <StyledIcon className="popover-arrow-right" onClick={moveRight}>
                                                <Icons.ArrowRight />
                                            </StyledIcon>
                                        )}
                                        {isBase && (
                                            <div className="primary-label">
                                                <FormattedMessage id="mapPopover.primary" />
                                            </div>
                                        )}
                                    </PinnedButtons>
                                ) : null}
                                <PopoverContent>
                                    <MapPopoverContent
                                        coordinate={coordinate}
                                        zoom={zoom}
                                        layerHoverProp={layerHoverProp}
                                    />
                                </PopoverContent>
                                {layerHoverProp?.layer?.type &&
                                    SELECTABLE_LAYERS.includes(layerHoverProp?.layer?.type) &&
                                    frozen ? (
                                    <>
                                        <StyledSelectGeometry className="select-tunnel" onClick={() => onSetRoadType('tunnel_road')}>
                                            <Icons.CursorPoint />
                                            Tunnel road
                                        </StyledSelectGeometry>
                                        <StyledSelectGeometry className="select-none" onClick={() => onSetRoadType('no_road')}>
                                            <Icons.CursorPoint />
                                            No road
                                        </StyledSelectGeometry>
                                        <StyledSelectGeometry className="select-surface" onClick={() => onSetRoadType('surface_road')}>
                                            <Icons.CursorPoint />
                                            Surface road
                                        </StyledSelectGeometry>
                                    </>
                                ) : null}
                            </StyledMapPopover>
                        )}
                    />
                )}
            </RootContext.Consumer>
        );
    };

    return withState(
        [],
        state => ({ instanceState: state.demo.keplerGl.map }),
        { updateVisData }
    )(MapPopoverWrapper);
}

export function replaceMapPopover() {
    return [MapPopoverFactory, CustomMapPopoverFactory];
}
