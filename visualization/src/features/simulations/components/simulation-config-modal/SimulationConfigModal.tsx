import React, {useState} from "react";
import {findDOMNode} from "react-dom";
import {useSelector} from "react-redux";
import {
    closeSimulationConfigModal,
    selectSimulationConfigModalState,
    selectModalStatus, createPrediction, isScenarioNameUsed, isPredictionNameUsed
} from "../../store/simulationSlice";
import {css} from "styled-components";
import {Modal} from "@kepler.gl/components";
import "./SimulationConfigModal.scss";
import {useForm, SubmitHandler} from "react-hook-form";
import {Input} from "../../../../components/form/Input";
import {SimulationParameters} from "../../models/SimulationParameters";
import {Checkbox} from "../../../../components/form/Checkbox";
import {ErrorMessage} from "../../../../components/form/ErrorMessage";
import {DEFAULT_NOTIFICATION_TOPICS, DEFAULT_NOTIFICATION_TYPES} from "@kepler.gl/constants";
import {createNotification} from "@kepler.gl/utils";
import {addNotification} from "@kepler.gl/actions";
import {TimeSlotOptions} from "../../models/TimeSlot";
import {useAppDispatch} from "../../../../hooks";
import {SimulationInputsFactory} from "../../services/SimulationInputsFactory";

const SimulationParametersValidation = {
    "name": {
        required: {value: true, message: "Please specify a simulation name."},
    },
    bicyclePercentage: {
        required: {value: true, message: "Please specify the percentage of bicycle traffic."},
        min: {value: 0, message: "Must be more than 0."},
        max: {value: 1, message: "Must be less than 1."},
    },
    eVehiclePercentage: {
        required: {value: true, message: "Please specify the percentage of e-vehicle traffic."},
        min: {value: 0, message: "Must be more than 0."},
        max: {value: 1, message: "Must be less than 1."},
    },
    dayType: {
        validate: (value) => value.length > 0 || "Select at least one.",
    },
    timeSlot: {
        validate: (value) => value.length > 0 || "Select at least one.",
    },
}

export const SimulationConfigModal = (props: any) => {
    const {rootNode} = props;
    const isConfigModalOpen = useSelector(selectSimulationConfigModalState)
    const dispatch = useAppDispatch();
    const visState = useSelector((state: any) => state?.demo?.keplerGl?.map?.visState);
    const simulationStatus = useSelector(selectModalStatus);
    const {register, handleSubmit, setError, clearErrors, formState: { errors }} = useForm<SimulationParameters>(
        { defaultValues: new SimulationParameters() })
    const [isCheckingName, setIsCheckingName] = useState(false);

    const DefaultStyle = css`max-width: 600px;`;

    const onCancel = () => {
        dispatch(closeSimulationConfigModal());
    }

    const onSubmit: SubmitHandler<SimulationParameters> = async (data: SimulationParameters) => {
        try {
            const simulationInputs = SimulationInputsFactory.build(visState, data);
            setIsCheckingName(true);
            const isNameUsed = await dispatch(isPredictionNameUsed(data.name)).unwrap();
            if (isNameUsed) {
                setError("name", {
                    type: "manual",
                    message: "This simulation name is already used"
                });
                setIsCheckingName(false);
                return;
            }
            clearErrors("name");
            await dispatch(createPrediction({simulationInputs: simulationInputs, name: data.name})).unwrap();
            dispatch(closeSimulationConfigModal());
        } catch (e) {
            dispatch(addNotification(createNotification({
                type: DEFAULT_NOTIFICATION_TYPES.error,
                message: 'Unable to create simulation. Please check the console for more information.',
                topic: DEFAULT_NOTIFICATION_TOPICS.global
            })))
            console.error("Unable to create simulation", e);
        }
    }

    const timeSlotTemplate = [];
    for (let timeSlot in TimeSlotOptions) {
        const key = 'timeSlot' + timeSlot;
        const value = TimeSlotOptions[timeSlot];
        timeSlotTemplate.push(
            (<Checkbox showErrors={false} key={key} name="timeSlot" label={value} value={timeSlot} validation={SimulationParametersValidation.timeSlot} errors={errors} register={register} />)
        );
    }

    if (!rootNode) return null;
    return (
        <Modal
            title="Start New Simulation"
            parentSelector={() => findDOMNode(rootNode) as HTMLElement}
            isOpen={isConfigModalOpen}
            theme={null}
            cssStyle={DefaultStyle}
            onCancel={onCancel}
        >
            <form onSubmit={handleSubmit(onSubmit)} onReset={onCancel} className="citynexus-form">
                <div className="form-group">
                    <Input name="name" label="Simulation Name" validation={SimulationParametersValidation.name} register={register} errors={errors} />
                </div>
                <div className="form-group">
                    <Input name="bicyclePercentage" label="% Bicycles" validation={SimulationParametersValidation.bicyclePercentage} type="number" register={register} errors={errors} step={0.1} min={0} max={1} />
                </div>
                <div className="form-group">
                    <Input name="eVehiclePercentage" label="% E-Vehicles" validation={SimulationParametersValidation.eVehiclePercentage} type="number" register={register} errors={errors} step={0.1} min={0} max={1} />
                </div>
                <div className="form-group">
                    <div className="form-label">
                        Type of day
                        <ErrorMessage errors={errors} name="dayType" />
                    </div>
                    <div className="form-control">
                        <Checkbox showErrors={false} name="dayType" label="Weekday (Mo - Fr)" value="weekday" validation={SimulationParametersValidation.dayType} errors={errors} register={register} />
                        <Checkbox showErrors={false} name="dayType" label="Weekend (Sa - Su)" value="weekend" validation={SimulationParametersValidation.dayType} errors={errors} register={register} />
                    </div>
                </div>
                <div className="form-group">
                    <div className="form-label">
                        Time Slot
                        <ErrorMessage errors={errors} name="timeSlot" />
                    </div>
                    <div className="form-control">
                        {timeSlotTemplate}
                    </div>
                </div>
                <div className="form-group">
                    <div className="form-actions">
                        <input className="button" type="reset" value="Cancel" />
                        <input className="button" type="submit" value={ simulationStatus === 'idle' ? 'Start Simulation' : 'Saving...' } disabled={simulationStatus !== 'idle'}/>
                    </div>
                </div>
            </form>
        </Modal>
    )
}
