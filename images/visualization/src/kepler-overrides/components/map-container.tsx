// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

// libraries
import React, {Component, createRef} from 'react';
import { connect } from 'react-redux';
import styled, {withTheme} from 'styled-components';
import {Map} from 'react-map-gl/maplibre';
import {PickInfo} from '@deck.gl/core/lib/deck';
import DeckGL from '@deck.gl/react';
import {createSelector, Selector} from 'reselect';
import maplibregl from 'maplibre-gl';
import {useDroppable} from '@dnd-kit/core';

// components

// utils
import {
    generateMapboxLayers,
    updateMapboxLayers,
    LayerBaseConfig,
    VisualChannelDomain,
    EditorLayerUtils
} from '@kepler.gl/layers';
import {SplitMap, SplitMapLayers} from '@kepler.gl/types';
import {
    errorNotification,
    setLayerBlending,
    isStyleUsingMapboxTiles,
    transformRequest,
    observeDimensions,
    unobserveDimensions,
    getMapLayersFromSplitMaps,
    onViewPortChange,
    getViewportFromMapState,
    normalizeEvent,
    rgbToHex,
    computeDeckEffects
} from '@kepler.gl/utils';

// default-settings
import {
    FILTER_TYPES,
    GEOCODER_LAYER_ID,
    THROTTLE_NOTIFICATION_TIME,
    DEFAULT_PICKING_RADIUS,
    NO_MAP_ID,
    EMPTY_MAPBOX_STYLE,
    EDITOR_LAYER_ID
} from '@kepler.gl/constants';

// Contexts
import {LOCALE_CODES} from '@kepler.gl/localization';
import {MapView} from '@deck.gl/core';
import {
    computeDeckLayers,
    prepareLayersForDeck,
    prepareLayersToRender,
    LayersToRender
} from '@kepler.gl/reducers';
import {VisState} from '@kepler.gl/schemas';
import {
    Attribution,
    EditorFactory,
    MapContainerFactory, MapContainerProps,
    MapControlFactory,
    MapPopoverFactory,
    MapViewStateContext, StyledMapContainer
} from "@kepler.gl/components";
import ErrorBoundary from "@kepler.gl/components/dist/common/error-boundary";
import debounce from 'lodash.debounce';
import MapPopoverContainer from "./map-popover-container";

// Debounce the propagation of viewport change and mouse moves to redux store.
// This is to avoid too many renders of other components when the map is
// being panned/zoomed (leading to laggy basemap/deck syncing).
const DEBOUNCE_VIEWPORT_PROPAGATE = 10;
const DEBOUNCE_MOUSE_MOVE_PROPAGATE = 10;

/** @type {{[key: string]: React.CSSProperties}} */
const MAP_STYLE: {[key: string]: React.CSSProperties} = {
    container: {
        display: 'inline-block',
        position: 'relative',
        width: '100%',
        height: '100%'
    },
    top: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
    }
};

const LOCALE_CODES_ARRAY = Object.keys(LOCALE_CODES);

interface StyledMapContainerProps {
    mixBlendMode?: string;
}

const StyledMap = styled(StyledMapContainer)<StyledMapContainerProps>(
    ({mixBlendMode = 'normal'}) => `
  #default-deckgl-overlay {
    mix-blend-mode: ${mixBlendMode};
  };
  *[maplibregl-children] {
    position: absolute;
  }
`
);

const mapStateToProps = (state) => ({
    selectedRoadTypes: state.demo.undoRedo.selectedRoadTypes,
    isGridToggled: state.demo.undoRedo.isGridToggled
});

const MAPBOXGL_STYLE_UPDATE = 'style.load';
const MAPBOXGL_RENDER = 'render';
const nop = () => {};

const MapLibreLogo = () => (
    <div className="attrition-logo">
        Basemap by:
        <a
            style={{marginLeft: "5px"}}
            className="maplibregl-ctrl-logo"
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.maplibre.org/"
            aria-label="MapLibre logo"
        />
    </div>
);

interface StyledDroppableProps {
    isOver: boolean;
}

const StyledDroppable = styled.div<StyledDroppableProps>`
  background-color: ${props => (props.isOver ? props.theme.dndOverBackgroundColor : 'none')};
  width: 100%;
  height: 100%;
  position: absolute;
  pointer-events: none;
  z-index: 1;
`;

export const isSplitSelector = props =>
    props.visState.splitMaps && props.visState.splitMaps.length > 1;

