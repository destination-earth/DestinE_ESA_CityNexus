import React, {useEffect, useState} from 'react';
import ErrorBoundary from "@kepler.gl/components/dist/common/error-boundary";
import {setFilter} from "@kepler.gl/actions";
import {useDispatch, useSelector} from "react-redux";
import {DataRow, getViewportFromMapState} from "@kepler.gl/utils";
import {CompareType, Field, InteractionConfig, TooltipField} from "@kepler.gl/types";
import {Layer} from "@kepler.gl/layers";
import {LayersToRender} from "@kepler.gl/reducers";
import {Datasets} from "@kepler.gl/table";
import {EDITOR_LAYER_ID} from "@kepler.gl/constants";
import {AggregationLayerHoverData} from "@kepler.gl/reducers/dist/layer-utils";
import {highlightSelectedFeature} from "../../actions";
import {setSelectedIndexes} from "../../features/undo-redo/store/UndoRedoReducer";

function _getHoverXY(viewport, lngLat) {
    const screenCoord = !viewport || !lngLat ? null : viewport.project(lngLat);
    return screenCoord && {x: screenCoord[0], y: screenCoord[1]};
}

export declare type LayerHoverProp = {
    data: DataRow | DataRow[] | AggregationLayerHoverData | null;
    fields: Field[];
    fieldsToShow: TooltipField[];
    layer: Layer;
    changes: any;
    nbLayers?: number;
    primaryData?: DataRow | DataRow[] | AggregationLayerHoverData | null;
    compareType?: CompareType;
};

function getLayerHoverProp({
                               interactionConfig,
                               hoverInfo,
                               layers,
                               layersToRender,
                               datasets,
                               selectedLayerIdx,
                               selectedRoadTypes
                           }: {
    interactionConfig: InteractionConfig;
    hoverInfo: any;
    layers: Layer[];
    layersToRender: LayersToRender;
    datasets: Datasets;
    selectedLayerIdx: number;
    selectedRoadTypes: string[];
}): LayerHoverProp | null {
    const nbLayers = layers.length;
    if (hoverInfo.layer?.id === EDITOR_LAYER_ID) {
        let layer;
        if (selectedLayerIdx != null) {
            layer = layers[selectedLayerIdx];
        } else {
            layer = layers[0];
        }

        const {
            config: {dataId}
        } = layer;
        if (!dataId) {
            return null;
        }
        const {dataContainer, fields, filteredIndex} = datasets[dataId];
        let data: DataRow[] = [];
        for (const index of filteredIndex) {
            const row = dataContainer.row(index);
            if (row !== null) {
                data.push(row);
            }
        }

        if (!data.values()) {
            return null;
        }

        const fieldsToShow = interactionConfig.tooltip.config.fieldsToShow[dataId];

        return {
            data,
            fields,
            fieldsToShow,
            layer,
            nbLayers
        };
    } else if (interactionConfig.tooltip.enabled && hoverInfo && hoverInfo.picked) {
        // if anything hovered
        const {object, layer: overlay} = hoverInfo;

        // deckgl layer to kepler-gl layer
        const layer = layers[overlay.props.idx];

        // NOTE: for binary format GeojsonLayer, deck will return object=null but hoverInfo.index >= 0
        if (
            (object || hoverInfo.index >= 0) &&
            layer &&
            layer.getHoverData &&
            layersToRender[layer.id]
        ) {
            // if layer is visible and have hovered data
            const {
                config: {dataId}
            } = layer;
            if (!dataId) {
                return null;
            }
            const {dataContainer, fields} = datasets[dataId];
            let data: DataRow | null = layer.getHoverData(
                object || hoverInfo.index,
                dataContainer,
                fields
            );
            if (!data) {
                return null;
            }

            const fieldsToShow = interactionConfig.tooltip.config.fieldsToShow[dataId];

            return {
                data,
                fields,
                fieldsToShow,
                layer,
                nbLayers
            };
        }
    }

    return null;
}

