import {updateVisData} from '@kepler.gl/actions';
import {Checkbox, Icons, MapPopoverFactory, RootContext, withState} from '@kepler.gl/components';
import { LAYER_TYPES } from '@kepler.gl/constants';
import { parseGeoJsonRawFeature } from '@kepler.gl/layers';
import {generateHashId} from '@kepler.gl/utils';
import Tippy from '@tippyjs/react/headless';
import React, {useState} from 'react';
import styled from 'styled-components';
import {FormattedMessage} from "@kepler.gl/localization";
import {idToPolygonGeo} from "@kepler.gl/utils";
import {RoadTypes} from "../features/simulations/models/RoadTypes";

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

export const StyledDivider = styled.div`
    // offset divider to reach popover edge
    margin-left: -14px;
    margin-right: -14px;
    border-bottom: 1px solid ${props => props.theme.panelBorderColor};
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

const RoadTypeCheckbox = ({ onToggleRoadTypeFilter, selectedRoadTypes, roadType }) => {
    return (
        <div style={{padding: '5px 10px'}}>
            <Checkbox id={roadType} label={RoadTypes[roadType]} value={roadType}
                      onChange={() => {
                          onToggleRoadTypeFilter(roadType);
                      }} checked={selectedRoadTypes.indexOf(roadType) !== -1}/>
        </div>
    )
};

const RoadTypeDropdown = ({onToggleRoadTypeFilter, selectedRoadTypes}) => {
    const [isOpen, setIsOpen] = useState(false);
    const nbRoadTypes = selectedRoadTypes.length;

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const roadTypeTemplate = Object.keys(RoadTypes).map((roadType) =>
        <RoadTypeCheckbox onToggleRoadTypeFilter={onToggleRoadTypeFilter} selectedRoadTypes={selectedRoadTypes} key={roadType} roadType={roadType} />
    );

    return (
        <div>
            <button onClick={toggleDropdown}>
                {selectedRoadTypes.length === 0 ? "Edit all road types" : `${nbRoadTypes} road type${nbRoadTypes === 1 ? "" : "s"} selected`}
            </button>
            {isOpen && (
                <div style={{ border: '1px solid #3A414C', padding: '10px', position: 'absolute', backgroundColor: '#29323C', zIndex: 1 }}>
                    {roadTypeTemplate}
                </div>
            )}
        </div>
    );
};

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
        onToggleLayer,
        customToggle,
        onToggleRoadTypeFilter,
        selectedRoadTypes
    }) => {
        const [horizontalPlacement, setHorizontalPlacement] = useState('start');
        const moveLeft = () => setHorizontalPlacement('end');
        const moveRight = () => setHorizontalPlacement('start');

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
                                    {Array.isArray(layerHoverProp?.data) && layerHoverProp.nbLayers == 2 ?
                                        <>
                                            <Checkbox id="toggleGridRoads" label="Toggle grid/roads selection"
                                                      checked={customToggle} onChange={onToggleLayer}/>
                                            {customToggle ? <RoadTypeDropdown
                                                onToggleRoadTypeFilter={onToggleRoadTypeFilter}
                                                selectedRoadTypes={selectedRoadTypes} /> : null}
                                            <StyledDivider/>
                                        </> : null}
                                    <MapPopoverContent
                                        coordinate={coordinate}
                                        zoom={zoom}
                                        layerHoverProp={layerHoverProp}
                                    />
                                </PopoverContent>
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
