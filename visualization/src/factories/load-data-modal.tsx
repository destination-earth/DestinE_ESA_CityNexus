// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import {
    LoadDataModalFactory,
    LoadingDialog, ModalTabsFactory,
    withState
} from '@kepler.gl/components';
import {LOADING_METHODS} from '../constants/default-settings';
import WhatIfScenarioGallery from '../components/load-data-modal/whatif-scenario-gallery';
import PredictionScenarioGallery from '../components/load-data-modal/prediction-gallery';
import {loadRemoteMap, loadSample, loadSampleConfigurations, loadPredictionConfigurations} from '../actions';
import React, {useState} from "react";
import {IntlShape, useIntl} from "react-intl";
import styled from "styled-components";
import get from "lodash.get";

const StyledLoadDataModal = styled.div.attrs({
    className: 'load-data-modal'
})`
    padding: ${props => props.theme.modalPadding};
    min-height: 440px;
    display: flex;
    flex-direction: column;
`;

const noop = () => {
};
const getDefaultMethod = <T, >(methods: T[] = []) =>
    Array.isArray(methods) ? get(methods, [0]) : null;

export interface LoadingMethod {
    id: string;
    label: string;
    elementType: React.ComponentType<any>;
    tabElementType?: React.ComponentType<{ onClick: React.MouseEventHandler; intl: IntlShape }>;
}

type LoadDataModalProps = {
    // call backs
    onLoadCloudMap: (provider: any, vis: any) => void;
    loadingMethods?: LoadingMethod[];
    isCloudMapLoading: boolean;
    onClose?: (...args: any) => any;
};

CustomLoadDataModalFactory.deps = [
    ...LoadDataModalFactory.deps
];

function CustomLoadDataModalFactory(ModalTabs: ReturnType<typeof ModalTabsFactory>) {
    const LoadDataModal: React.FC<LoadDataModalProps> = props => {
        const intl = useIntl();
        const {loadingMethods, isCloudMapLoading} = props;
        const [currentMethod, toggleMethod] = useState(getDefaultMethod(loadingMethods));

        const ElementType = currentMethod?.elementType;

        return (
            <StyledLoadDataModal>
                <ModalTabs
                    currentMethod={currentMethod?.id}
                    loadingMethods={loadingMethods}
                    toggleMethod={toggleMethod}
                />
                {isCloudMapLoading ? (
                    <LoadingDialog size={64}/>
                ) : (
                    ElementType && <ElementType key={currentMethod?.id} intl={intl} {...props} />
                )}
            </StyledLoadDataModal>
        );
    };

    LoadDataModal.defaultProps = {
        loadingMethods: [
            {
                id: LOADING_METHODS.whatif,
                label: 'modal.loadData.what-if',
                elementType: WhatIfScenarioGallery
            },
            {
                id: LOADING_METHODS.prediction,
                label: 'modal.loadData.predictions',
                elementType: PredictionScenarioGallery
            }
        ]
    };

    return withState([], (state: any) => ({...state.demo.app, ...state.demo.keplerGl.map.uiState}), {
        onLoadSample: loadSample,
        onLoadRemoteMap: loadRemoteMap,
        loadSampleConfigurations,
        loadPredictionConfigurations
    })(LoadDataModal);
}

export function replaceLoadDataModal() {
    return [LoadDataModalFactory, CustomLoadDataModalFactory];
}
