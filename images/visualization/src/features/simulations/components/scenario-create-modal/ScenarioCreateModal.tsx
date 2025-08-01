import React, {useState} from "react";
import {findDOMNode} from "react-dom";
import {useSelector} from "react-redux";
import {
    closeScenarioCreateModal,
    createScenario, isScenarioNameUsed,
    selectModalStatus,
    selectScenarioCreateModalState
} from "../../store/simulationSlice";
import {css} from "styled-components";
import {Modal} from "@kepler.gl/components";
import "../simulation-config-modal/SimulationConfigModal.scss";
import {SubmitHandler, useForm} from "react-hook-form";
import {Input} from "../../../../components/form/Input";
import {SimulationParameters} from "../../models/SimulationParameters";
import {DEFAULT_NOTIFICATION_TOPICS, DEFAULT_NOTIFICATION_TYPES} from "@kepler.gl/constants";
import {
    selectCurrentScenarioCity,
    selectSelectedProjectTypeString,
    selectUserToken,
} from "../../../user/userSlice";
import {createNotification} from "@kepler.gl/utils";
import {addNotification} from "@kepler.gl/actions";
import {useAppDispatch} from "../../../../hooks";
import {ScenarioCreateParameters} from "../../models/ScenarioCreateParameters";
import {loadScenario} from "../../../../actions";

const ScenarioParametersValidation = {
    "name": {
        required: {value: true, message: "Please specify a simulation name."},
    },
    "description": {}
}

export const ScenarioCreateModal = (props: any) => {
    const {rootNode} = props;
    const isConfigModalOpen = useSelector(selectScenarioCreateModalState)
    const dispatch = useAppDispatch();
    const userId = useSelector(selectUserToken);
    const modalStatus = useSelector(selectModalStatus);
    const selectedProject = useSelector(selectSelectedProjectTypeString);
    const selectedCity = useSelector(selectCurrentScenarioCity);
    const {register, handleSubmit, setError, clearErrors, formState: { errors }} = useForm<SimulationParameters>(
        { defaultValues: new ScenarioCreateParameters() })
    const [isCheckingName, setIsCheckingName] = useState(false);

    const DefaultStyle = css`max-width: 600px; font-family: ff-clan-web-pro,'Helvetica Neue',Helvetica,sans-serif;`;

    const onCancel = () => {
        dispatch(closeScenarioCreateModal());
    }

    const onSubmit: SubmitHandler<ScenarioCreateParameters> = async (data: ScenarioCreateParameters) => {
        try {
            setIsCheckingName(true);
            const isNameUsed = await dispatch(isScenarioNameUsed({name: data.name, city: selectedCity})).unwrap();
            if (isNameUsed) {
                setError("name", {
                    type: "manual",
                    message: "This scenario name is already used"
                });
                setIsCheckingName(false);
                return;
            }
            clearErrors("name");
            const scenarioId = await dispatch(createScenario({
                name: data.name,
                project: selectedProject,
                description: data.description,
                city: selectedCity
            })).unwrap();

            dispatch(loadScenario({id: scenarioId, label: data.name, city: selectedCity}, userId));
            dispatch(closeScenarioCreateModal());
        } catch (e) {
            dispatch(addNotification(createNotification({
                type: DEFAULT_NOTIFICATION_TYPES.error,
                message: 'Unable to create scenario. Please check the console for more information.',
                topic: DEFAULT_NOTIFICATION_TOPICS.global
            })))
            console.error("Unable to create scenario", e);
        } finally {
            setIsCheckingName(false);
        }
    }

    if (!rootNode) return null;
    return (
        <Modal
            title="Save Scenario As"
            parentSelector={() => findDOMNode(rootNode) as HTMLElement}
            isOpen={isConfigModalOpen}
            theme={null}
            cssStyle={DefaultStyle}
            onCancel={onCancel}
        >
            <form onSubmit={handleSubmit(onSubmit)} onReset={onCancel} className="citynexus-form">
                <div className="form-group">
                    <Input name="name" label="Scenario Name" validation={ScenarioParametersValidation.name}
                           register={register} errors={errors}/>
                </div>
                <div className="form-group">
                    <Input name="description" label="Scenario Description"
                           validation={ScenarioParametersValidation.description} register={register} errors={errors}/>
                </div>
                <div className="form-group">
                    <div className="form-actions">
                        <input className="button" type="reset" value="Cancel"/>
                        <input className="button" type="submit"
                               value={modalStatus === 'idle' && !isCheckingName ? 'Save Scenario' : 'Saving...'}
                               disabled={modalStatus !== 'idle' || isCheckingName}/>
                    </div>
                </div>
            </form>
        </Modal>
    )
}
