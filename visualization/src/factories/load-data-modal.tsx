// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import {
    LoadDataModalFactory,
} from '@kepler.gl/components';
import WhatIfScenarioGallery from '../components/load-data-modal/whatif-scenario-gallery';
import {loadRemoteMap, loadScenario, loadPrediction, loadSampleConfigurations, loadPredictionConfigurations} from '../actions';
import React from "react";
import {useIntl} from "react-intl";
import styled from "styled-components";
import {connect} from "react-redux";

const StyledLoadDataModal = styled.div.attrs({
    className: 'load-data-modal'
})`
    padding: ${props => props.theme.modalPadding};
    min-height: 440px;
    display: flex;
    flex-direction: column;
`;

type LoadDataModalProps = {
    onClose?: (...args: any) => any;
};

CustomLoadDataModalFactory.deps = [
    ...LoadDataModalFactory.deps
];

function CustomLoadDataModalFactory() {
    const LoadDataModal: React.FC<LoadDataModalProps> = props => {
        const intl = useIntl();

        return (
            <StyledLoadDataModal>
                <WhatIfScenarioGallery intl={intl} {...props} />
            </StyledLoadDataModal>
        );
    };

    const mapStateToProps = state => ({
        ...state.demo.app,
        ...state.demo.keplerGl.map.uiState,
        ...state.demo.user
    });

    const mapDispatchToProps = {
        onLoadScenario: loadScenario,
        onLoadPrediction: loadPrediction,
        onLoadRemoteMap: loadRemoteMap,
        loadSampleConfigurations,
        loadPredictionConfigurations
    };

    return connect(mapStateToProps, mapDispatchToProps)(LoadDataModal);
}

export function replaceLoadDataModal() {
    return [LoadDataModalFactory, CustomLoadDataModalFactory];
}
