import React from "react";
import {PANEL_VIEW_TOGGLES} from "@kepler.gl/constants";
import {injectIntl, WrappedComponentProps} from "react-intl";
import {
    AddLayerButtonFactory,
    DatasetLayerGroupFactory, DatasetSectionFactory, InfoHelperFactory,
    LayerListFactory,
    LayerManagerFactory, PanelTitleFactory,
    PanelViewListToggleFactory, SidePanelDivider, SidePanelSection
} from "@kepler.gl/components";
import {Datasets} from "@kepler.gl/table";
import {Layer, LayerClassesType} from "@kepler.gl/layers";
import {ActionHandler, UIStateActions, VisStateActions} from "@kepler.gl/actions";
import {PanelListView} from "@kepler.gl/types";
import {SidePanelItem} from "@kepler.gl/components/dist/types";
import {ConfigureVisualizationButton} from "../../../features/visualization-manager/ConfigureVisualizationButton";
import {VisualizationActions} from "../../../components/visualization-actions/VisualizationActions";
import NewVisualizationButton from "../../../features/visualization-manager/NewVisualizationButton";


type LayerManagerProps = {
  datasets: Datasets;
  layers: Layer[];
  layerOrder: string[];
  layerClasses: LayerClassesType;
  layerBlending: string;
  overlayBlending: string;
  uiStateActions: typeof UIStateActions;
  visStateActions: typeof VisStateActions;
  showAddDataModal: () => void;
  removeDataset: ActionHandler<typeof UIStateActions.openDeleteModal>;
  showDatasetTable: ActionHandler<typeof VisStateActions.showDatasetTable>;
  updateTableColor: ActionHandler<typeof VisStateActions.updateTableColor>;
  panelListView: PanelListView;
  panelMetadata: SidePanelItem;
} & WrappedComponentProps;

CustomLayerManagerFactory.deps = [
    ...LayerManagerFactory.deps
];

export default function CustomLayerManagerFactory(
  LayerList: ReturnType<typeof LayerListFactory>,
  DatasetLayerGroup: ReturnType<typeof DatasetLayerGroupFactory>,
  PanelViewListToggle: ReturnType<typeof PanelViewListToggleFactory>,
  PanelTitle: ReturnType<typeof PanelTitleFactory>,
  DatasetSection: ReturnType<typeof DatasetSectionFactory>,
  AddLayerButton: ReturnType<typeof AddLayerButtonFactory>,
  InfoHelper: ReturnType<typeof InfoHelperFactory>
): React.FC<LayerManagerProps> {
  const LayerManager: React.FC<LayerManagerProps> = ({
    layers,
    datasets,
    intl,
    layerOrder,
    showAddDataModal,
    updateTableColor,
    showDatasetTable,
    removeDataset,
    uiStateActions,
    visStateActions,
    panelListView,
    panelMetadata,
    layerClasses
  }) => {
    const isSortByDatasetMode = panelListView === PANEL_VIEW_TOGGLES.list;

    return (
      <div className="layer-manager">
        <DatasetSection
          datasets={datasets}
          showDatasetTable={showDatasetTable}
          updateTableColor={updateTableColor}
          removeDataset={removeDataset}
          showDeleteDataset
          showDatasetList={!isSortByDatasetMode}
          showAddDataModal={showAddDataModal}
        />
        <SidePanelSection>
          <VisualizationActions>
            <NewVisualizationButton/>
            <ConfigureVisualizationButton/>
          </VisualizationActions>
        </SidePanelSection>
        <SidePanelSection>
          {isSortByDatasetMode ? (
            <DatasetLayerGroup
              datasets={datasets}
              showDatasetTable={showDatasetTable}
              layers={layers}
              updateTableColor={updateTableColor}
              removeDataset={removeDataset}
              layerOrder={layerOrder}
              layerClasses={layerClasses}
              uiStateActions={uiStateActions}
              visStateActions={visStateActions}
              showDeleteDataset
            />
          ) : (
            // TODO replace ignore
            // @ts-ignore
            <LayerList
              layers={layers}
              datasets={datasets}
              layerOrder={layerOrder}
              uiStateActions={uiStateActions}
              visStateActions={visStateActions}
              layerClasses={layerClasses}
            />
          )}
        </SidePanelSection>
      </div>
    );
  };

  return injectIntl(LayerManager);
}

export function replaceLayerManager() {
    return [LayerManagerFactory, CustomLayerManagerFactory];
}