const MapPopoverContainer = ({
                                 commonProp,
                                 compareMode,
                                 onSetFeatures,
                                 setSelectedFeature,
                                 featureCollection,
                                 layersToRenderSelector,
                                 MapPopover
                             }) => {
    const state = useSelector((state: any) => state?.demo?.keplerGl?.map);
    const isGridToggled = useSelector(state => state.demo.undoRedo.isGridToggled);
    const selectedRoadTypes = useSelector(state => state.demo.undoRedo.selectedRoadTypes);
    const [localIsGridToggled, setLocalIsGridToggled] = useState(isGridToggled);
    const dispatch = useDispatch();
    const isScenarioLoaded = state.visState?.layers?.length > 0 && (state.visState?.layers[0]?.id === "road_network" || state.visState?.layers[0]?.id === "grid");

    const {
        mapState,
        visState: {
            hoverInfo,
            clicked,
            datasets,
            interactionConfig,
            layers,
            mousePos: {mousePosition, coordinate, pinned}
        }
    } = state;
    const layersToRender = layersToRenderSelector(state);
    const selectedFeature = state.visState.editor.selectedFeature;

    let selectedFilterIdx: number;
    let unselectedLayerIdx: number;
    let selectedLayerIdx: number;
    let unselectedLayerId: string;
    let selectedLayerId: string;
    if (selectedFeature && isScenarioLoaded) {
        selectedLayerId = state.visState.filters[0].dataId[0];
        selectedFilterIdx = state.visState.filters.findIndex((f) => f.value.id === selectedFeature.id);
        unselectedLayerIdx = state.visState.layers.findIndex((l) => l.id !== selectedLayerId);
        selectedLayerIdx = state.visState.layers.findIndex((l) => l.id === selectedLayerId);
        unselectedLayerId = state.visState.layers[unselectedLayerIdx].id;
    }

    // Effect to update the component when isGridToggled or selectedRoadTypes changes
    useEffect(() => {
        if (isScenarioLoaded) {
            if (selectedLayerIdx >= 0) {
                if (isGridToggled !== localIsGridToggled) {
                    setLocalIsGridToggled(isGridToggled);
                    dispatch(setFilter(selectedFilterIdx, "layerId", [unselectedLayerId]));
                    dispatch(setSelectedIndexes(state.visState.datasets[unselectedLayerId].filteredIndex));
                    dispatch(highlightSelectedFeature(layers[unselectedLayerIdx]));
                } else {
                    dispatch(setFilter(selectedFilterIdx, "layerId", [selectedLayerId]));
                    dispatch(setSelectedIndexes(state.visState.datasets[selectedLayerId].filteredIndex));
                    dispatch(highlightSelectedFeature(layers[selectedLayerIdx]));
                }
            } else {
                // if there is no selected layer it means the selected feature was deleted
                // so we need to reset isGridToggled and close the popover
                if (isGridToggled !== localIsGridToggled) {
                    setLocalIsGridToggled(isGridToggled);
                }
                commonProp.onClose();
            }
        }
    }, [selectedRoadTypes, isGridToggled]);

    const layerHoverProp = getLayerHoverProp({
        interactionConfig,
        hoverInfo,
        layers,
        layersToRender,
        datasets,
        selectedLayerIdx,
        selectedRoadTypes
    });

    let pinnedPosition = {x: 0, y: 0};
    let layerPinnedProp: LayerHoverProp | null = null;

    if (pinned || clicked) {
        // project lnglat to screen so that tooltip follows the object on zoom
        const viewport = getViewportFromMapState(mapState);
        const lngLat = clicked ? clicked.coordinate : pinned.coordinate;
        pinnedPosition = _getHoverXY(viewport, lngLat);
        layerPinnedProp = getLayerHoverProp({
            interactionConfig,
            hoverInfo: clicked,
            layers,
            layersToRender,
            datasets,
            selectedLayerIdx,
            selectedRoadTypes
        });
        if (layerHoverProp && layerPinnedProp) {
            layerHoverProp.primaryData = layerPinnedProp.data;
            layerHoverProp.compareType = interactionConfig.tooltip.config.compareType;
        }
    }

    function renderMapPopover(props) {
        return (
            <MapPopover
                {...props}
                {...commonProp}
                onSetFeatures={onSetFeatures}
                setSelectedFeature={setSelectedFeature}
                featureCollection={featureCollection}
            />
        );
    }

    const shouldRenderPopover = (prop, isPinned) =>
        prop && (!layerPinnedProp || compareMode || isPinned);

    return (
        <ErrorBoundary>
            {shouldRenderPopover(layerPinnedProp, true) &&
                renderMapPopover({
                    ...pinnedPosition,
                    layerHoverProp: layerPinnedProp,
                    coordinate: interactionConfig.coordinate.enabled && (pinned || {}).coordinate,
                    frozen: true,
                    isBase: compareMode
                })}
            {shouldRenderPopover(layerHoverProp, false) &&
                renderMapPopover({
                    x: mousePosition[0],
                    y: mousePosition[1],
                    layerHoverProp: layerHoverProp,
                    coordinate: interactionConfig.coordinate.enabled && coordinate,
                    frozen: false
                })}
        </ErrorBoundary>
    );
};

export default MapPopoverContainer;