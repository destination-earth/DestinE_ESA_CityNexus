import React, {useState} from "react";
import {findDOMNode} from "react-dom";
import {useSelector} from "react-redux";
import {
    closeSimulationConfigModal,
    selectSimulationConfigModalState,
    selectModalStatus, createPrediction, isPredictionNameUsed
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
import {
    selectCurrentScenarioId,
    selectIsProjectImmerseon
} from "../../../user/userSlice";

const SimulationParametersValidation = {
    name: {
        required: { value: true, message: "Please specify a simulation name." },
    },
    bicyclePercentage: {
        required: { value: true, message: "Please specify the percentage of bicycle traffic." },
        min: { value: 0, message: "Must be more than 0." },
        max: { value: 1, message: "Must be less than 1." },
    },
    eVehiclePercentage: {
        required: { value: true, message: "Please specify the percentage of e-vehicle traffic." },
        min: { value: 0, message: "Must be more than 0." },
        max: { value: 1, message: "Must be less than 1." },
    },
    dayType: {
        validate: (value) => value.length > 0 || "Select at least one.",
    },
    timeSlot: {
        validate: (value) => value.length > 0 || "Select at least one.",
    },
    rainfall: {
        required: { value: true, message: "Please specify the rainfall." },
        min: { value: 0, message: "Must be more than 0 millimeters." },
        max: { value: 200, message: "Must be less than 200 millimeters." },
    },
    seaLevelRise: {
        required: { value: true, message: "Please specify the sea level rise." },
        min: { value: 0, message: "Must be more than 0 meters." },
        max: { value: 5, message: "Must be less than 5 meters." },
    },
    riverDischarge: {
        required: { value: true, message: "Please specify the river discharge." },
        min: { value: 0, message: "Must be more than 0 cubic meters/second." },
        max: { value: 1000, message: "Must be less than 1000 cubic meters/second." },
    },
    dayTypeExplanation: {
        required: { value: true, message: "Please specify the XAI day type." },
    },
    timeSlotExplanation: {
        required: { value: true, message: "Please specify the XAI time slot." },
    },
    attributeExplanation: {
        required: { value: true, message: "Please specify the XAI attribute." },
    },
}

export const SimulationDataValidation = {
    agricultural_landuse: { type: 'float', min: 0.0, max: 240000.0 },
    commercial_landuse: { type: 'float', min: 0.0, max: 272000.0 },
    industrial_landuse: { type: 'float', min: 0.0, max: 363000.0 },
    natural_landuse: { type: 'float', min: 0.0, max: 320000.0 },
    residential_landuse: { type: 'float', min: 0.0, max: 542000.0 },
    food_pois: { type: 'int', min: 0, max: 64 },
    fun_pois: { type: 'int', min: 0, max: 58 },
    health_pois: { type: 'int', min: 0, max: 7 },
    infrastructure_pois: { type: 'int', min: 0, max: 418 },
    school_pois: { type: 'int', min: 0, max: 6 },
    services_pois: { type: 'int', min: 0, max: 28 },
    shop_pois: { type: 'int', min: 0, max: 108 },
    sport_pois: { type: 'int', min: 0, max: 23 },
    tourism_pois: { type: 'int', min: 0, max: 55 },
    static_population: { type: 'int', min: 0, max: 2101 },
    speed: { type: 'int', min: 5, max: 110 }
}

export const SimulationConfigModal = (props: any) => {
    const { rootNode } = props;
    const isConfigModalOpen = useSelector(selectSimulationConfigModalState);
    const dispatch = useAppDispatch();
    const visState = useSelector((state: any) => state?.demo.undoRedo?.changes);
    const simulationStatus = useSelector(selectModalStatus);
    const { register, handleSubmit, setError, clearErrors, formState: { errors } } = useForm<SimulationParameters>(
        { defaultValues: new SimulationParameters() }
    );
    const [isCheckingName, setIsCheckingName] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [selectedDayTypes, setSelectedDayTypes] = useState<string[]>(["weekday"]);
    const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>(["3"]);
    const isProjectImmerseon = useSelector(selectIsProjectImmerseon);
    const scenarioId = useSelector(selectCurrentScenarioId);

    const updateSelectedTimeSlots = (newValue, checked) => {
        setSelectedTimeSlots(checked ?
            [...selectedTimeSlots, newValue] :
            selectedTimeSlots.filter(value => newValue !== value)
        );
    }

    const updateSelectedDayTypes = (newValue, checked) => {
        setSelectedDayTypes(checked ?
            [...selectedDayTypes, newValue] :
            selectedDayTypes.filter(value => newValue !== value)
        );
    }

    const DefaultStyle = css`max-width: 600px; font-family: ff-clan-web-pro,'Helvetica Neue',Helvetica,sans-serif;`;

    const onCancel = () => {
        dispatch(closeSimulationConfigModal());
    };

    const onSubmit: SubmitHandler<SimulationParameters> = async (data: SimulationParameters) => {
        try {
            if ((Number(data.bicyclePercentage) + Number(data.eVehiclePercentage)) > 1) {
                setError("bicyclePercentage", {
                    type: "manual",
                    message: "The sum of bicycle and e-vehicle percentages must not exceed 1."
                });
                setError("eVehiclePercentage", {
                    type: "manual",
                    message: "The sum of bicycle and e-vehicle percentages must not exceed 1."
                });
                setIsCheckingName(false);
                return;
            }
            const simulationInputs = SimulationInputsFactory.build(visState, data, isProjectImmerseon, showExplanation);
            setIsCheckingName(true);
            const isNameUsed = await dispatch(isPredictionNameUsed({name: data.name, scenarioId})).unwrap();
            if (isNameUsed) {
                setError("name", {
                    type: "manual",
                    message: "This simulation name is already used"
                });
                setIsCheckingName(false);
                return;
            }
            clearErrors("name");
            const result = await dispatch(createPrediction({simulationInputs: simulationInputs, name: data.name})).unwrap();
            if (result.status !== 200) {
                dispatch(addNotification(createNotification({
                    type: DEFAULT_NOTIFICATION_TYPES.error,
                    message: `Unable to create simulation: ${result.detail}. Please check the console for more information.`,
                    topic: DEFAULT_NOTIFICATION_TOPICS.global
                })))
                console.error("Unable to create simulation", result);
            }

            dispatch(closeSimulationConfigModal());
        } catch (e) {
            dispatch(addNotification(createNotification({
                type: DEFAULT_NOTIFICATION_TYPES.error,
                message: 'Unable to create simulation. Please check the console for more information.',
                topic: DEFAULT_NOTIFICATION_TOPICS.global
            })))
            console.error("Unable to create simulation", e);
        } finally {
            setIsCheckingName(false);
        }
    }

    const timeSlotTemplate = [];
    for (let timeSlot in TimeSlotOptions) {
        const key = 'timeSlot' + timeSlot;
        const value = TimeSlotOptions[timeSlot];
        timeSlotTemplate.push(
            (<Checkbox
                showErrors={false}
                key={key}
                name="timeSlot"
                label={value}
                value={timeSlot}
                validation={SimulationParametersValidation.timeSlot}
                errors={errors}
                register={register}
                tooltip={`Simulate traffic for time slot ${value}`}
                onCustomChange={updateSelectedTimeSlots}
            />)
        );
    }

    const explanationTimeSlotTemplate = selectedTimeSlots.sort((a, b) => a - b).map(timeSlot => {
        const key = 'explanationTimeSlot' + timeSlot;
        const value = TimeSlotOptions[timeSlot];
        return (
            <Checkbox key={key} showErrors={false} name="explanationTimeSlot" label={value}
                      value={timeSlot} validation={SimulationParametersValidation.timeSlotExplanation}
                      tooltip={`Generate XAI explanation for time slot ${value}`}
                      errors={errors} register={register} isRadioCheckbox={true}/>
        )
    });

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
                    <Input name="name" label="Simulation Name" validation={SimulationParametersValidation.name}
                           register={register} errors={errors} tooltip="The name of the simulation" />
                </div>
                <div className="form-group">
                    <Input name="bicyclePercentage" label="% Bicycles"
                           validation={SimulationParametersValidation.bicyclePercentage} type="number"
                           register={register} errors={errors} step={0.1} min={0} max={1}
                           tooltip="The percentage of bicycles in the traffic"
                    />
                </div>
                <div className="form-group">
                    <Input name="eVehiclePercentage" label="% E-Vehicles"
                           validation={SimulationParametersValidation.eVehiclePercentage} type="number"
                           register={register} errors={errors} step={0.1} min={0} max={1}
                           tooltip="The percentage of e-vehicles in the traffic"
                    />
                </div>
                <div className="form-group">
                    <div className="form-label" title="Select the type(s) of day the simulation should be run for.">
                        Type of day
                        <ErrorMessage errors={errors} name="dayType"/>
                    </div>
                    <div className="form-control">
                        <Checkbox
                            showErrors={false}
                            name="dayType"
                            label="Weekday (Mo - Fr)"
                            value="weekday"
                            validation={SimulationParametersValidation.dayType}
                            errors={errors}
                            register={register}
                            tooltip={`Simulate traffic on weekdays (Mo - Fr)`}
                            onCustomChange={updateSelectedDayTypes}
                        />
                        <Checkbox
                            showErrors={false}
                            name="dayType"
                            label="Weekend (Sa - Su)"
                            value="weekend"
                            validation={SimulationParametersValidation.dayType}
                            errors={errors}
                            register={register}
                            tooltip={`Simulate traffic on weekends (Sa - Su)`}
                            onCustomChange={updateSelectedDayTypes}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <div className="form-label" title="Select the time slot(s) for which the simulation should be run.">
                        Time Slot
                        <ErrorMessage errors={errors} name="timeSlot"/>
                    </div>
                    <div className="form-control">
                        {timeSlotTemplate}
                    </div>
                </div>
                {isProjectImmerseon && (
                    <>
                        <div className="form-group">
                            <Input name="rainfall" label="Rainfall in mm"
                                   validation={SimulationParametersValidation.rainfall} errors={errors}
                                   register={register} type="number"
                                   step={5} min={0} max={200} tooltip="The amount of rainfall in millimeters"/>
                        </div>
                        <div className="form-group">
                            <Input name="seaLevelRise" label="Sea Level Rise in m"
                                   validation={SimulationParametersValidation.seaLevelRise}
                                   errors={errors} register={register} type="number"
                                   step={.1} min={0} max={5} tooltip="The amount of sea level rise in meters"/>
                        </div>
                        <div className="form-group">
                            <Input name="riverDischarge" label="River Discharge in m3/s"
                                   validation={SimulationParametersValidation.riverDischarge}
                                   errors={errors} register={register} type="number"
                                   step={10} min={0} max={1000} tooltip="The amount of river discharge in cubic meters per second"/>
                        </div>
                    </>
                )
                }
                {!isProjectImmerseon && <div className="form-group">
                    <div className="form-actions">
                        <input className="button" type="button" value="Add Explanation"
                               onClick={() => setShowExplanation(!showExplanation)} disabled={true}/>
                    </div>
                </div>}
                {showExplanation && (
                    <>
                        <div className="form-group">
                            <div className="form-label"
                                 title="Select the type of day the explanation should be calculated for.">
                                Type of Day (XAI)
                                <ErrorMessage errors={errors} name="explanationDayType"/>
                            </div>
                            <div className="form-control">
                                {selectedDayTypes.map(dayType => (
                                    <Checkbox key={dayType} showErrors={false} name="explanationDayType" label={dayType}
                                              value={dayType}
                                              validation={SimulationParametersValidation.dayTypeExplanation}
                                              tooltip={`Generate XAI explanation for the day type ${dayType}`}
                                              errors={errors} register={register} isRadioCheckbox={true}/>
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="form-label"
                                 title="Select the time slot for which the explanation should be calculated.">
                                Time Slot (XAI)
                                <ErrorMessage errors={errors} name="explanationTimeSlot"/>
                            </div>
                            <div className="form-control">
                                {explanationTimeSlotTemplate}
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="form-label"
                                 title="Select the attribute for which the explanation should be calculated.">
                                Attribute (XAI)
                                <ErrorMessage errors={errors} name="explanationAttribute"/>
                            </div>
                            <div className="form-control">
                                {['no2', 'co2', 'nox', 'pmx', 'hc', 'co', 'no2 mcg/m3'].map(attribute => (
                                    <Checkbox key={attribute} showErrors={false} name="explanationAttribute"
                                              label={attribute}
                                              value={attribute}
                                              validation={SimulationParametersValidation.attributeExplanation}
                                              errors={errors}
                                              register={register}
                                              isRadioCheckbox={true}
                                              showUnit={true}
                                              tooltip={`Generate XAI explanation for ${attribute}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
                <div className="form-group">
                    <div className="form-actions">
                        <input className="button" type="reset" value="Cancel"/>
                        <input className="button" type="submit"
                               value={simulationStatus === 'idle' ? 'Start Simulation' : 'Saving...'}
                               disabled={simulationStatus !== 'idle'}
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
};
