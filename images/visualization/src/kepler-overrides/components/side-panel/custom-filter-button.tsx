import React, {useCallback} from 'react';
import {addFilter, removeFilter, setFilter} from "@kepler.gl/actions";
import {useAppDispatch, useAppSelector} from "../../../hooks";
import {FormattedMessage} from "@kepler.gl/localization";
import {Button} from "@kepler.gl/components";
import {useSelector} from "react-redux";
import {selectAuthenticated} from "../../../features/user/userSlice";

const CustomFilterButton = ({ buttonText, buttonId }) => {

    const dispatch = useAppDispatch();
    const filters = useAppSelector((state) => state.demo.keplerGl.map.visState.filters);
    const datasets = useAppSelector((state) => state.demo.keplerGl.map.visState.datasets);
    const isAuthenticated = useSelector(selectAuthenticated);
    const visState = useSelector((state: any) => state?.demo?.keplerGl?.map?.visState);
    const isPredictionLoaded = visState?.layers?.length > 0 && visState?.layers[0]?.id.startsWith('prediction_');

    const createTimelineFilter = useCallback(() => {
        let filterId = filters.length;
        for (const dataset in datasets) {
            dispatch(addFilter(dataset));
            dispatch(setFilter(filterId, 'name', 'time_window'));
            filterId += 1;
        }
    }, [dispatch, filters]);

    const createPollutantFilter = useCallback(() => {
        let filterId = filters.length;
        for (const dataset in datasets) {
            dispatch(addFilter(dataset));
            dispatch(setFilter(filterId, 'name', 'occupancy'));

	        const fields = datasets[dataset]?.fields || [];
	        const field = fields.find(f => f['id'] === 'occupancy');
	        const domain = field?.filterProps?.domain || [];
	        const smallestValue = datasets[dataset].dataContainer.reduce((min, row) => {
	          const value = row.valueAt(field.fieldIdx);
	          return value > 0 && (min === undefined || value < min) ? value : min;
	        }, undefined);
	
	        dispatch(setFilter(filterId, 'value', [smallestValue, domain[domain.length - 1]]));
	        filterId += 1;
	    }
    }, [dispatch, filters, datasets]);

    const removeFilterFromMap = useCallback((filterName: string) => {
      const filterIndices = filters.reduce((indices: number[], filter: { name: string[]; }, index: number) => {
        if (filter.name[0] === filterName) {
          indices.push(index);
        }
        return indices;
      }, []);

      const sortedIndices = filterIndices.slice().sort((a, b) => b - a);
      sortedIndices.forEach((index: number) => dispatch(removeFilter(index)));
    }, [dispatch, filters]);

    const handleClick = useCallback(() => {
        let filterName;
        let addFilterCallback;

        switch (buttonId) {
            case 'timeScale':
                filterName = 'time_window';
                addFilterCallback = createTimelineFilter;
                break;
            case 'noPollution':
                filterName = 'occupancy';
                addFilterCallback = createPollutantFilter;
                break;
            default:
                console.warn(`No matching case for buttonId: ${buttonId}`);
                return;
        }

        const filterExists = filters.some(f => f.name[0] === filterName);

        if (filterExists) {
            removeFilterFromMap(filterName);
        } else {
            addFilterCallback();
        }
    }, [filters, buttonId, removeFilterFromMap, createTimelineFilter, createPollutantFilter]);

    if (isAuthenticated && isPredictionLoaded) {
      return (
        <Button onClick={handleClick}
          tabIndex={-1}
          className="add-filter-button"
          width="145px">
          <FormattedMessage id={buttonText} />
        </Button>
      );
    } else {
      return null;
    }
};

export default CustomFilterButton;