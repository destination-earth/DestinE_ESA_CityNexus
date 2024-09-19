import React, {useCallback, useState, ComponentType} from 'react';
import {useIntl} from 'react-intl';

import styled from 'styled-components';
import classnames from 'classnames';
import copy from 'copy-to-clipboard';
import {useDismiss, useFloating, useInteractions} from '@floating-ui/react';
import {Layer} from '@kepler.gl/layers';
import {Filter} from '@kepler.gl/types';
import {Feature} from '@nebula.gl/edit-modes';
import {Datasets} from '@kepler.gl/table';
import {
    ActionPanel,
    ActionPanelItem,
    FeatureActionPanelFactory,
    PureFeatureActionPanelFactory
} from "@kepler.gl/components";
import {Trash, Layers, Copy, Checkmark} from "@kepler.gl/components/dist/common/icons";

const LAYOVER_OFFSET = 4;

const StyledActionsLayer = styled.div`
    position: absolute;
    .layer-panel-item-disabled {
        color: ${props => props.theme.textColor};
    }
`;
const defaultActionIcons = {
    remove: Trash,
    layer: Layers,
    copy: Copy,
    copied: Checkmark
};
CustomFeatureActionPanelFactory.deps = PureFeatureActionPanelFactory.deps;

export interface FeatureActionPanelProps {
    className?: string;
    datasets: Datasets;
    selectedFeature: Feature | null;
    position: {
        x: number;
        y: number;
    } | null;
    layers: Layer[];
    currentFilter?: Filter;
    onToggleLayer: (layer: Layer) => void;
    onDeleteFeature: () => void;
    onClose?: () => void;
    children?: React.ReactNode;
    actionIcons?: {
        [id: string]: React.ElementType;
    };
}

function CustomFeatureActionPanelFactory(): React.FC<FeatureActionPanelProps> {
    const FeatureActionPanel = ({
                                    className,
                                    datasets,
                                    selectedFeature,
                                    position,
                                    layers,
                                    currentFilter,
                                    onToggleLayer,
                                    onDeleteFeature,
                                    actionIcons = defaultActionIcons,
                                    children,
                                    onClose
                                }: FeatureActionPanelProps) => {

        const {layerId = []} = currentFilter || {};
        const intl = useIntl();

        const {refs, context} = useFloating({
            open: true,
            onOpenChange: v => {
                if (!v && onClose) {
                    onClose();
                }
            }
        });
        const dismiss = useDismiss(context);

        const {getFloatingProps} = useInteractions([dismiss]);

        if (!position) {
            return null;
        }

        return (
            <StyledActionsLayer
                ref={refs.setFloating}
                {...getFloatingProps()}
                className={classnames('feature-action-panel', className)}
                style={{
                    top: `${position.y + LAYOVER_OFFSET}px`,
                    left: `${position.x + LAYOVER_OFFSET}px`
                }}
            >
                <ActionPanel>
                    {children}
                    <ActionPanelItem
                        label={intl.formatMessage({id: 'tooltip.delete', defaultMessage: 'Delete'})}
                        className="delete-panel-item"
                        Icon={actionIcons.remove}
                        onClick={onDeleteFeature}
                    />
                </ActionPanel>
            </StyledActionsLayer>
        );
    };

    FeatureActionPanel.displayName = 'FeatureActionPanel';
    FeatureActionPanel.defaultProps = {
        position: null,
        actionIcons: defaultActionIcons
    };

    return FeatureActionPanel;
}

export function replaceFeatureActionPanelFactory() {
    return [FeatureActionPanelFactory, CustomFeatureActionPanelFactory];
}

export function replacePureFeatureActionPanelFactory() {
    return [PureFeatureActionPanelFactory, CustomFeatureActionPanelFactory];
}
