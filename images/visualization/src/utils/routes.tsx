// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import {IndexRoute, Route} from 'react-router';
import React from 'react';

export function buildAppRoutes(Component) {
  return [
    <Route key="demo" path="demo">
      <IndexRoute component={Component} />
      <Route path="map" component={Component} />
      <Route path="(:id)" component={Component} />
      <Route path="map/:provider" component={Component} />
    </Route>
  ];
}
