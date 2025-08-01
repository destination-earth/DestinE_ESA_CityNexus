import React from "react";
import {LayerManagerFactory, ModalContainerFactory} from "@kepler.gl/components";
import DeleteDatasetModalFactory from "@kepler.gl/components/dist/modals/delete-data-modal";
import OverWriteMapModalFactory from "@kepler.gl/components/dist/modals/overwrite-map-modal";
import DataTableModalFactory from "@kepler.gl/components/dist/modals/data-table-modal";
import LoadDataModalFactory from "@kepler.gl/components/dist/modals/load-data-modal";
import ExportImageModalFactory from "@kepler.gl/components/dist/modals/export-image-modal";
import ExportDataModalFactory from "@kepler.gl/components/dist/modals/export-data-modal";
import ExportMapModalFactory from "@kepler.gl/components/dist/modals/export-map-modal/export-map-modal";
import AddMapStyleModalFactory from "@kepler.gl/components/dist/modals/add-map-style-modal";
import ModalDialogFactory from "@kepler.gl/components/dist/modals/modal-dialog";
import SaveMapModalFactory from "@kepler.gl/components/dist/modals/save-map-modal";
import ShareMapModalFactory from "@kepler.gl/components/dist/modals/share-map-modal";
import {SimulationConfigModal} from "./simulation-config-modal/SimulationConfigModal";
import {ScenarioCreateModal} from "./scenario-create-modal/ScenarioCreateModal";
import {
    ConfigureVisualizationModal
} from "../../visualization-manager/configure-visualization-modal/ConfigureVisualizationModal";

export const CustomModalContainer = (ModalContainer) => {
    return (props: any) => {
        // We do not want to propagate keyup events (e.g. escape key to close the modal)
        const handleKeyUp = (event) => {
            event.stopPropagation()
        };

        // The wrapper div allows us to intercept keyup events
        return (
            <div onKeyUp={handleKeyUp} tabIndex={-1} style={{outline: 'none'}}>
                <ModalContainer {...props} />
                <SimulationConfigModal {...props} />
                <ScenarioCreateModal {...props} />
                <ConfigureVisualizationModal {...props}/>
            </div>
        );
    }
}

CustomModalContainerFactory.deps = [
    DeleteDatasetModalFactory,
    OverWriteMapModalFactory,
    DataTableModalFactory,
    LoadDataModalFactory,
    ExportImageModalFactory,
    ExportDataModalFactory,
    ExportMapModalFactory,
    AddMapStyleModalFactory,
    ModalDialogFactory,
    SaveMapModalFactory,
    ShareMapModalFactory,
];

export default function CustomModalContainerFactory(DeleteDatasetModal: ReturnType<typeof DeleteDatasetModalFactory>,
                                     OverWriteMapModal: ReturnType<typeof OverWriteMapModalFactory>,
                                     DataTableModal: ReturnType<typeof DataTableModalFactory>,
                                     LoadDataModal: ReturnType<typeof LoadDataModalFactory>,
                                     ExportImageModal: ReturnType<typeof ExportImageModalFactory>,
                                     ExportDataModal: ReturnType<typeof ExportDataModalFactory>,
                                     ExportMapModal: ReturnType<typeof ExportMapModalFactory>,
                                     AddMapStyleModal: ReturnType<typeof AddMapStyleModalFactory>,
                                     ModalDialog: ReturnType<typeof ModalDialogFactory>,
                                     SaveMapModal: ReturnType<typeof SaveMapModalFactory>,
                                     ShareMapModal: ReturnType<typeof ShareMapModalFactory>) {
    const BaseModalContainer = ModalContainerFactory(DeleteDatasetModal, OverWriteMapModal, DataTableModal, LoadDataModal, ExportImageModal, ExportDataModal, ExportMapModal, AddMapStyleModal, ModalDialog, SaveMapModal, ShareMapModal);
    return CustomModalContainer(BaseModalContainer);
}

export function replaceModalContainer() {
    return [ModalContainerFactory, CustomModalContainerFactory];
}
