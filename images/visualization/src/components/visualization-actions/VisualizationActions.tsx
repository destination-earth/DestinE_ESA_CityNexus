import React from "react";
import "./visualization-actions.scss";

export const VisualizationActions = (props) => {
    const {children} = props;
    return (<div className="visualization-actions">{ children }</div>)
}