export const Droppable = ({containerId}) => {
    const {isOver, setNodeRef} = useDroppable({
        id: containerId,
        data: {type: DROPPABLE_MAP_CONTAINER_TYPE, index: containerId},
        disabled: !containerId
    });

    return <StyledDroppable ref={setNodeRef} isOver={isOver} />;
};

CustomMapContainerFactory.deps = MapContainerFactory.deps;

type PropSelector<R> = Selector<MapContainerProps, R>;

function CustomMapContainerFactory(
    MapPopover: ReturnType<typeof MapPopoverFactory>,
    MapControl: ReturnType<typeof MapControlFactory>,
    Editor: ReturnType<typeof EditorFactory>
): React.ComponentType<MapContainerProps> {
    class MapContainer extends Component<MapContainerProps> {
        displayName = 'MapContainer';

        static contextType = MapViewStateContext;

        declare context: React.ContextType<typeof MapViewStateContext>;

        static defaultProps = {
            MapComponent: Map,
            deckGlProps: {},
            index: 0,
            primary: true
        };

        constructor(props) {
            super(props);
            this.state = {
                // Determines whether attribution should be visible based the result of loading the map style
                showMapboxAttribution: true,
                localSelectedRoadTypes: props.selectedRoadTypes,
                localIsGridToggled: props.isGridToggled
            };
        }

        componentDidMount() {
            if (!this._ref.current) {
                return;
            }
            observeDimensions(this._ref.current, this._handleResize);
        }

        componentWillUnmount() {
            // unbind mapboxgl event listener
            if (this._map) {
                this._map?.off(MAPBOXGL_STYLE_UPDATE, nop);
                this._map?.off(MAPBOXGL_RENDER, nop);
            }
            if (!this._ref.current) {
                return;
            }
            unobserveDimensions(this._ref.current);
        }

        componentDidUpdate(prevProps) {
            // This triggers a re-render required for the road type highlighting feature
            if (prevProps.selectedRoadTypes !== this.props.selectedRoadTypes) {
                this.setState({ localSelectedRoadTypes: this.props.selectedRoadTypes });
            }
            if (prevProps.isGridToggled !== this.props.isGridToggled) {
                this.setState({ localIsGridToggled: this.props.isGridToggled });
            }
        }

        _deck: any = null;
        _map: maplibregl.Map | null = null;
        _ref = createRef<HTMLDivElement>();
        _deckGLErrorsElapsed: {[id: string]: number} = {};

        previousLayers = {
            // [layers.id]: mapboxLayerConfig
        };

        _handleResize = dimensions => {
            const {primary, index} = this.props;
            if (primary) {
                const {mapStateActions} = this.props;
                if (dimensions && dimensions.width > 0 && dimensions.height > 0) {
                    mapStateActions.updateMap(dimensions, index);
                }
            }
        };

        layersSelector: PropSelector<VisState['layers']> = props => props.visState.layers;
        layerDataSelector: PropSelector<VisState['layers']> = props => props.visState.layerData;
        splitMapSelector: PropSelector<SplitMap[]> = props => props.visState.splitMaps;
        splitMapIndexSelector: PropSelector<number | undefined> = props => props.index;
        mapLayersSelector: PropSelector<SplitMapLayers | null | undefined> = createSelector(
            this.splitMapSelector,
            this.splitMapIndexSelector,
            getMapLayersFromSplitMaps
        );
        layerOrderSelector: PropSelector<VisState['layerOrder']> = props => props.visState.layerOrder;
        layersToRenderSelector: PropSelector<LayersToRender> = createSelector(
            this.layersSelector,
            this.layerDataSelector,
            this.mapLayersSelector,
            prepareLayersToRender
        );
        layersForDeckSelector = createSelector(
            this.layersSelector,
            this.layerDataSelector,
            prepareLayersForDeck
        );
        filtersSelector = props => props.visState.filters;
        polygonFiltersSelector = createSelector(this.filtersSelector, filters =>
            filters.filter(f => f.type === FILTER_TYPES.polygon && f.enabled !== false)
        );
        featuresSelector = props => props.visState.editor.features;
        selectedFeatureSelector = props => props.visState.editor.selectedFeature;
        featureCollectionSelector = createSelector(
            this.polygonFiltersSelector,
            this.featuresSelector,
            (polygonFilters, features) => ({
                type: 'FeatureCollection',
                features: features.concat(polygonFilters.map(f => f.value))
            })
        );
        selectedPolygonIndexSelector = createSelector(
            this.featureCollectionSelector,
            this.selectedFeatureSelector,
            (collection, selectedFeature) =>
                collection.features.findIndex(f => f.id === selectedFeature?.id)
        );
        selectedFeatureIndexArraySelector = createSelector(
            (value: number) => value,
            value => {
                return value < 0 ? [] : [value];
            }
        );

        generateMapboxLayerMethodSelector = props => props.generateMapboxLayers ?? generateMapboxLayers;

        mapboxLayersSelector = createSelector(
            this.layersSelector,
            this.layerDataSelector,
            this.layerOrderSelector,
            this.layersToRenderSelector,
            this.generateMapboxLayerMethodSelector,
            (layer, layerData, layerOrder, layersToRender, generateMapboxLayerMethod) =>
                generateMapboxLayerMethod(layer, layerData, layerOrder, layersToRender)
        );

        // merge in a background-color style if the basemap choice is NO_MAP_ID
        // used by <StyledMap> inline style prop
        mapStyleTypeSelector = props => props.mapStyle.styleType;
        mapStyleBackgroundColorSelector = props => props.mapStyle.backgroundColor;
        styleSelector = createSelector(
            this.mapStyleTypeSelector,
            this.mapStyleBackgroundColorSelector,
            (styleType, backgroundColor) => ({
                ...MAP_STYLE.container,
                ...(styleType === NO_MAP_ID ? {backgroundColor: rgbToHex(backgroundColor)} : {})
            })
        );

        /* component private functions */
        _onCloseMapPopover = () => {
            this.props.visStateActions.onLayerClick(null);
        };

        _onLayerHover = (idx: number, info: PickInfo<any> | null) => {
            this.props.visStateActions.onLayerHover(info);
        };

        _onLayerSetDomain = (idx: number, colorDomain: VisualChannelDomain) => {
            this.props.visStateActions.layerConfigChange(this.props.visState.layers[idx], {
                colorDomain
            } as Partial<LayerBaseConfig>);
        };

        _handleMapToggleLayer = layerId => {
            const {index: mapIndex = 0, visStateActions} = this.props;
            visStateActions.toggleLayerForMap(mapIndex, layerId);
        };

        _onMapboxStyleUpdate = update => {
            // force refresh mapboxgl layers
            this.previousLayers = {};
            this._updateMapboxLayers();

            if (update && update.style) {
                // No attributions are needed if the style doesn't reference Mapbox sources
                this.setState({showMapboxAttribution: isStyleUsingMapboxTiles(update.style)});
            }

            if (typeof this.props.onMapStyleLoaded === 'function') {
                this.props.onMapStyleLoaded(this._map);
            }
        };

        _setMapboxMap: React.Ref<MapRef> = mapbox => {
            if (!this._map && mapbox) {
                this._map = mapbox.getMap();
                // i noticed in certain context we don't access the actual map element
                if (!this._map) {
                    return;
                }
                // bind mapboxgl event listener
                this._map.on(MAPBOXGL_STYLE_UPDATE, this._onMapboxStyleUpdate);

                this._map.on(MAPBOXGL_RENDER, () => {
                    if (typeof this.props.onMapRender === 'function') {
                        this.props.onMapRender(this._map);
                    }
                });
            }

            if (this.props.getMapboxRef) {
                // The parent component can gain access to our MapboxGlMap by
                // providing this callback. Note that 'mapbox' will be null when the
                // ref is unset (e.g. when a split map is closed).
                this.props.getMapboxRef(mapbox, this.props.index);
            }
        };

        _onDeckInitialized(gl) {
            if (this.props.onDeckInitialized) {
                this.props.onDeckInitialized(this._deck, gl);
            }
        }

        /**
         * 1) Allow effects only for the first view.
         * 2) Prevent effect:preRender call without valid generated viewports.
         * @param viewIndex View index.
         * @returns Returns true if effects can be used.
         */
        _isOKToRenderEffects(viewIndex?: number): boolean {
            return !viewIndex && Boolean(this._deck?.viewManager?._viewports?.length);
        }

        _onBeforeRender = ({gl}) => {
            setLayerBlending(gl, this.props.visState.layerBlending);
        };

        _onDeckError = (error, layer) => {
            const errorMessage = error?.message || 'unknown-error';
            const layerMessage = layer?.id ? ` in ${layer.id} layer` : '';
            const errorMessageFull =
                errorMessage === 'WebGL context is lost'
                    ? 'Your GPU was disconnected. This can happen if your computer goes to sleep. It can also occur for other reasons, such as if you are running too many GPU applications.'
                    : `An error in deck.gl: ${errorMessage}${layerMessage}.`;

            // Throttle error notifications, as React doesn't like too many state changes from here.
            const lastShown = this._deckGLErrorsElapsed[errorMessageFull];
            if (!lastShown || lastShown < Date.now() - THROTTLE_NOTIFICATION_TIME) {
                this._deckGLErrorsElapsed[errorMessageFull] = Date.now();

                // Mark layer as invalid
                let extraLayerMessage = '';
                const {visStateActions} = this.props;
                if (layer) {
                    let topMostLayer = layer;
                    while (topMostLayer.parent) {
                        topMostLayer = topMostLayer.parent;
                    }
                    if (topMostLayer.props?.id) {
                        visStateActions.layerSetIsValid(topMostLayer, false);
                        extraLayerMessage = 'The layer has been disabled and highlighted.';
                    }
                }

                // Create new error notification or update existing one with same id.
                // Update is required to preserve the order of notifications as they probably are going to "jump" based on order of errors.
                const {uiStateActions} = this.props;
                uiStateActions.addNotification(
                    errorNotification({
                        message: `${errorMessageFull} ${extraLayerMessage}`,
                        id: errorMessageFull // treat the error message as id
                    })
                );
            }
        };

        /* component render functions */

        /* eslint-disable complexity */
        _renderMapPopover() {
            // this check is for limiting the display of the `<MapPopover>` to the `<MapContainer>` the user is interacting with
            // the DeckGL onHover event handler adds a `mapIndex` property which is available in the `hoverInfo` object of `visState`
            if (this.props.index !== this.props.visState.hoverInfo?.mapIndex) {
                return null;
            }

            // this checks if a feature (polygon selection) has been selected and if so, sets the clicked property
            if (this.props.visState.hoverInfo.layer?.id === EDITOR_LAYER_ID && this.props.visState.editor.selectedFeature) {
                this.props.visState.clicked = this.props.visState.hoverInfo;
            }

            // TODO: move this into reducer so it can be tested
            const {
                mapState,
                visState: {
                    interactionConfig,
                    changes,
                    mousePos: {mousePosition}
                }
            } = this.props;

            if (!mousePosition || !interactionConfig.tooltip) {
                return null;
            }

            const compareMode = interactionConfig.tooltip.config
                ? interactionConfig.tooltip.config.compareMode
                : false;

            const commonProp = {
                onClose: this._onCloseMapPopover,
                zoom: mapState.zoom,
                container: this._deck ? this._deck.canvas : undefined
            };

            return (
                <ErrorBoundary>
                    <MapPopoverContainer
                      MapPopover={MapPopover}
                      commonProp={commonProp}
                      compareMode={compareMode}
                      layersToRenderSelector={this.layersToRenderSelector}
                      onSetFeatures={this.props.visStateActions.setFeatures}
                      setSelectedFeature={this.props.visStateActions.setSelectedFeature}
                      featureCollection={this.featureCollectionSelector(this.props)}
                    />
                </ErrorBoundary>
            );
        }

        /* eslint-enable complexity */

        _getHoverXY(viewport, lngLat) {
            const screenCoord = !viewport || !lngLat ? null : viewport.project(lngLat);
            return screenCoord && {x: screenCoord[0], y: screenCoord[1]};
        }

        _renderDeckOverlay(
            layersForDeck,
            options: {primaryMap: boolean; isInteractive?: boolean; children?: React.ReactNode} = {
                primaryMap: false
            }
        ) {
            const {
                mapStyle,
                visState,
                mapState,
                visStateActions,
                mapboxApiAccessToken,
                mapboxApiUrl,
                deckGlProps,
                index,
                mapControls,
                deckRenderCallbacks,
                theme,
                generateDeckGLLayers,
                onMouseMove
            } = this.props;

            const {hoverInfo, editor} = visState;
            const {primaryMap, isInteractive, children} = options;

            // disable double click zoom when editor is in any draw mode
            const {mapDraw} = mapControls;
            const {active: editorMenuActive = false} = mapDraw || {};
            const isEditorDrawingMode = EditorLayerUtils.isDrawingActive(editorMenuActive, editor.mode);

            const internalViewState = this.context?.getInternalViewState(index);
            const internalMapState = {...mapState, ...internalViewState};
            const viewport = getViewportFromMapState(internalMapState);

            const editorFeatureSelectedIndex = this.selectedPolygonIndexSelector(this.props);

            const {setFeatures, onLayerClick, setSelectedFeature} = visStateActions;

            const generateDeckGLLayersMethod = generateDeckGLLayers ?? computeDeckLayers;
            const deckGlLayers = generateDeckGLLayersMethod(
                {
                    visState,
                    mapState: internalMapState,
                    mapStyle
                },
                {
                    mapIndex: index,
                    primaryMap,
                    mapboxApiAccessToken,
                    mapboxApiUrl,
                    layersForDeck,
                    editorInfo: primaryMap
                        ? {
                            editor,
                            editorMenuActive,
                            onSetFeatures: setFeatures,
                            setSelectedFeature,
                            featureCollection: this.featureCollectionSelector(this.props),
                            selectedFeatureIndexes: this.selectedFeatureIndexArraySelector(
                                editorFeatureSelectedIndex
                            ),
                            viewport
                        }
                        : undefined
                },
                {
                    onLayerHover: this._onLayerHover,
                    onSetLayerDomain: this._onLayerSetDomain
                },
                deckGlProps
            );

            const extraDeckParams: {
                getTooltip?: (info: any) => object | null;
                getCursor?: ({isDragging}: {isDragging: boolean}) => string;
            } = {};
            if (primaryMap) {
                extraDeckParams.getTooltip = info =>
                    EditorLayerUtils.getTooltip(info, {
                        editorMenuActive,
                        editor,
                        theme
                    });

                extraDeckParams.getCursor = ({isDragging}: {isDragging: boolean}) => {
                    const editorCursor = EditorLayerUtils.getCursor({
                        editorMenuActive,
                        editor,
                        hoverInfo
                    });
                    if (editorCursor) return editorCursor;

                    if (isDragging) return 'grabbing';
                    if (hoverInfo?.layer) return 'pointer';
                    return 'grab';
                };
            }

            const effects = this._isOKToRenderEffects(index)
                ? computeDeckEffects({visState, mapState})
                : [];

            const views = deckGlProps?.views
                ? deckGlProps?.views()
                : new MapView({legacyMeterSizes: true});

            let allDeckGlProps = {
                ...deckGlProps,
                pickingRadius: DEFAULT_PICKING_RADIUS,
                views,
                layers: deckGlLayers,
                effects
            };

            if (typeof deckRenderCallbacks?.onDeckRender === 'function') {
                allDeckGlProps = deckRenderCallbacks.onDeckRender(allDeckGlProps);
                if (!allDeckGlProps) {
                    // if onDeckRender returns null, do not render deck.gl
                    return null;
                }
            }

            return (
                <div
                    {...(isInteractive
                        ? {
                            onMouseMove: primaryMap
                                ? event => {
                                    onMouseMove?.(event);
                                    this._onMouseMoveDebounced(event, viewport);
                                }
                                : undefined
                        }
                        : {style: {pointerEvents: 'none'}})}
                >
                    <DeckGL
                        id="default-deckgl-overlay"
                        onLoad={() => {
                            if (typeof deckRenderCallbacks?.onDeckLoad === 'function') {
                                deckRenderCallbacks.onDeckLoad();
                            }
                        }}
                        {...allDeckGlProps}
                        controller={
                            isInteractive
                                ? {
                                    doubleClickZoom: !isEditorDrawingMode,
                                    dragRotate: this.props.mapState.dragRotate
                                }
                                : false
                        }
                        initialViewState={internalViewState}
                        onBeforeRender={this._onBeforeRender}
                        onViewStateChange={isInteractive ? this._onViewportChange : undefined}
                        {...extraDeckParams}
                        onHover={
                            isInteractive
                                ? (data, event) => {
                                    const res = EditorLayerUtils.onHover(data, {
                                        editorMenuActive,
                                        editor,
                                        hoverInfo
                                    });
                                    if (res) return;

                                    this._onLayerHoverDebounced(data, index, event);
                                }
                                : null
                        }
                        onClick={(data, event) => {
                            // @ts-ignore
                            normalizeEvent(event.srcEvent, viewport);
                            const res = EditorLayerUtils.onClick(data, event, {
                                editorMenuActive,
                                editor,
                                onLayerClick,
                                setSelectedFeature,
                                mapIndex: index
                            });
                            if (res) return;

                            visStateActions.onLayerClick(data);
                        }}
                        onError={this._onDeckError}
                        ref={comp => {
                            // @ts-ignore
                            if (comp && comp.deck && !this._deck) {
                                // @ts-ignore
                                this._deck = comp.deck;
                            }
                        }}
                        onWebGLInitialized={gl => this._onDeckInitialized(gl)}
                        onAfterRender={() => {
                            if (typeof deckRenderCallbacks?.onDeckAfterRender === 'function') {
                                deckRenderCallbacks.onDeckAfterRender(allDeckGlProps);
                            }
                        }}
                    >
                        {children}
                    </DeckGL>
                </div>
            );
        }

        _updateMapboxLayers() {
            const mapboxLayers = this.mapboxLayersSelector(this.props);
            if (!Object.keys(mapboxLayers).length && !Object.keys(this.previousLayers).length) {
                return;
            }

            updateMapboxLayers(this._map, mapboxLayers, this.previousLayers);

            this.previousLayers = mapboxLayers;
        }

        _renderMapboxOverlays() {
            if (this._map && this._map.isStyleLoaded()) {
                this._updateMapboxLayers();
            }
        }
        _onViewportChangePropagateDebounced = debounce(() => {
            const viewState = this.context?.getInternalViewState(this.props.index);
            onViewPortChange(
                viewState,
                this.props.mapStateActions.updateMap,
                this.props.onViewStateChange,
                this.props.primary,
                this.props.index
            );
        }, DEBOUNCE_VIEWPORT_PROPAGATE);

        _onViewportChange = viewport => {
            const {viewState} = viewport;
            if (this.props.isExport) {
                // Image export map shouldn't be interactive (otherwise this callback can
                // lead to inadvertent changes to the state of the main map)
                return;
            }
            const {setInternalViewState} = this.context;
            setInternalViewState(viewState, this.props.index);
            this._onViewportChangePropagateDebounced();
        };

        _onLayerHoverDebounced = debounce((data, index, event) => {
            // add `mapIndex` property which will end up in the the `hoverInfo` object of `visState`
            // this is for limiting the display of the `<MapPopover>` to the `<MapContainer>` the user is interacting with
            // TODO this should be part of onLayerHover arguments, investigate
            // @ts-ignore (does not fail with local yarn-test)
            data.mapIndex = index;

            this.props.visStateActions.onLayerHover(data);
        }, DEBOUNCE_MOUSE_MOVE_PROPAGATE);

        _onMouseMoveDebounced = debounce((event, viewport) => {
            this.props.visStateActions.onMouseMove(normalizeEvent(event, viewport));
        }, DEBOUNCE_MOUSE_MOVE_PROPAGATE);

        _toggleMapControl = panelId => {
            const {index, uiStateActions} = this.props;

            uiStateActions.toggleMapControl(panelId, Number(index));
        };

        /* eslint-disable complexity */
        _renderMap() {
            const {
                visState,
                mapState,
                mapStyle,
                mapStateActions,
                MapComponent = Map,
                mapboxApiAccessToken,
                mapboxApiUrl,
                mapControls,
                isExport,
                locale,
                uiStateActions,
                visStateActions,
                index,
                primary,
                bottomMapContainerProps,
                topMapContainerProps,
                theme,
                datasetAttributions = [],
                containerId = 0
            } = this.props;

            const {layers, datasets, editor, interactionConfig} = visState;

            const layersToRender = this.layersToRenderSelector(this.props);
            const layersForDeck = this.layersForDeckSelector(this.props);

            // Current style can be a custom style, from which we pull the mapbox API acccess token
            const currentStyle = mapStyle.mapStyles?.[mapStyle.styleType];
            const internalViewState = this.context?.getInternalViewState(index);
            const mapProps = {
                ...internalViewState,
                preserveDrawingBuffer: true,
                mapboxAccessToken: currentStyle?.accessToken || mapboxApiAccessToken,
                baseApiUrl: mapboxApiUrl,
                mapLib: maplibregl,
                transformRequest: this.props.transformRequest || transformRequest
            };

            const hasGeocoderLayer = Boolean(layers.find(l => l.id === GEOCODER_LAYER_ID));
            const isSplit = Boolean(mapState.isSplit);

            const deck = this._renderDeckOverlay(layersForDeck, {
                primaryMap: true,
                isInteractive: true,
                children: (
                    <MapComponent
                        key="bottom"
                        {...mapProps}
                        mapStyle={mapStyle.bottomMapStyle ?? EMPTY_MAPBOX_STYLE}
                        {...bottomMapContainerProps}
                        ref={this._setMapboxMap}
                    />
                )
            });
            if (!deck) {
                // deckOverlay can be null if onDeckRender returns null
                // in this case we don't want to render the map
                return null;
            }

            const isPredictionLayer = visState?.layers[0] && visState?.layers[0]?.id.startsWith('prediction_');

            return (
                <>
                    <MapControl
                        mapState={mapState}
                        datasets={datasets}
                        availableLocales={LOCALE_CODES_ARRAY}
                        dragRotate={mapState.dragRotate}
                        isSplit={isSplit}
                        primary={Boolean(primary)}
                        isExport={isExport}
                        layers={layers}
                        layersToRender={layersToRender}
                        mapIndex={index || 0}
                        mapControls={mapControls}
                        readOnly={this.props.readOnly}
                        scale={mapState.scale || 1}
                        top={
                            interactionConfig.geocoder && interactionConfig.geocoder.enabled
                                ? theme.mapControlTop
                                : 0
                        }
                        editor={editor}
                        locale={locale}
                        onTogglePerspective={mapStateActions.togglePerspective}
                        onToggleSplitMap={mapStateActions.toggleSplitMap}
                        onMapToggleLayer={this._handleMapToggleLayer}
                        onToggleMapControl={this._toggleMapControl}
                        onToggleSplitMapViewport={mapStateActions.toggleSplitMapViewport}
                        onSetEditorMode={visStateActions.setEditorMode}
                        onSetLocale={uiStateActions.setLocale}
                        onToggleEditorVisibility={visStateActions.toggleEditorVisibility}
                        mapHeight={mapState.height}
                        isPredictionLayer={isPredictionLayer}
                    />
                    {isSplitSelector(this.props) && <Droppable containerId={containerId} />}

                    {deck}
                    {this._renderMapboxOverlays()}
                    <Editor
                        index={index || 0}
                        datasets={datasets}
                        editor={editor}
                        filters={this.polygonFiltersSelector(this.props)}
                        layers={layers}
                        onDeleteFeature={visStateActions.deleteFeature}
                        onSelect={visStateActions.setSelectedFeature}
                        onTogglePolygonFilter={visStateActions.setPolygonFilterLayer}
                        onSetEditorMode={visStateActions.setEditorMode}
                        style={{
                            pointerEvents: 'all',
                            position: 'absolute',
                            display: editor.visible ? 'block' : 'none'
                        }}
                    />
                    {this.props.children}
                    {mapStyle.topMapStyle ? (
                        <MapComponent
                            key="top"
                            viewState={internalViewState}
                            mapStyle={mapStyle.topMapStyle}
                            style={MAP_STYLE.top}
                            mapboxAccessToken={mapProps.mapboxAccessToken}
                            baseApiUrl={mapProps.baseApiUrl}
                            mapLib={maplibregl}
                            {...topMapContainerProps}
                        />
                    ) : null}

                    {hasGeocoderLayer
                        ? this._renderDeckOverlay(
                            {[GEOCODER_LAYER_ID]: hasGeocoderLayer},
                            {primaryMap: false, isInteractive: false}
                        )
                        : null}
                    {this._renderMapPopover()}
                    {this.props.primary ? (
                        <Attribution
                            showMapboxLogo={false}
                            showOsmBasemapAttribution={false}
                            datasetAttributions={datasetAttributions}
                        />
                    ) : null}
                </>
            );
        }

        render() {
            const {visState} = this.props;
            const mapContent = this._renderMap();
            if (!mapContent) {
                // mapContent can be null if onDeckRender returns null
                // in this case we don't want to render the map
                return null;
            }
            return (
                <StyledMap
                    ref={this._ref}
                    style={this.styleSelector(this.props)}
                    onContextMenu={event => event.preventDefault()}
                    mixBlendMode={visState.overlayBlending}
                >
                    {mapContent}
                </StyledMap>
            );
        }
    }

    return withTheme(connect(mapStateToProps)(MapContainer));
}

export function replaceMapContainer() {
    return [MapContainerFactory, CustomMapContainerFactory];
}
