// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import {PanelHeaderFactory, Icons} from '@kepler.gl/components';
import {BUG_REPORT_LINK, USER_GUIDE_DOC} from '@kepler.gl/constants';
import {useDispatch} from "react-redux";
import {login} from "../../../features/user/userSlice";
import {PanelHeader} from "../../../components/panel-header/PanelHeader";

export function CustomPanelHeaderFactory(...deps) {
  return PanelHeader;
}

CustomPanelHeaderFactory.deps = PanelHeaderFactory.deps;

export function replacePanelHeader() {
  return [PanelHeaderFactory, CustomPanelHeaderFactory];
}
