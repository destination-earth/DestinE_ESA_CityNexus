/**
 * Getting the current state of kepler.gl for saving to a file.
 *
 * See also: https://docs.kepler.gl/docs/api-reference/advanced-usages/saving-loading-w-schema
 */
import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import {FaRedo, FaUndo} from "react-icons/fa";
import {canRedo, canUndo, redo, undo} from "./undo-redo/store/UndoRedoReducer";
import {RootState} from "../store";

export const UndoButton = () => {
    const visState = useSelector((state: any) => state?.demo?.keplerGl?.map?.visState);
    const dispatch = useDispatch();
    const undoRedoState = useSelector((state: RootState) => state.undoRedo);
    const isUndoEnabled = undoRedoState.canUndo;

    function handleUndo() {
        if (isUndoEnabled) {
            dispatch(undo());
        }
    }

    if (visState && visState.layers && visState?.layers.length === 2) {
        return (
            <button onClick={handleUndo} disabled={!isUndoEnabled}
                    title={isUndoEnabled ? "Undo last change to the scenario" : "No changes made"}>
                <FaUndo/>
                Undo
            </button>
        );
    } else {
        return null;
    }
};

export const RedoButton = () => {
    const visState = useSelector((state: any) => state?.demo?.keplerGl?.map?.visState);
    const undoRedoState = useSelector((state: RootState) => state.undoRedo);
    const dispatch = useDispatch();
    const isRedoEnabled = undoRedoState.canRedo;

    function handleRedo() {
        if (isRedoEnabled) {
            dispatch(redo());
        }
    }

    if (visState && visState.layers && visState?.layers.length === 2) {
        return (
            <button onClick={handleRedo} disabled={!isRedoEnabled}
                    title={isRedoEnabled ? "Redo undone change to the scenario" : "No undone changes made"}>
                <FaRedo/>
                Redo
            </button>
        );
    } else {
        return null;
    }
};