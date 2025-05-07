import React from "react";
import {UseFormRegister} from "react-hook-form";
import {ErrorMessage} from "./ErrorMessage";

type InputProperties = {
    name: string,
    label: string,
    validation: any,
    errors: any,
    register: UseFormRegister<any>,
    type?: string,
    tooltip?: string
}

export const Input = ({name, label, validation, errors, register, type = "text", tooltip = undefined, ...props}: InputProperties) => (
    <>
        <div className="form-label" title={tooltip}><label htmlFor={name}>{label}</label></div>
        <div className="form-control">
            <input id={name} {...register(name, validation)} aria-invalid={errors[name] ? "true" : "false"} type={type} {...props} />
            <ErrorMessage errors={errors} name={name} />
        </div>
    </>
)
