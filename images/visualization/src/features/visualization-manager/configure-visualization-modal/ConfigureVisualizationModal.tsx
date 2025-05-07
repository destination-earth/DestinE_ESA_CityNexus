import React, {useEffect, useState} from "react";
import {findDOMNode} from "react-dom";
import {useSelector} from "react-redux";
import {css} from "styled-components";
import {LoadingDialog, Modal} from "@kepler.gl/components";
import {SubmitHandler, useForm} from "react-hook-form";
import "./ConfigureVisualizationModal.scss";

import {VisualizationParameters, VisualizationParametersValidation} from "../models/VisualizationParameters";
import {closeConfigureVisualizationModal, selectConfigureVisualizationModalState} from "../store/ConfigureVisualizationSlice";
import {useAppDispatch} from "../../../hooks";
import {Checkbox} from "../../../components/form/Checkbox";
import {ErrorMessage} from "../../../components/form/ErrorMessage";
import {
    colorSelectedLayers,
    loadPrediction, setLoadingMapStatus as setIsBaselineLoading,
    setLoadingPredictionStatus as setAreDatasetsBeingProcessed,
    splitSelectedLayers
} from "../../../actions"
import {selectSelectedCityName} from "../../user/userSlice";


export const ConfigureVisualizationModal = (props: any) => {
    const {rootNode} = props;
    const isConfigModalOpen = useSelector(selectConfigureVisualizationModalState)
    const dispatch = useAppDispatch();
    const datasets = useSelector((state: any) => state.demo.keplerGl.map.visState.datasets);
    const isBaselineLoading = useSelector((state: any) => state.demo.app.isMapLoading);
    const areDatasetsBeingProcessed = useSelector((state: any) => state.demo.app.isPredictionLoading);
    const [isLoadingWidgetDisplayed, setIsLoadingWidgetDisplayed] = useState(false);
    const selectedCityName = useSelector(selectSelectedCityName);
    const availablePredictions = useSelector((state: any) => state.demo.app.predictionMaps);
    const [submitData, setSubmitData] = useState(null);

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors }
    } = useForm<VisualizationParameters>()

    const DefaultStyle = css`max-width: 600px;`;

    const baselineDatasets = availablePredictions.filter((prediction) => prediction.city === selectedCityName
        && prediction.name.startsWith("Baseline")).map(baselineDataset => ({
            ...baselineDataset,
            predictionId: `prediction_${baselineDataset.id}_${baselineDataset.dayType}`
        }));

    const dataset_keys = Object.keys(datasets);

    const onCancel = () => {
        dispatch(closeConfigureVisualizationModal());
    }

    // clicking onSubmit and setting submitData triggers the loading of baseline dataset(s)
    useEffect(() => {
        // Load the baseline dataset(s) if selected, this will toggle isBaselineLoading on and off,
        // potentially twice if both baseline datasets are selected
        if (submitData !== null) {
            dispatch(setIsBaselineLoading(true));
            for (const baselineDataset of baselineDatasets) {
                if (submitData.datasets.includes(baselineDataset.predictionId) && !(baselineDataset.predictionId in datasets)) {
                    dispatch(setIsBaselineLoading(true));
                    // the loading map status will be set to false by loadPrediction when it finishes
                    dispatch(loadPrediction(baselineDataset));
                }
            }
            setTimeout(() => {
              dispatch(setIsBaselineLoading(false));
            }, 50);
        }
    }, [submitData]);

    // once the baseline dataset(s) are loaded, split and color the layers
    useEffect(() => {
        // areDatasetsBeingProcessed and isBaselineLoading are not reliable enough to check if both baseline dataset are loaded,
        // if they were selected
        if (areDatasetsBeingProcessed && !isBaselineLoading) {
            const areBaselineDatasetsLoaded = baselineDatasets.every(x => !submitData.datasets.includes(x.predictionId)
                || (submitData.datasets.includes(x.predictionId) && x.predictionId in datasets));

            if (areBaselineDatasetsLoaded) {
                for (const datasetId of submitData.datasets) {
                  dispatch(setAreDatasetsBeingProcessed(true));
                  dispatch(splitSelectedLayers(submitData.parameters, datasetId, submitData.datasets));
                  // The prediction loading state will be set to false by colorSelectedLayers
                  // this is fine even if it sets isLoadingWidgetDisplayed to false prematurely (before processing
                  // all datasets), because the component should only re-render after exiting this useEffect
                  dispatch(colorSelectedLayers(submitData.parameters, datasetId));
                }
                dispatch(closeConfigureVisualizationModal());
            }
        }
    }, [isBaselineLoading, datasets]);

    useEffect(() => {
        if (isBaselineLoading || areDatasetsBeingProcessed) {
            setIsLoadingWidgetDisplayed(true);
        } else {
            setIsLoadingWidgetDisplayed(false);
        }
    }, [isBaselineLoading, areDatasetsBeingProcessed]);

    useEffect(() => {
        if (dataset_keys.length === 1) {
            // Get the current value of datasets
            const currentDatasetsValue = getValues('datasets');
            // Only set datasets value if it's not already set
            if (!currentDatasetsValue || (Array.isArray(currentDatasetsValue) && currentDatasetsValue.length === 0)) {
                setValue('datasets', [dataset_keys[0]]);
            }
        }

        // Get the current value of parameters
        const currentParametersValue = getValues('parameters');
        // Only set parameters value if it's not already set
        if (!currentParametersValue || (Array.isArray(currentParametersValue) && currentParametersValue.length === 0)) {
            setValue("parameters", ["no2"]);
        }
    }, [dataset_keys]);

    const onSubmit: SubmitHandler<VisualizationParameters> = async (submitData: VisualizationParameters) => {
        if (typeof submitData.datasets === "string") {
            submitData.datasets = [submitData.datasets];
        }

        dispatch(setIsBaselineLoading(true));
        dispatch(setAreDatasetsBeingProcessed(true));
        setSubmitData(submitData);
    }

    const [allFieldsSelected, setAllFieldsSelected] = useState(false);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);

    useEffect(() => {
        // Sync selectedFields with form state
        setSelectedFields(getValues('parameters') || []);
    }, [getValues, isConfigModalOpen]);

    useEffect(() => {
        // Update allFieldsSelected state
        if (dataset_keys.length !== 0) {
            const firstDataset = datasets[dataset_keys[0]];
            const fields = firstDataset.fields.filter((field) => !["_geojson", "time_window", "osm_id"].includes(field.name));
            setAllFieldsSelected(selectedFields.length === fields.length);
        }
    }, [selectedFields, dataset_keys, datasets]);

    const handleSelectAllFields = (checked: boolean, fields: any[]) => {
        setAllFieldsSelected(checked);
        const fieldIds = fields.map(field => field.id);
        setSelectedFields(checked ? fieldIds : ["no2"]);
        setValue('parameters', checked ? fieldIds : ["no2"]);
    };

    const handleFieldChange = (value: string, checked: boolean) => {
        let updated = checked ? [...selectedFields, value] : selectedFields.filter(v => v !== value);
        setSelectedFields(updated);
        setValue('parameters', updated);
    };

    if (!rootNode) return null;

    if (dataset_keys.length !== 0) {
        const firstDataset = datasets[dataset_keys[0]];
        const fields = firstDataset.fields.filter((field) => !["_geojson", "time_window", "osm_id"].includes(field.name));

        // Select All Checkbox
        const selectAllCheckbox = (
          <Checkbox
            key="select_all"
            name="select_all"
            value="select_all"
            label="Select All Parameters"
            validation={{}}
            errors={{}}
            checked={allFieldsSelected}
            onCustomChange={(_, checked) => handleSelectAllFields(checked, fields)}
            isRadioCheckbox={false}
            showUnit={false}
            tooltip="Select or deselect all fields"
          />
        );

        const fieldCheckboxes = fields.map((field) => (
          <Checkbox
            key={field.id}
            showErrors={false}
            name="parameters"
            value={field.id}
            label={field.id}
            validation={VisualizationParametersValidation.parameters}
            errors={errors}
            register={register}
            tooltip={`Visualize ${field.id} from the selected datasets`}
            showUnit={true}
            onCustomChange={(_, checked) => handleFieldChange(field.id, checked)}
          />
        ));

        const datasetCheckboxes = dataset_keys.map((datasetId) => {
            const label = `${datasets[datasetId].metadata.name} - ${datasets[datasetId].metadata.dayType}`;
            return (
                <Checkbox
                    key={datasetId}
                    showErrors={false}
                    name="datasets"
                    value={datasetId}
                    label={label}
                    errors={errors}
                    register={register}
                    validation={VisualizationParametersValidation.datasets}
                    tooltip={`Visualize the selected fields for dataset ${label}`}
                />
            );
        });

        // Adds default baseline datasets if they are not already loaded
        for (const baselineDataset of baselineDatasets) {
            const datasetId = baselineDataset.predictionId;
            const datasetAlreadyLoaded = datasetId in datasets;
            if (!datasetAlreadyLoaded) {
                const label = `${baselineDataset.name} - ${baselineDataset.dayType}`;
                datasetCheckboxes.push(
                  <Checkbox
                    key={datasetId}
                    showErrors={false}
                    name="datasets"
                    value={datasetId}
                    label={label}
                    validation={VisualizationParametersValidation.datasets}
                    errors={errors}
                    register={register}
                    tooltip={`Visualize the selected fields for dataset ${label}`}
                  />
                )
            }
        }

        return (
            <Modal
              title="Configure Visualization"
              parentSelector={() => findDOMNode(rootNode) as HTMLElement}
              isOpen={isConfigModalOpen}
              theme={null}
              cssStyle={DefaultStyle}
              onCancel={onCancel}
            >
                {isLoadingWidgetDisplayed ? (
                    <div className="sample-data-modal">
                        <LoadingDialog size={64}/>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} onReset={onCancel} className="citynexus-form">
                        <h4>
                            Select parameters to be visualised
                            <ErrorMessage errors={errors} name="parameters"/>
                        </h4>
                        <div className="form-group">
                            <div className="form-control" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ flex: 1 }}>
                                    {fieldCheckboxes}
                                </div>
                                <div style={{ alignSelf: 'flex-start' }}>
                                    {selectAllCheckbox}
                                </div>
                            </div>
                        </div>
                        <h4>
                            Select which datasets the parameters should be visualised from
                            <ErrorMessage errors={errors} name="datasets"/>
                        </h4>
                        <div className="form-group">
                            <div className="form-control">
                                {datasetCheckboxes}
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="form-actions">
                                <input className="button" type="reset" value="Cancel"/>
                                <input className="button" type="submit" value="Configure"/>
                            </div>
                        </div>
                    </form>
                )}
            </Modal>
        );
    }
};