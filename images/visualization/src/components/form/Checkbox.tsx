import {UseFormRegister} from "react-hook-form";
import React from "react";
import {ErrorMessage} from "./ErrorMessage";

import {fieldUnits} from "../../features/map/field-units";

export type CheckboxProperties = {
    name: string,
    label: string,
    value: string | number,
    validation: any,
    errors: any,
    register?: UseFormRegister<any>,
    showErrors?: boolean,
    onCustomChange?: (event: React.ChangeEvent<HTMLInputElement>) => void,
    isRadioCheckbox?: boolean,
    showUnit?: boolean,
    tooltip?: string,
    checked?: boolean,
}

export const Checkbox = ({name, value, label, validation, errors, register, onCustomChange,
                             showErrors = false, isRadioCheckbox = false, showUnit = false, tooltip, checked}: CheckboxProperties) => {
    const id = name + '_' + value;

    const { onChange, ...registerProps } = register ? register(name, validation) : { onChange: undefined };
    return (
        <div className="form-check" title={tooltip || `Select ${label}`}>
            <input
                id={id}
                name={name}
                value={value}
                type={isRadioCheckbox ? "radio" : "checkbox"}
                onChange={(event) => {
                    if (onCustomChange) {
                        const { value, checked } = event.target;
                        onCustomChange(value, checked);
                    }
                    if (onChange) return onChange(event);
                }}
                {...registerProps}
                aria-invalid={errors[name] ? "true" : "false"}
                checked={typeof checked === 'boolean' ? checked : undefined}
            />
            <div>
                <label htmlFor={id} style={name === 'select_all' ? { fontStyle: 'italic' } : {}}>
                    {label}
                    {showUnit && <span style={{ color: 'grey', fontSize: '0.85em', marginLeft: '0.5em' }}>({fieldUnits[value]})</span>}
                </label>
                { showErrors && <ErrorMessage errors={errors} name={name} /> }
            </div>
        </div>
    )
}
