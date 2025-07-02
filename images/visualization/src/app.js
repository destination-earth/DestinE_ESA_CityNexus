// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import React, {Component} from 'react';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import styled, {ThemeProvider} from 'styled-components';
import window from 'global/window';
import {connect} from 'react-redux';

import {theme} from '@kepler.gl/styles';
import Banner from './components/banner';
import Announcement, {FormLink} from './components/announcement';
import {replaceLoadDataModal} from './kepler-overrides/components/modals/load-data-modal';
import {replacePanelHeader} from './kepler-overrides/components/side-panel/panel-header';
import {replaceMapPopover} from "./kepler-overrides/components/map/map-popover";
import {replaceMapContainer} from "./kepler-overrides/components/map-container";
import {replaceLayerHoverInfo} from "./kepler-overrides/components/map/layer-hover-info";
import {replaceMapPopoverContent} from "./kepler-overrides/components/map/map-popover-content";
import {replaceMapDrawPanel} from "./features/map/map-draw-panel";
import {CLOUD_PROVIDERS_CONFIGURATION, DEFAULT_FEATURE_FLAGS} from './constants/default-settings';
import {messages} from './constants/localization';

import {
  onExportFileSuccess,
  onLoadCloudMapSuccess
} from './actions';

import {addNotification} from '@kepler.gl/actions';
import {
  replaceFeatureActionPanelFactory,
  replacePureFeatureActionPanelFactory
} from "./kepler-overrides/components/editor/feature-action-panel";
import {replaceDatasetTitle} from "./kepler-overrides/components/side-panel/common/dataset-title"
import UserProvider from "./features/user/UserProvider";
import {SaveAsScenarioButton} from './features/simulations/components/buttons/SaveAsScenarioButton';
import {DownloadChangesButton} from './features/simulations/components/buttons/DownloadChangesButton';
import {SaveScenarioButton} from './features/simulations/components/buttons/SaveScenarioButton';
import {UndoButton, RedoButton} from './features/simulations/components/buttons/UndoRedoButtons';
import {StartSimulationButton} from "./features/simulations/components/StartSimulationButton";
import {ModellingActions} from "./components/modelling-actions/ModellingActions";
import {replaceModalContainer} from "./features/simulations/components/ModalContainerFactory";
import {replaceLayerPanelHeaderActionSection} from "./kepler-overrides/components/side-panel/layer-panel/layer-panel-header";
import {replaceLayerManager} from "./kepler-overrides/components/side-panel/layer-manager";
import {replaceSidePanelFactory} from "./kepler-overrides/components/side-panel";
import {replaceLayerConfigurator} from "./kepler-overrides/components/side-panel/layer-panel/layer-configurator";
import {replaceFilterManager} from "./kepler-overrides/components/side-panel/filter-manager";
import {replaceAddDataButtonFactory} from "./kepler-overrides/components/side-panel/layer-panel/add-data-button";
import {replaceMapControl} from "./kepler-overrides/components/map/map-control";
import {replaceFieldPanelWithFieldSelect} from "./kepler-overrides/components/filters/filter-panels/filter-panel-with-field-select";
import {replaceDatasetInfo} from "./kepler-overrides/components/side-panel/common/dataset-info";
import {replaceSourceDataCatalogFactory} from "./kepler-overrides/components/side-panel/common/source-data-catalog";
import replaceDatasetSection from "./kepler-overrides/components/side-panel/layer-panel/dataset-section";
import replaceColorLegend from "./kepler-overrides/components/common/color-legend";

// order of components matters, always put the parents first, children last
const KeplerGl = require('@kepler.gl/components').injectComponents([
  replaceModalContainer(),
  replaceLoadDataModal(),
  replaceSidePanelFactory(),
  replacePanelHeader(),
  replaceMapContainer(),
  replaceMapControl(),
  replaceMapPopover(),
  replaceMapPopoverContent(),
  replaceLayerHoverInfo(),
  replaceFeatureActionPanelFactory(),
  replacePureFeatureActionPanelFactory(),
  replaceLayerManager(),
  replaceFilterManager(),
  replaceDatasetSection(),
  replaceSourceDataCatalogFactory(),
  replaceDatasetInfo(),
  replaceFieldPanelWithFieldSelect(),
  replaceLayerPanelHeaderActionSection(),
  replaceDatasetTitle(),
  replaceLayerConfigurator(),
  replaceAddDataButtonFactory(),
  replaceMapDrawPanel(),
  replaceColorLegend()
]);

const BannerHeight = 48;
const BannerKey = `banner-${FormLink}`;
const keplerGlGetState = state => state.demo.keplerGl;

const GlobalStyle = styled.div`
  font-family: ff-clan-web-pro, 'Helvetica Neue', Helvetica, sans-serif;
  font-weight: 400;
  font-size: 0.875em;
  line-height: 1.71429;

  *,
  *:before,
  *:after {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  ul {
    margin: 0;
    padding: 0;
  }

  li {
    margin: 0;
  }

  a {
    text-decoration: none;
    color: ${props => props.theme.labelColor};
  }
`;

const CONTAINER_STYLE = {
  transition: 'margin 1s, height 1s',
  position: 'absolute',
  width: '100%',
  height: '100%',
  left: 0,
  top: 0
};

class App extends Component {
  state = {
    showBanner: false,
    width: window.innerWidth,
    height: window.innerHeight
  };

  _showBanner = () => {
    this.setState({showBanner: true});
  };

  _hideBanner = () => {
    this.setState({showBanner: false});
  };

  _disableBanner = () => {
    this._hideBanner();
    window.localStorage.setItem(BannerKey, 'true');
  };

  _addNotifications(notifications) {
    if (notifications && notifications.length) {
      const [notification, timeout] = notifications[0];

      window.setTimeout(() => {
        this.props.dispatch(addNotification(notification));
        this._addNotifications(notifications.slice(1));
      }, timeout);
    }
  }
  render() {
    return (
      <UserProvider>
        <ThemeProvider theme={theme}>
          <GlobalStyle
            // this is to apply the same modal style as kepler.gl core
            // because styled-components doesn't always return a node
            // https://github.com/styled-components/styled-components/issues/617
            ref={node => {
              node ? (this.root = node) : null;
            }}
          >
            <Banner
              show={this.state.showBanner}
              height={BannerHeight}
              bgColor="#2E7CF6"
              onClose={this._hideBanner}
            >
              <Announcement onDisable={this._disableBanner} />
            </Banner>
            <ModellingActions>
              <UndoButton />
              <RedoButton />
              <StartSimulationButton />
              <SaveScenarioButton />
              <SaveAsScenarioButton />
              <DownloadChangesButton />
            </ModellingActions>
            <div style={CONTAINER_STYLE}>
              <AutoSizer>
                {({height, width}) => (
                  <KeplerGl
                    mapboxApiAccessToken={CLOUD_PROVIDERS_CONFIGURATION.MAPBOX_TOKEN}
                    id="map"
                    /*
                     * Specify path to keplerGl state, because it is not mount at the root
                     */
                    getState={keplerGlGetState}
                    width={width}
                    height={height}
                    localeMessages={messages}
                    onExportToCloudSuccess={onExportFileSuccess}
                    onLoadCloudMapSuccess={onLoadCloudMapSuccess}
                    featureFlags={DEFAULT_FEATURE_FLAGS}
                  />
                )}
              </AutoSizer>
            </div>
          </GlobalStyle>
        </ThemeProvider>
      </UserProvider>
    );
  }
}

const mapStateToProps = state => state;
const dispatchToProps = dispatch => ({dispatch});

export default connect(mapStateToProps, dispatchToProps)(App);
