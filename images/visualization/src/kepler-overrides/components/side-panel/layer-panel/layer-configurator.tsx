// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

/* eslint-disable complexity */
import React, {Component, Fragment, useCallback, useState} from 'react';
import styled from 'styled-components';
import {FormattedMessage} from '@kepler.gl/localization';

import {capitalizeFirstLetter} from '@kepler.gl/utils';

import {
  CHANNEL_SCALE_SUPPORTED_FIELDS,
  AGGREGATION_TYPE_OPTIONS, ColorRange
} from '@kepler.gl/constants';
import {Layer, LayerBaseConfig, VisualChannel, AggregationLayer} from '@kepler.gl/layers';

import {NestedPartial, LayerVisConfig, ColorUI, Field, RGBColor} from '@kepler.gl/types';
import {toggleModal, ActionHandler} from '@kepler.gl/actions';
import {Datasets} from '@kepler.gl/table';
import {
  ArcLayerColorSelectorFactory, ColorSelectorFactory,
  ConfigGroupCollapsibleContent, HowToButton, Input, ItemSelector,
  LayerColumnConfigFactory,
  LayerConfigGroupFactory,
  LayerConfiguratorFactory,
  LayerTypeSelectorFactory, PanelLabel, SidePanelSection,
  SourceDataSelectorFactory,
  TextLabelPanelFactory,
  VisConfigSliderFactory,
  VisConfigSwitchFactory
} from "@kepler.gl/components";
import VisConfigByFieldSelectorFactory
  from "@kepler.gl/components/dist/side-panel/layer-panel/vis-config-by-field-selector";
import LayerErrorMessage from "@kepler.gl/components/dist/side-panel/layer-panel/layer-error-message";
import DimensionScaleSelector from "@kepler.gl/components/dist/side-panel/layer-panel/dimension-scale-selector";
import {useDispatch} from "react-redux";
import {
  calculateColorMapping, getColorLegends, getColorMap,
  setColorMapperRange,
  setColorMapperScaleType, scaleTypes
} from "../../../../features/color-mapper/ColorMapperReducer";
import {adjustStrokeColorRange} from "../../../../actions";
import store from "../../../../store";

type LayerColorRangeSelectorProps = {
  layer: Layer;
  onChange: (v: Record<string, ColorRange>) => void;
  property?: string;
  setColorUI: (prop: string, newConfig: NestedPartial<ColorUI>) => void;
};

type LayerColorSelectorProps = {
  layer: Layer;
  onChange: (v: Record<string, RGBColor>) => void;
  selectedColor?: RGBColor;
  property?: string;
  setColorUI: (prop: string, newConfig: NestedPartial<ColorUI>) => void;
};

type LayerConfiguratorProps = {
  layer: Layer;
  datasets: Datasets;
  layerTypeOptions: {
    id: string;
    label: string;
    icon: React.ElementType;
    requireData: boolean;
  }[];
  openModal: ActionHandler<typeof toggleModal>;
  updateLayerConfig: (newConfig: Partial<LayerBaseConfig>) => void;
  updateLayerType: (newType: string) => void;
  updateLayerVisConfig: (newVisConfig: Partial<LayerVisConfig>) => void;
  updateLayerVisualChannelConfig: (
    newConfig: Partial<LayerBaseConfig>,
    channel: string,
    newVisConfig?: Partial<LayerVisConfig>
  ) => void;
  updateLayerColorUI: (prop: string, newConfig: NestedPartial<ColorUI>) => void;
  updateLayerTextLabel: (idx: number | 'all', prop: string, value: any) => void;
  disableTypeSelect?: boolean;
};

type ChannelByValueSelectorProps = {
  layer: Layer;
  channel: VisualChannel;
  onChange: (
    val: Record<
      string,
      string | number | boolean | object | readonly (string | number | boolean | object)[] | null
    >,
    key: string
  ) => void;
  fields: Field[];
  description: string;
};

type AggregationSelectorProps = {
  channel: VisualChannel;
  layer: AggregationLayer;
  onChange: (
    val: Record<
      string,
      string | number | boolean | object | readonly (string | number | boolean | object)[] | null
    >,
    key: string
  ) => void;
};

const StyledLayerConfigurator = styled.div.attrs({
  className: 'layer-panel__config'
})`
  position: relative;
  margin-top: ${props => props.theme.layerConfiguratorMargin};
  padding: ${props => props.theme.layerConfiguratorPadding};
  border-left: ${props => props.theme.layerConfiguratorBorder} dashed
    ${props => props.theme.layerConfiguratorBorderColor};
`;

