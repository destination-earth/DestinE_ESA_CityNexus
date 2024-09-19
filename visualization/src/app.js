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
import {replaceLoadDataModal} from './factories/load-data-modal';
import {replacePanelHeader} from './factories/panel-header';
import {replaceMapPopover} from "./factories/map-popover";
import {replaceMapContainer} from "./factories/map-container";
import {replaceLayerHoverInfo} from "./factories/layer-hover-info";
import {replaceMapPopoverContent} from "./factories/map-popover-content";
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
} from "./components/editor/feature-action-panel";
import {replaceDatasetTitle} from "./factories/dataset-title"
import UserProvider from "./components/user/UserProvider";
import {SaveAsScenarioButton} from './features/SaveAsScenarioButton';
import {DownloadChangesButton} from './features/DownloadChangesButton';
import {SaveScenarioButton} from './features/SaveScenarioButton';
import {UndoButton, RedoButton} from './features/UndoRedoButtons';
import {StartSimulationButton} from "./features/simulations/components/StartSimulationButton";
import {ModellingActions} from "./components/modelling-actions/ModellingActions";
import {replaceModalContainer} from "./features/simulations/components/ModalContainerFactory";
import {replaceLayerPanelHeaderActionSection} from "./factories/layer-panel-header";
import {replaceLayerManager} from "./factories/layer-manager";
import {replaceSidePanelFactory} from "./factories/side-panel";

// order of components matters, always put the parents first, children last
const KeplerGl = require('@kepler.gl/components').injectComponents([
  replaceModalContainer(),
  replaceLoadDataModal(),
  replaceSidePanelFactory(),
  replacePanelHeader(),
  replaceMapContainer(),
  replaceMapPopover(),
  replaceMapPopoverContent(),
  replaceLayerHoverInfo(),
  replaceFeatureActionPanelFactory(),
  replacePureFeatureActionPanelFactory(),
  replaceLayerManager(),
  replaceLayerPanelHeaderActionSection(),
  replaceDatasetTitle(),
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
