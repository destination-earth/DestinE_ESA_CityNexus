// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import React, {useCallback, useMemo} from 'react';

import {
    EXPORT_DATA_ID,
    EXPORT_MAP_ID,
    SHARE_MAP_ID,
    OVERWRITE_MAP_ID,
    SAVE_MAP_ID,
    EXPORT_IMAGE_ID,
    ADD_DATA_ID,
    ADD_MAP_STYLE_ID
} from '@kepler.gl/constants';

import get from 'lodash.get';
import {
    CustomPanelsFactory,
    FilterManagerFactory, InteractionManagerFactory,
    LayerManagerFactory, MapManagerFactory,
    PanelHeaderFactory,
    PanelToggleFactory,
    SidebarFactory,
    SidePanelFactory
} from "@kepler.gl/components";
import {CursorClick, FilterFunnel, Layers} from "@kepler.gl/components/dist/common/icons";
import {SidePanelItem, SidePanelProps} from "@kepler.gl/components/dist/types";
import {StyledSidePanelContent} from "@kepler.gl/components/dist/side-panel";

CustomSidePanelFactory.deps = SidePanelFactory.deps;

/**
 * Vertical sidebar containing input components for the rendering layers
 */
export default function CustomSidePanelFactory(
    Sidebar: ReturnType<typeof SidebarFactory>,
    PanelHeader: ReturnType<typeof PanelHeaderFactory>,
    PanelToggle: ReturnType<typeof PanelToggleFactory>,
    LayerManager: ReturnType<typeof LayerManagerFactory>,
    FilterManager: ReturnType<typeof FilterManagerFactory>,
    InteractionManager: ReturnType<typeof InteractionManagerFactory>,
    MapManager: ReturnType<typeof MapManagerFactory>,
    CustomPanels: ReturnType<typeof CustomPanelsFactory>
) {
    // inject components
    const SIDEBAR_COMPONENTS = {
        layer: LayerManager,
        filter: FilterManager,
        map: MapManager
    };

    const SIDEBAR_ICONS = {
        layer: Layers,
        filter: FilterFunnel,
        map: CursorClick
    };

    const SIDEBAR_PANELS = [{
        id: 'layer',
        label: 'sidebar.panels.layer',
        onClick: null
    }, {
        id: 'filter',
        label: 'sidebar.panels.filter',
        onClick: null
    }, {
        id: 'map',
        label: 'sidebar.panels.basemap',
        onClick: null
    }];

    // We should defined sidebar panels here but keeping them for backward compatible
    const fullPanels: SidePanelItem[] = SIDEBAR_PANELS.map(component => ({
        ...component,
        component: SIDEBAR_COMPONENTS[component.id],
        iconComponent: SIDEBAR_ICONS[component.id]
    }));

    const getCustomPanelProps = get(CustomPanels, ['defaultProps', 'getProps']) || (() => ({}));

    // eslint-disable-next-line max-statements
    const SidePanel: React.FC<SidePanelProps> = (props: SidePanelProps) => {
        const {
            appName,
            appWebsite,
            availableProviders = {},
            datasets,
            filters,
            layers,
            layerBlending,
            overlayBlending,
            layerClasses,
            layerOrder,
            interactionConfig,
            panels = fullPanels,
            mapInfo,
            mapSaved,
            mapStateActions,
            mapStyle,
            mapStyleActions,
            onSaveMap,
            uiState,
            uiStateActions,
            visStateActions,
            version,
            width
        } = props;
        const {openDeleteModal, toggleModal, toggleSidePanel} = uiStateActions;
        const {activeSidePanel} = uiState;
        const {setMapInfo, showDatasetTable, updateTableColor} = visStateActions;
        const {hasShare, hasStorage} = availableProviders;

        const {title} = mapInfo;

        const isOpen = Boolean(activeSidePanel);

        const _onOpenOrClose = useCallback(() => toggleSidePanel(activeSidePanel ? '' : 'layer'), [
            activeSidePanel,
            toggleSidePanel
        ]);

        const onClickExportImage = useCallback(() => toggleModal(EXPORT_IMAGE_ID), [toggleModal]);
        const onClickExportData = useCallback(() => toggleModal(EXPORT_DATA_ID), [toggleModal]);
        const onClickExportMap = useCallback(() => toggleModal(EXPORT_MAP_ID), [toggleModal]);
        const onClickSaveToStorage = useCallback(
            () => toggleModal(mapSaved ? OVERWRITE_MAP_ID : SAVE_MAP_ID),
            [mapSaved, toggleModal]
        );
        const onClickSaveAsToStorage = useCallback(() => {
            setMapInfo({
                title: `${title || 'Kepler.gl'} (Copy)`
            });

            toggleModal(SAVE_MAP_ID);
        }, [title, setMapInfo, toggleModal]);
        const onClickShareMap = useCallback(() => toggleModal(SHARE_MAP_ID), [toggleModal]);
        const onShowDatasetTable = useCallback(dataId => showDatasetTable(dataId), [showDatasetTable]);
        const onUpdateTableColor = useCallback(
            (dataId, newColor) => updateTableColor(dataId, newColor),
            [updateTableColor]
        );
        const onShowAddDataModal = useCallback(() => toggleModal(ADD_DATA_ID), [toggleModal]);
        const onShowAddMapStyleModal = useCallback(() => toggleModal(ADD_MAP_STYLE_ID), [toggleModal]);
        const onRemoveDataset = useCallback(dataId => openDeleteModal(dataId), [openDeleteModal]);

        const currentPanel = useMemo(() => panels.find(({id}) => id === activeSidePanel) || null, [
            activeSidePanel,
            panels
        ]);

        const customPanelProps = useMemo(() => getCustomPanelProps(props), [props]);
        const PanelComponent = currentPanel?.component;

        return (
            <Sidebar
                width={width}
                isOpen={isOpen}
                shouldShowCollapseButton={uiState.isSidePanelCloseButtonVisible}
                minifiedWidth={0}
                onOpenOrClose={_onOpenOrClose}
            >
                <PanelHeader
                    appName={appName}
                    version={version}
                    appWebsite={appWebsite}
                    visibleDropdown={uiState.visibleDropdown}
                    showExportDropdown={uiStateActions.showExportDropdown}
                    hideExportDropdown={uiStateActions.hideExportDropdown}
                    onExportImage={onClickExportImage}
                    onExportData={onClickExportData}
                    onExportMap={onClickExportMap}
                    onSaveMap={hasStorage ? onSaveMap : undefined}
                    onSaveToStorage={hasStorage ? onClickSaveToStorage : null}
                    onSaveAsToStorage={hasStorage && mapSaved ? onClickSaveAsToStorage : null}
                    onShareMap={hasShare ? onClickShareMap : null}
                />
                {/* the next two components should be moved into one */}
                {/* but i am keeping them because of backward compatibility */}
                <PanelToggle
                    panels={panels}
                    activePanel={activeSidePanel}
                    togglePanel={uiStateActions.toggleSidePanel}
                />
                <StyledSidePanelContent className="side-panel__content">
                    <div className="side-panel__content__inner">
                        {PanelComponent ? (
                            <PanelComponent
                                datasets={datasets}
                                filters={filters}
                                layers={layers}
                                layerClasses={layerClasses}
                                layerOrder={layerOrder}
                                layerBlending={layerBlending}
                                overlayBlending={overlayBlending}
                                mapStyle={mapStyle}
                                mapStyleActions={mapStyleActions}
                                mapStateActions={mapStateActions}
                                interactionConfig={interactionConfig}
                                removeDataset={onRemoveDataset}
                                showDatasetTable={onShowDatasetTable}
                                updateTableColor={onUpdateTableColor}
                                showAddDataModal={onShowAddDataModal}
                                showAddMapStyleModal={onShowAddMapStyleModal}
                                uiStateActions={uiStateActions}
                                visStateActions={visStateActions}
                                panelMetadata={currentPanel}
                                panelListView={
                                    currentPanel?.id === 'layer'
                                        ? uiState.layerPanelListView
                                        : currentPanel?.id === 'filter'
                                            ? uiState.filterPanelListView
                                            : null
                                }
                            />
                        ) : null}
                        <CustomPanels
                            {...customPanelProps}
                            activeSidePanel={activeSidePanel}
                            updateTableColor={onUpdateTableColor}
                        />
                    </div>
                </StyledSidePanelContent>
            </Sidebar>
        );
    };

    SidePanel.defaultProps = {
        panels: fullPanels,
        mapInfo: {}
    };

    return SidePanel;
}

export function replaceSidePanelFactory() {
    return [SidePanelFactory, CustomSidePanelFactory];
}