const StyledLayerVisualConfigurator = styled.div.attrs({
  className: 'layer-panel__config__visualC-config'
})`
  margin-top: 12px;
`;

export const getLayerFields = (datasets: Datasets, layer: Layer) =>
  layer.config?.dataId && datasets[layer.config.dataId] ? datasets[layer.config.dataId].fields : [];

/** Return any to be able to customize the Dataset entity */
export const getLayerDataset = (datasets: Datasets, layer: Layer): any =>
  layer.config?.dataId && datasets[layer.config.dataId] ? datasets[layer.config.dataId] : null;

export const getLayerConfiguratorProps = (props: LayerConfiguratorProps) => ({
  layer: props.layer,
  fields: getLayerFields(props.datasets, props.layer),
  onChange: props.updateLayerConfig,
  setColorUI: props.updateLayerColorUI
});

export const getVisConfiguratorProps = (props: LayerConfiguratorProps) => ({
  layer: props.layer,
  fields: getLayerFields(props.datasets, props.layer),
  onChange: props.updateLayerVisConfig,
  setColorUI: props.updateLayerColorUI
});

export const getLayerChannelConfigProps = (props: LayerConfiguratorProps) => ({
  layer: props.layer,
  fields: getLayerFields(props.datasets, props.layer),
  onChange: props.updateLayerVisualChannelConfig
});

CustomLayerConfiguratorFactory.deps = [
  SourceDataSelectorFactory,
  VisConfigSliderFactory,
  TextLabelPanelFactory,
  LayerConfigGroupFactory,
  ChannelByValueSelectorFactory,
  LayerColumnConfigFactory,
  LayerTypeSelectorFactory,
  VisConfigSwitchFactory,
  LayerColorSelectorFactory,
  LayerColorRangeSelectorFactory,
  ArcLayerColorSelectorFactory
];

