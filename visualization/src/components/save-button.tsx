/**
 * Getting the current state of kepler.gl for saving to a file.
 *
 * See also: https://docs.kepler.gl/docs/api-reference/advanced-usages/saving-loading-w-schema
 */
import React from 'react';
import styled from 'styled-components';
import KeplerGlSchema from '@kepler.gl/schemas';
import { Action } from 'redux';
import { useStore } from 'react-redux';
import { Icons } from '@kepler.gl/components';
import { StoreData } from '../store';
import { saveAs } from 'file-saver';

const PositionedElement = styled.div`
    font-family: ff-clan-web-pro,'Helvetica Neue',Helvetica,sans-serif;
    position: absolute;
    right: 70px;
    top: 10px;
    z-index: 1;

    svg {
        margin: 0 8px 0 0;
    }
`;

const StyledButton = styled.button`
    align-items: center;
    background-color: #0F9668;
    border: 0;
    color: #FFFFFF;
    cursor: pointer;
    display: inline-flex;
    font-weight: 500;
    justify-content: center;
    line-height: 14px;
    outline: 0;
    padding: 9px 12px;
    text-align: center;
    transition: all .4s ease;
`;

const SaveButton = () =>{
    const store = useStore<StoreData, Action>();

    const onSaveMap = () => {
        const currentState = store.getState();
        const dataToSave = currentState.demo.keplerGl.map.visState.changes;

        const finalData = {
            ...dataToSave,
            "scenario": {
                "bicycle percentage": 0.0,
                "vehicle percentage": 0.0,
                "day type": ["weekend"],
                "time slots": [0],
            }
        }
        saveAs(new Blob([JSON.stringify(finalData, null, 2)], { type: "application/json" }), "mapData.json");
    };

    return (
        <PositionedElement>
            <StyledButton onClick={onSaveMap}>
                <Icons.Save />
                Save Map
            </StyledButton>
        </PositionedElement>
    );
};

export default SaveButton;
