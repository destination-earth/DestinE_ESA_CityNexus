import React from 'react';
import {ADD_DATA_ID} from "@kepler.gl/constants";
import {toggleModal} from "@kepler.gl/actions";
import {useDispatch, useSelector} from "react-redux";

const DEFAULT_MAX_LOADED_PREDICTIONS = 3;

export const NewVisualizationButton = () => {

  const dispatch = useDispatch();
  const visState = useSelector((state: any) => state?.demo?.keplerGl?.map?.visState);
  const isButtonEnabled = Object.keys(visState.datasets).length < DEFAULT_MAX_LOADED_PREDICTIONS;


  const onOpenModal = async () => {
      try {
        dispatch(toggleModal(ADD_DATA_ID));
      } catch (err) {
          console.error('Encountered an error: ', err)
      }
    };

  return (
    <button
      onClick={onOpenModal}
      title={"Open"}
      disabled={!isButtonEnabled}
    >
        Open
    </button>
  );
};

export default NewVisualizationButton;