export default function CustomLayerConfiguratorFactory(
  SourceDataSelector: ReturnType<typeof SourceDataSelectorFactory>,
  VisConfigSlider: ReturnType<typeof VisConfigSliderFactory>,
  TextLabelPanel: ReturnType<typeof TextLabelPanelFactory>,
  LayerConfigGroup: ReturnType<typeof LayerConfigGroupFactory>,
  ChannelByValueSelector: ReturnType<typeof ChannelByValueSelectorFactory>,
  LayerColumnConfig: ReturnType<typeof LayerColumnConfigFactory>,
  LayerTypeSelector: ReturnType<typeof LayerTypeSelectorFactory>,
  VisConfigSwitch: ReturnType<typeof VisConfigSwitchFactory>,
  LayerColorSelector: ReturnType<typeof LayerColorSelectorFactory>,
  LayerColorRangeSelector: ReturnType<typeof LayerColorRangeSelectorFactory>,
  ArcLayerColorSelector: ReturnType<typeof ArcLayerColorSelectorFactory>
): React.ComponentType<LayerConfiguratorProps> {
  class LayerConfigurator extends Component<LayerConfiguratorProps> {
    _renderLineLayerConfig({
      layer,
      visConfiguratorProps,
      layerConfiguratorProps,
      layerChannelConfigProps
    }) {
      return (
        <StyledLayerVisualConfigurator>
          {/* Color */}
          <LayerConfigGroup label={'layer.color'} collapsible>
            {layer.config.colorField ? (
              <LayerColorRangeSelector {...visConfiguratorProps} />
            ) : (
              <ArcLayerColorSelector
                layer={layer}
                setColorUI={layerConfiguratorProps.setColorUI}
                onChangeConfig={layerConfiguratorProps.onChange}
                onChangeVisConfig={visConfiguratorProps.onChange}
              />
            )}
            <ConfigGroupCollapsibleContent>
              <ChannelByValueSelector
                channel={layer.visualChannels.sourceColor}
                {...layerChannelConfigProps}
              />
              <VisConfigSlider {...layer.visConfigSettings.opacity} {...visConfiguratorProps} />
            </ConfigGroupCollapsibleContent>
          </LayerConfigGroup>

          {/* thickness */}
          <LayerConfigGroup label={'layer.stroke'} collapsible>
            {layer.config.sizeField ? (
              <VisConfigSlider
                {...layer.visConfigSettings.sizeRange}
                {...visConfiguratorProps}
                disabled={!layer.config.sizeField}
                label={false}
              />
            ) : (
              <VisConfigSlider
                {...layer.visConfigSettings.thickness}
                {...visConfiguratorProps}
                label={false}
              />
            )}
            <ConfigGroupCollapsibleContent>
              <ChannelByValueSelector
                channel={layer.visualChannels.size}
                {...layerChannelConfigProps}
              />
            </ConfigGroupCollapsibleContent>
          </LayerConfigGroup>

          {/* elevation scale */}
          {layer.visConfigSettings.elevationScale ? (
            <LayerConfigGroup label="layerVisConfigs.elevationScale" collapsible>
              <VisConfigSlider
                {...layer.visConfigSettings.elevationScale}
                {...visConfiguratorProps}
              />
            </LayerConfigGroup>
          ) : null}
        </StyledLayerVisualConfigurator>
      );
    }

    _renderTripLayerConfig({
      layer,
      visConfiguratorProps,
      layerConfiguratorProps,
      layerChannelConfigProps
    }) {
      const {
        meta: {featureTypes = {}}
      } = layer;

      return (
        <StyledLayerVisualConfigurator>
          {/* Color */}
          <LayerConfigGroup label={'layer.color'} collapsible>
            {layer.config.colorField ? (
              <LayerColorRangeSelector {...visConfiguratorProps} />
            ) : (
              <LayerColorSelector {...layerConfiguratorProps} />
            )}
            <ConfigGroupCollapsibleContent>
              <ChannelByValueSelector
                channel={layer.visualChannels.color}
                {...layerChannelConfigProps}
              />
              <VisConfigSlider {...layer.visConfigSettings.opacity} {...visConfiguratorProps} />
            </ConfigGroupCollapsibleContent>
          </LayerConfigGroup>

          {/* Stroke Width */}
          <LayerConfigGroup {...visConfiguratorProps} label="layer.strokeWidth" collapsible>
            {layer.config.sizeField ? (
              <VisConfigSlider
                {...layer.visConfigSettings.sizeRange}
                {...visConfiguratorProps}
                label={false}
              />
            ) : (
              <VisConfigSlider
                {...layer.visConfigSettings.thickness}
                {...visConfiguratorProps}
                label={false}
              />
            )}

            <ConfigGroupCollapsibleContent>
              <ChannelByValueSelector
                channel={layer.visualChannels.size}
                {...layerChannelConfigProps}
              />
            </ConfigGroupCollapsibleContent>
          </LayerConfigGroup>

          {/* Trail Length*/}
          <LayerConfigGroup
            {...visConfiguratorProps}
            {...(featureTypes.polygon ? layer.visConfigSettings.stroked : {})}
            label="layer.trailLength"
            description="layer.trailLengthDescription"
          >
            <VisConfigSlider
              {...layer.visConfigSettings.trailLength}
              {...visConfiguratorProps}
              label={false}
            />
          </LayerConfigGroup>
        </StyledLayerVisualConfigurator>
      );
    }

    _renderGeojsonLayerConfig({
      layer,
      visConfiguratorProps,
      layerConfiguratorProps,
      layerChannelConfigProps
    }) {
      const {
        meta: {featureTypes = {}},
        config: {visConfig}
      } = layer;

      return (
        <StyledLayerVisualConfigurator>
          {/* Fill Color */}
          {featureTypes.polygon || featureTypes.point ? (
            <LayerConfigGroup
              {...layer.visConfigSettings.filled}
              {...visConfiguratorProps}
              label="layer.fillColor"
              collapsible
            >
              {layer.config.colorField ? (
                <LayerColorRangeSelector {...visConfiguratorProps} />
              ) : (
                <LayerColorSelector {...layerConfiguratorProps} />
              )}
              <ConfigGroupCollapsibleContent>
                <ChannelByValueSelector
                  channel={layer.visualChannels.color}
                  {...layerChannelConfigProps}
                />
                <VisConfigSlider {...layer.visConfigSettings.opacity} {...visConfiguratorProps} />
              </ConfigGroupCollapsibleContent>
            </LayerConfigGroup>
          ) : null}

          {/* stroke color TODO locate stroke color scale and figure out how to add sqrt, log, etc */}
          <LayerConfigGroup
            {...layer.visConfigSettings.stroked}
            {...visConfiguratorProps}
            label="layer.strokeColor"
            collapsible
          >
            {layer.config.strokeColorField ? (
              <LayerColorRangeSelector {...visConfiguratorProps} property="strokeColorRange" />
            ) : (
              <LayerColorSelector
                {...visConfiguratorProps}
                selectedColor={layer.config.visConfig.strokeColor}
                property="strokeColor"
              />
            )}
            <ConfigGroupCollapsibleContent>
              <ChannelByValueSelector
                channel={layer.visualChannels.strokeColor}
                {...layerChannelConfigProps}
              />
              <VisConfigSlider
                {...layer.visConfigSettings.strokeOpacity}
                {...visConfiguratorProps}
              />
            </ConfigGroupCollapsibleContent>
          </LayerConfigGroup>

          {/* Stroke Width */}
          <LayerConfigGroup
            {...visConfiguratorProps}
            {...(featureTypes.polygon ? layer.visConfigSettings.stroked : {})}
            label="layer.strokeWidth"
            collapsible
          >
            {layer.config.sizeField ? (
              <VisConfigSlider
                {...layer.visConfigSettings.sizeRange}
                {...visConfiguratorProps}
                label={false}
              />
            ) : (
              <VisConfigSlider
                {...layer.visConfigSettings.thickness}
                {...visConfiguratorProps}
                label={false}
              />
            )}
            <ConfigGroupCollapsibleContent>
              <ChannelByValueSelector
                channel={layer.visualChannels.size}
                {...layerChannelConfigProps}
              />
            </ConfigGroupCollapsibleContent>
          </LayerConfigGroup>

          {/* Elevation */}
          {featureTypes.polygon ? (
            <LayerConfigGroup
              {...visConfiguratorProps}
              {...layer.visConfigSettings.enable3d}
              disabled={!visConfig.filled}
              collapsible
            >
              <VisConfigSlider
                {...layer.visConfigSettings.elevationScale}
                {...visConfiguratorProps}
                label={false}
              />
              <ConfigGroupCollapsibleContent>
                <ChannelByValueSelector
                  channel={layer.visualChannels.height}
                  {...layerChannelConfigProps}
                />
                <VisConfigSwitch
                  {...layer.visConfigSettings.enableElevationZoomFactor}
                  {...visConfiguratorProps}
                />
                <VisConfigSwitch {...visConfiguratorProps} {...layer.visConfigSettings.wireframe} />
              </ConfigGroupCollapsibleContent>
            </LayerConfigGroup>
          ) : null}

          {/* Radius */}
          {featureTypes.point ? (
            <LayerConfigGroup label={'layer.radius'} collapsible>
              {!layer.config.radiusField ? (
                <VisConfigSlider
                  {...layer.visConfigSettings.radius}
                  {...visConfiguratorProps}
                  label={false}
                  disabled={Boolean(layer.config.radiusField)}
                />
              ) : (
                <VisConfigSlider
                  {...layer.visConfigSettings.radiusRange}
                  {...visConfiguratorProps}
                  label={false}
                  disabled={!layer.config.radiusField}
                />
              )}
              <ConfigGroupCollapsibleContent>
                <ChannelByValueSelector
                  channel={layer.visualChannels.radius}
                  {...layerChannelConfigProps}
                />
              </ConfigGroupCollapsibleContent>
            </LayerConfigGroup>
          ) : null}
        </StyledLayerVisualConfigurator>
      );
    }

    _render3DLayerConfig({layer, visConfiguratorProps}) {
      return (
        <Fragment>
          <LayerConfigGroup label={'layer.3DModel'} collapsible>
            <Input
              type="file"
              accept=".glb,.gltf"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  const url = URL.createObjectURL(e.target.files[0]);
                  visConfiguratorProps.onChange({scenegraph: url});
                }
              }}
            />
          </LayerConfigGroup>
          <LayerConfigGroup label={'layer.3DModelOptions'} collapsible>
            <VisConfigSlider
              {...layer.visConfigSettings.sizeScale}
              {...visConfiguratorProps}
              disabled={false}
            />
            <VisConfigSlider
              {...layer.visConfigSettings.angleX}
              {...visConfiguratorProps}
              disabled={false}
            />
            <VisConfigSlider
              {...layer.visConfigSettings.angleY}
              {...visConfiguratorProps}
              disabled={false}
            />
            <VisConfigSlider
              {...layer.visConfigSettings.angleZ}
              {...visConfiguratorProps}
              disabled={false}
            />
          </LayerConfigGroup>
        </Fragment>
      );
    }

    render() {
      const {
        layer,
        datasets,
        updateLayerConfig,
        layerTypeOptions,
        updateLayerType,
        disableTypeSelect = false
      } = this.props;
      const {fields = [], fieldPairs = undefined} = layer.config.dataId
        ? datasets[layer.config.dataId]
        : {};
      const {config} = layer;

      const visConfiguratorProps = getVisConfiguratorProps(this.props);
      const layerConfiguratorProps = getLayerConfiguratorProps(this.props);
      const layerChannelConfigProps = getLayerChannelConfigProps(this.props);
      const dataset = getLayerDataset(datasets, layer);
      const renderTemplate = layer.type && `_render${capitalizeFirstLetter(layer.type)}LayerConfig`;

      return (
        <StyledLayerConfigurator>
          {layer.layerInfoModal ? (
            <HowToButton onClick={() => this.props.openModal(layer.layerInfoModal)} />
          ) : null}
          <LayerConfigGroup label={'layer.basic'} collapsible expanded={!layer.hasAllColumns()}>
            <LayerTypeSelector
              selected={layer.type}
              disabled={disableTypeSelect}
              options={layerTypeOptions}
              // @ts-ignore
              onSelect={updateLayerType}
            />
            <ConfigGroupCollapsibleContent>
              <SourceDataSelector
                datasets={datasets}
                id={layer.id}
                dataId={config.dataId}
                // @ts-ignore
                onSelect={(value: string) => updateLayerConfig({dataId: value})}
              />
              <LayerColumnConfig
                columnPairs={layer.columnPairs}
                columns={layer.config.columns}
                assignColumnPairs={layer.assignColumnPairs.bind(layer)}
                assignColumn={layer.assignColumn.bind(layer)}
                // @ts-ignore
                columnLabels={layer.columnLabels}
                fields={fields}
                fieldPairs={fieldPairs}
                updateLayerConfig={updateLayerConfig}
              />
            </ConfigGroupCollapsibleContent>
            {layer.errorMessage ? <LayerErrorMessage errorMessage={layer.errorMessage} /> : null}
          </LayerConfigGroup>
          {renderTemplate &&
            this[renderTemplate] &&
            this[renderTemplate]({
              layer,
              dataset,
              visConfiguratorProps,
              layerChannelConfigProps,
              layerConfiguratorProps
            })}
        </StyledLayerConfigurator>
      );
    }
  }

  return LayerConfigurator;
}

