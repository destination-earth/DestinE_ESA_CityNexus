import React from 'react';
import {
  AddDataButtonFactory
} from "@kepler.gl/components";
import "../../../../components/visualization-actions/visualization-actions.scss";

type AddDataButtonProps = {
  onClick: () => void;
  isInactive: boolean;
};

export default function CustomAddDataButtonFactory() {
  return (props: AddDataButtonProps) => null
}


export function replaceAddDataButtonFactory() {
  return [AddDataButtonFactory, CustomAddDataButtonFactory];
}