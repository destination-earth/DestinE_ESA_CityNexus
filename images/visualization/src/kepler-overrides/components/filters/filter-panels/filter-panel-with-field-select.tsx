import React, {useCallback, useMemo} from "react";
import {
    FilterPanelWithFieldSelectComponent
} from "@kepler.gl/components/dist/filters/filter-panels/types";
import {KeplerTable} from "@kepler.gl/table";
import {
    FieldSelectorFactory,
    FilterPanelHeaderFactory,
    PanelHeaderActionFactory,
    SourceDataSelectorFactory, StyledFilterContent
} from "@kepler.gl/components";
import FieldPanelWithFieldSelectFactory
    from "@kepler.gl/components/dist/filters/filter-panels/filter-panel-with-field-select";
import {getSupportedFilterFields} from "@kepler.gl/components/dist/filters/filter-panels/new-filter-panel";

CustomFieldPanelWithFieldSelectFactory.deps = FieldPanelWithFieldSelectFactory.deps;

function CustomFieldPanelWithFieldSelectFactory(
    FilterPanelHeader: ReturnType<typeof FilterPanelHeaderFactory>,
    SourceDataSelector: ReturnType<typeof SourceDataSelectorFactory>,
    FieldSelector: ReturnType<typeof FieldSelectorFactory>,
    PanelHeaderAction: ReturnType<typeof PanelHeaderActionFactory>
) {
    const FilterPanelWithFieldSelect: FilterPanelWithFieldSelectComponent = React.memo(
        ({
             children,
             allAvailableFields,
             datasets,
             filter,
             idx,
             removeFilter,
             setFilter,
             panelActions = []
         }) => {
            const onFieldSelector = useCallback(field => setFilter(idx, 'name', field.name), [
                idx,
                setFilter
            ]);

            const onSourceDataSelector = useCallback(value => setFilter(idx, 'dataId', [value]), [
                idx,
                setFilter
            ]);

            const fieldValue = useMemo(
                () => (Array.isArray(filter.name) ? filter.name[0] : filter.name),
                [filter.name]
            );

            const dataset: KeplerTable = datasets[filter.dataId[0]];
            const supportedFields = useMemo(
                () => getSupportedFilterFields(dataset.supportedFilterTypes, allAvailableFields),
                [dataset.supportedFilterTypes, allAvailableFields]
            );

            let field: React.JSX.Element;
            if (fieldValue === "occupancy") {
                field = <span style={{"color": "#A0A7B4"}}>Occupancy</span>;
            } else if (fieldValue === "time_window") {
                field = <span style={{"color": "#A0A7B4"}}>Time Window</span>;
            } else {
                field = <FieldSelector
                    inputTheme="secondary"
                    fields={supportedFields}
                    value={fieldValue}
                    erasable={false}
                    onSelect={onFieldSelector}
                />
            }

            return (
                <>
                    <FilterPanelHeader datasets={[dataset]} filter={filter} removeFilter={removeFilter}>
                        {field}
                        {panelActions.map(panelAction => (
                            <PanelHeaderAction
                                id={panelAction.id}
                                key={panelAction.id}
                                onClick={panelAction.onClick}
                                tooltip={panelAction.tooltip}
                                IconComponent={panelAction.iconComponent}
                                active={panelAction.active}
                            />
                        ))}
                    </FilterPanelHeader>
                    <StyledFilterContent className="filter-panel__content">
                        {Object.keys(datasets).length > 1 && (
                            <SourceDataSelector
                                inputTheme="secondary"
                                datasets={datasets}
                                disabled={filter.freeze}
                                dataId={filter.dataId}
                                onSelect={onSourceDataSelector}
                            />
                        )}
                        {children}
                    </StyledFilterContent>
                </>
            );
        }
    );

    FilterPanelWithFieldSelect.displayName = 'FilterPanelWithFieldSelect';

    return FilterPanelWithFieldSelect;
}

export function replaceFieldPanelWithFieldSelect() {
    return [FieldPanelWithFieldSelectFactory, CustomFieldPanelWithFieldSelectFactory];
}