ChannelByValueSelectorFactory.deps = [VisConfigByFieldSelectorFactory];

export function replaceLayerConfigurator() {
    return [LayerConfiguratorFactory, CustomLayerConfiguratorFactory];
}

LayerColorSelectorFactory.deps = [ColorSelectorFactory];
export function LayerColorSelectorFactory(ColorSelector) {
  const LayerColorSelector = ({
    layer,
    onChange,
    selectedColor,
    property = 'color',
    setColorUI
  }: LayerColorSelectorProps) => {
    const onSetColorUI = useCallback(newConfig => setColorUI(property, newConfig), [
      setColorUI,
      property
    ]);

    return (
      <SidePanelSection>
        <ColorSelector
          colorSets={[
            {
              selectedColor: selectedColor || layer.config.color,
              setColor: (rgbValue: RGBColor) => onChange({[property]: rgbValue})
            }
          ]}
          colorUI={layer.config.colorUI[property]}
          setColorUI={onSetColorUI}
        />
      </SidePanelSection>
    );
  };
  return LayerColorSelector;
}

LayerColorRangeSelectorFactory.deps = [ColorSelectorFactory];
export function LayerColorRangeSelectorFactory(ColorSelector) {
  const LayerColorRangeSelector = ({
    layer,
    onChange,
    property = 'colorRange',
    setColorUI
  }: LayerColorRangeSelectorProps) => {
    const onSetColorUI = useCallback(newConfig => setColorUI(property, newConfig), [
      setColorUI,
      property
    ]);
    const dispatch = useDispatch();

    return (
      <SidePanelSection>
        <ColorSelector
          colorSets={[
            {
              selectedColor: layer.config.visConfig[property],
              isRange: true,
              setColor: (colorRange: ColorRange) => {
                if (property === 'strokeColorRange') {
                  dispatch(setColorMapperRange({
                    layerId: layer.id,
                    colorRange: colorRange.colors
                  }));
                  dispatch(calculateColorMapping(layer.id));
                  const newState = store.getState().colorMapper[layer.id];
                  colorRange.colorMap = getColorMap(newState);
                  colorRange.colorLegends = getColorLegends(newState);
                }
                onChange({[property]: colorRange});
              }
            }
          ]}
          colorUI={layer.config.colorUI[property]}
          setColorUI={onSetColorUI}
        />
      </SidePanelSection>
    );
  };
  return LayerColorRangeSelector;
}

