import {UseFormRegister} from "react-hook-form";
import React from "react";
import {ErrorMessage} from "./ErrorMessage";

export type CheckboxProperties = {
    name: string,
    label: string,
    value: string | number,
    validation: any,
    errors: any,
    register: UseFormRegister<any>,
    showErrors?: boolean,
}

export const Checkbox = ({name, value, label, validation, errors, register, showErrors = false}: CheckboxProperties) => {
    const id = name + '_' + value;
    return (
        <div className="form-check">
            <input id={id} name={name} value={value} type="checkbox" {...register(name, validation)} aria-invalid={errors[name] ? "true" : "false"} />
            <div>
                <label htmlFor={id}>{label}</label>
                { showErrors && <ErrorMessage errors={errors} name={name} /> }
            </div>
        </div>
    )
}
