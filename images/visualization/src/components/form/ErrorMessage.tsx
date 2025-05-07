import React from "react";

export type ErrorMessageProperties = {
    name: string,
    errors: any,
}

export const ErrorMessage = ({errors, name}: ErrorMessageProperties) => (
    <>{ errors[name] && <p role="alert" className="form-error">{errors[name].message}</p> }</>
)