export function ChannelByValueSelectorFactory(
  VisConfigByFieldSelector: ReturnType<typeof VisConfigByFieldSelectorFactory>
) {
  const ChannelByValueSelector = ({
    layer,
    channel,
    onChange,
    fields,
    description
  }: ChannelByValueSelectorProps) => {
    const {
      channelScaleType,
      field,
      key,
      property,
      scale,
      defaultMeasure,
      supportedFieldTypes
    } = channel;
    const dispatch = useDispatch();
    const [selectedScaleType, setSelectedScaleType] = useState('quantize');

    const channelSupportedFieldTypes =
      supportedFieldTypes || CHANNEL_SCALE_SUPPORTED_FIELDS[channelScaleType];
    const supportedFields = fields.filter(({type}) => channelSupportedFieldTypes.includes(type));

    let scaleOptions: string[] = layer.getScaleOptions(channel.key);
    if (channel.key === 'strokeColor') {
      scaleOptions = scaleTypes;
    }

    const showScale = !layer.isAggregated && layer.config[scale] && scaleOptions.length > 1;
    const defaultDescription = 'layerConfiguration.defaultDescription';

    return (
      <VisConfigByFieldSelector
        channel={channel.key}
        description={description || defaultDescription}
        fields={supportedFields}
        id={layer.id}
        key={`${key}-channel-selector`}
        property={property}
        placeholder={defaultMeasure || 'placeholder.selectField'}
        scaleOptions={scaleOptions}
        scaleType={scale ? (channel.key === 'strokeColor' ? selectedScaleType : layer.config[scale]) : null}
        selectedField={layer.config[field]}
        showScale={showScale}
        updateField={val => {
          onChange({[field]: val}, key)
        }}
        updateScale={val => {
          if (channel.key === 'strokeColor') {
            dispatch(setColorMapperScaleType({
              layerId: layer.id,
              scaleType: val
            }));
            dispatch(adjustStrokeColorRange(layer));
            setSelectedScaleType(val);
          }
          onChange({[scale]: val}, key)
        }}
      />
    );
  };

  return ChannelByValueSelector;
}

export const AggregationScaleSelector = ({channel, layer, onChange}: AggregationSelectorProps) => {
  const {scale, key} = channel;
  const scaleOptions = layer.getScaleOptions(key);

  return Array.isArray(scaleOptions) && scaleOptions.length > 1 ? (
    <DimensionScaleSelector
      label={`${key} Scale`}
      options={scaleOptions}
      scaleType={layer.config[scale]}
      onSelect={val => onChange({[scale]: val}, key)}
    />
  ) : null;
};

export const AggregationTypeSelector = ({channel, layer, onChange}: AggregationSelectorProps) => {
  const {field, aggregation, key} = channel;
  const selectedField = layer.config[field];
  const {visConfig} = layer.config;

  // aggregation should only be selectable when field is selected
  const layerAggregationTypes = layer.getAggregationOptions(key);

  const aggregationOptions = AGGREGATION_TYPE_OPTIONS.filter(({id}) =>
    layerAggregationTypes.includes(id)
  );

  const selectedAggregation = aggregation
    ? aggregationOptions.find(({id}) => id === visConfig[aggregation])
    : [];

  return (
    <SidePanelSection>
      <PanelLabel>
        <FormattedMessage
          id={'layer.aggregateBy'}
          values={{
            field: selectedField.displayName
          }}
        />
      </PanelLabel>
      <ItemSelector
        selectedItems={selectedAggregation}
        options={aggregationOptions}
        displayOption="label"
        getOptionValue="id"
        multiSelect={false}
        searchable={false}
        onChange={value =>
          onChange(
            {
              visConfig: {
                ...layer.config.visConfig,
                [aggregation as string]: value
              }
            },
            channel.key
          )
        }
      />
    </SidePanelSection>
  );
};
/* eslint-enable max-params */
