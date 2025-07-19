
// Enhanced CustomizableChart.tsx
import React, { memo, useMemo } from 'react';
import { View, TextInput, Text, StyleSheet, Dimensions } from 'react-native';
import { CartesianChart, useChartPressState, Bar } from 'victory-native';
import { LinearGradient, useFont, vec, Path, Circle, Skia } from '@shopify/react-native-skia';
import Animated, { useDerivedValue, useAnimatedProps } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { ChartData, CustomizableChartProps } from '../../../types/victoryBarChart';
import { defaultDimensions, defaultDomainPadding, defaultChartPadding, defaultAxisOptions, defaultBarStyle, defaultActiveIndicator, defaultTooltip, defaultAnimation, defaultInteraction } from '../../../config/victoryBarChartConfig';
import { Line as SkiaLine, Text as SkiaText } from '@shopify/react-native-skia';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

Animated.addWhitelistedNativeProps({text: true});

  // AnimatedTextInput for animated tooltip
  const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
  
const formatNumber = (num: number): string => {
  if (isNaN(num)) return '0';
  if (num < 1000) return `${num}`;
  if (num < 1_000_000) return `${(num / 1_000).toFixed(1)}K`;
  if (num < 1_000_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  return `${(num / 1_000_000_000).toFixed(1)}B`;
};

const formatLabel = (val: string | number | undefined): string => (val == null ? '' : `${val}`);

const findLastValidValue = (data: ChartData[], yKey: string) => {
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i][yKey] !== false && data[i][yKey] != null) {
      return data[i];
    }
  }
  return data[0] || null;
};

interface ActiveValueIndicatorInlineProps {
  xPosition: SharedValue<number>;
  yPosition: SharedValue<number>;
  top: number;
  bottom: number;
  lineColor?: string;
  indicatorColor?: string;
  circleColor?: string;
  topOffset?: number;
}
const ActiveValueIndicatorInline = ({
  xPosition,
  yPosition,
  top,
  bottom,
  lineColor = '#666',
  indicatorColor = '#e40000',
  circleColor = '#ffa9a9',
  topOffset = 0,
}: ActiveValueIndicatorInlineProps) => {
  return (
    <>
      <Circle cx={xPosition} cy={yPosition} r={8} color={circleColor} />
      <Circle cx={xPosition} cy={yPosition} r={5} color={indicatorColor} />
      <Circle cx={xPosition} cy={yPosition} r={3} color={'#fff'} />
    </>
  );
};

interface ActiveValueIndicatorProps {
  xPosition: SharedValue<number>;
  yPosition: SharedValue<number>;
  top: number;
  bottom: number;
  activeValue: SharedValue<number | string>;
  config: any;
  valueFormatter?: (value: number, unit?: string) => string;
  unit?: string;
}
const ActiveValueIndicator: React.FC<ActiveValueIndicatorProps> = ({
  xPosition,
  yPosition,
  top,
  bottom,
  activeValue,
  config,
  valueFormatter,
  unit = '',
}) => {
  const font = useFont(
    config.text?.fontPath || require('../../../assets/fonts/SFProDisplayRegular.ttf'),
    config.text?.fontSize || 10
  );

  const formattedValue = useDerivedValue(() => {
    const val = parseFloat(activeValue?.value as string);
    if (isNaN(val)) return 'N/A';
    if (valueFormatter) {
      return valueFormatter(val, unit);
    }
    if (unit === 'mh') {
      if (val > 18 || val === 0) return 'N/A';
      const hours = Math.floor(val);
      const minutes = Math.round((val - hours) * 60);
      return `${hours}h ${minutes}min`;
    }
    return unit ? `${Math.round(val)} ${unit}` : String(Math.round(val));
  });

  const start = useDerivedValue(() => vec(xPosition.value, bottom));
  const end = useDerivedValue(() => vec(
    xPosition.value,
    top + 1.5 * (config.text?.fontSize || 10) + (config.position?.topOffset || 0)
  ));
  const textWidth = useDerivedValue(() => font?.measureText(formattedValue.value).width || 0);
  const activeValueX = useDerivedValue(() => {
    const half = textWidth.value / 2;
    let pos = xPosition.value - half;
    if (pos < 0) return 0;
    const rightMargin = config.position?.rightMargin || 30;
    const rightAdjustment = config.position?.rightAdjustment || 10;
    if (pos + textWidth.value > SCREEN_WIDTH - rightMargin) {
      return SCREEN_WIDTH - textWidth.value - rightMargin - rightAdjustment;
    }
    return pos;
  });

  if (!config.show) return null;

  return (
    <>
      {config.line && (
        <SkiaLine
          p1={start}
          p2={end}
          color={config.line.color || '#666'}
          opacity={config.line.opacity || 0.3}
          strokeWidth={config.line.strokeWidth || 0.5}
        />
      )}
      {config.circle?.outer && (
        <Circle
          cx={xPosition}
          cy={yPosition}
          r={config.circle.outer.radius || 8}
          color={config.circle.outer.color || '#ffa9a9'}
          opacity={config.circle.outer.opacity || 1}
        />
      )}
      {config.circle?.middle && (
        <Circle
          cx={xPosition}
          cy={yPosition}
          r={config.circle.middle.radius || 5}
          color={config.circle.middle.color || '#e40000'}
          opacity={config.circle.middle.opacity || 1}
        />
      )}
      {config.circle?.inner && (
        <Circle
          cx={xPosition}
          cy={yPosition}
          r={config.circle.inner.radius || 3}
          color={config.circle.inner.color || '#fff'}
          opacity={config.circle.inner.opacity || 1}
        />
      )}
      {font && config.text && (
        <SkiaText
          color={config.text.color || '#666'}
          font={font}
          text={formattedValue}
          x={activeValueX}
          y={top + (config.text.fontSize || 10)}
        />
      )}
    </>
  );
};

const CustomizableBarChart: React.FC<CustomizableChartProps> = ({
  data,
  keys,
  containerStyle,
  dimensions = defaultDimensions,
  domainPadding = defaultDomainPadding,
  chartPadding = defaultChartPadding,
  axisOptions = defaultAxisOptions,
  domain,
  barStyle = defaultBarStyle,
  activeIndicator = defaultActiveIndicator,
  tooltip = defaultTooltip,
  animation = defaultAnimation,
  interaction = defaultInteraction,
  unit = '',
  renderCustomBar,
}) => {
  const mergedDimensions = { ...defaultDimensions, ...dimensions };
  const mergedDomainPadding = { ...defaultDomainPadding, ...domainPadding };
  const mergedChartPadding = { ...defaultChartPadding, ...chartPadding };
  const mergedAxisOptions = {
    ...defaultAxisOptions,
    ...axisOptions,
    tickCount: {
      x: (axisOptions?.tickCount && typeof axisOptions.tickCount === 'object' && typeof axisOptions.tickCount.x === 'number')
        ? axisOptions.tickCount.x
        : (defaultAxisOptions.tickCount && typeof defaultAxisOptions.tickCount === 'object' && typeof defaultAxisOptions.tickCount.x === 'number')
          ? defaultAxisOptions.tickCount.x
          : 6,
      y: (axisOptions?.tickCount && typeof axisOptions.tickCount === 'object' && typeof axisOptions.tickCount.y === 'number')
        ? axisOptions.tickCount.y
        : (defaultAxisOptions.tickCount && typeof defaultAxisOptions.tickCount === 'object' && typeof defaultAxisOptions.tickCount.y === 'number')
          ? defaultAxisOptions.tickCount.y
          : 6,
    },
    labelOffset: {
      x: (axisOptions?.labelOffset && typeof axisOptions.labelOffset === 'object' && typeof axisOptions.labelOffset.x === 'number')
        ? axisOptions.labelOffset.x
        : (defaultAxisOptions.labelOffset && typeof defaultAxisOptions.labelOffset === 'object' && typeof defaultAxisOptions.labelOffset.x === 'number')
          ? defaultAxisOptions.labelOffset.x
          : 0,
      y: (axisOptions?.labelOffset && typeof axisOptions.labelOffset === 'object' && typeof axisOptions.labelOffset.y === 'number')
        ? axisOptions.labelOffset.y
        : (defaultAxisOptions.labelOffset && typeof defaultAxisOptions.labelOffset === 'object' && typeof defaultAxisOptions.labelOffset.y === 'number')
          ? defaultAxisOptions.labelOffset.y
          : 0,
    },
    axisSide: {
      x: (axisOptions?.axisSide && typeof axisOptions.axisSide === 'object' && typeof axisOptions.axisSide.x === 'string')
        ? axisOptions.axisSide.x
        : (defaultAxisOptions.axisSide && typeof defaultAxisOptions.axisSide === 'object' && typeof defaultAxisOptions.axisSide.x === 'string')
          ? defaultAxisOptions.axisSide.x
          : 'bottom',
      y: (axisOptions?.axisSide && typeof axisOptions.axisSide === 'object' && typeof axisOptions.axisSide.y === 'string')
        ? axisOptions.axisSide.y
        : (defaultAxisOptions.axisSide && typeof defaultAxisOptions.axisSide === 'object' && typeof defaultAxisOptions.axisSide.y === 'string')
          ? defaultAxisOptions.axisSide.y
          : 'left',
    },
  };
  const mergedBarStyle = { ...defaultBarStyle, ...barStyle };
  const mergedActiveIndicator = { ...defaultActiveIndicator, ...activeIndicator };
  const mergedTooltip = { ...defaultTooltip, ...tooltip };
  const mergedAnimation = { ...defaultAnimation, ...animation };
  const mergedInteraction = { ...defaultInteraction, ...interaction };

  const yKey = Array.isArray(keys.y) ? keys.y[0] : keys.y;
  const lastValidValue = useMemo(() => findLastValidValue(data, yKey), [data, yKey]);
  const defaultValue = useMemo(() => {
    const value = lastValidValue?.[yKey] || 0;
    if (mergedTooltip.valueFormatter) {
      return mergedTooltip.valueFormatter(value, unit);
    }
    return unit ? `${Math.round(value)} ${unit}` : String(Math.round(value));
  }, [lastValidValue, yKey, unit, mergedTooltip.valueFormatter]);
  const defaultDate = useMemo(() => {
    const date = lastValidValue?.[keys.x];
    if (mergedTooltip.dateFormatter) {
      return mergedTooltip.dateFormatter(date);
    }
    return date ? String(date) : '';
  }, [lastValidValue, keys.x, mergedTooltip.dateFormatter]);

  const { state, isActive } = useChartPressState({
    x: lastValidValue?.[keys.x] ?? '',
    y: { [yKey]: lastValidValue?.[yKey] ?? 0 },
  });

  const valueText = useDerivedValue(() => {
    const val = parseFloat(String(state.y[yKey].value.value));
    if (isNaN(val)) return defaultValue;
    if (mergedTooltip.valueFormatter) {
      return mergedTooltip.valueFormatter(val, unit);
    }
    return unit ? `${Math.round(val)} ${unit}` : String(Math.round(val));
  });
  const dateText = useDerivedValue(() => {
    return state.x.value.value || defaultDate;
  });
  const animatedValueProps = useAnimatedProps(() => ({ text: String(valueText.value) }));
  const animatedDateProps = useAnimatedProps(() => ({ text: String(dateText.value) }));

  const maxValue = Math.max(...data.map(d => d[yKey])) || 1;
  const yDomain = domain?.y || [0, maxValue * 1.1];
  const font = useFont(
    mergedAxisOptions.font || require('../../../assets/fonts/SFProDisplayRegular.ttf'),
    10
  );
  const transformConfig: any = {};
  if (mergedInteraction.enabled) {
    if (mergedInteraction.pan?.enabled) {
      transformConfig.pan = { dimensions: mergedInteraction.pan.dimensions };
    }
    if (mergedInteraction.pinch?.enabled) {
      transformConfig.pinch = { dimensions: mergedInteraction.pinch.dimensions };
    }
  }
  let chartAnimationConfig: any = undefined;
  if (mergedAnimation.enabled && mergedAnimation.type === 'timing') {
    chartAnimationConfig = {
      type: 'timing',
      duration: mergedAnimation.duration ?? 1000,
      delay: mergedAnimation.delay ?? 0,
    };
  } else if (mergedAnimation.enabled && mergedAnimation.type === 'spring') {
    chartAnimationConfig = { type: 'spring' };
  }



  return (
    <View style={[{ height: mergedDimensions.height }, containerStyle]}>
      {/* Inline Tooltip: show only if enabled and position is 'inline' */}
      {mergedTooltip.show && mergedTooltip.position === 'inline' && (
        <View style={[
          styles.tooltipContainer,
          {
            backgroundColor: mergedTooltip.container?.backgroundColor || 'transparent',
            borderRadius: mergedTooltip.container?.borderRadius || 16,
            paddingHorizontal: mergedTooltip.container?.padding?.horizontal || 20,
            paddingVertical: mergedTooltip.container?.padding?.vertical || 12,
            marginHorizontal: mergedTooltip.container?.margin?.horizontal || 0,
            marginVertical: mergedTooltip.container?.margin?.vertical || 0,
            borderColor: mergedTooltip.container?.borderColor,
            borderWidth: mergedTooltip.container?.borderWidth || 0,
          },
        ]}>
          {mergedTooltip.animated ? (
            <AnimatedTextInput
              editable={false}
              underlineColorAndroid="transparent"
              style={[
                styles.tooltipTitle,
                {
                  fontSize: mergedTooltip.title?.fontSize || 20,
                  fontWeight: mergedTooltip.title?.fontWeight as any || '700',
                  color: mergedTooltip.title?.color || '#000',
                  fontFamily: mergedTooltip.title?.fontFamily,
                },
              ]}
              animatedProps={animatedValueProps}
              defaultValue={defaultValue}
            />
          ) : (
            <Text style={[
              styles.tooltipTitle,
              {
                fontSize: mergedTooltip.title?.fontSize || 20,
                fontWeight: mergedTooltip.title?.fontWeight as any || '700',
                color: mergedTooltip.title?.color || '#000',
                fontFamily: mergedTooltip.title?.fontFamily,
              },
            ]}>
              {valueText.value} {unit}
            </Text>
          )}
          {mergedTooltip.animated && isActive ? (
            <AnimatedTextInput
              editable={false}
              underlineColorAndroid="transparent"
              style={[
                styles.tooltipSubtitle,
                {
                  fontSize: mergedTooltip.subtitle?.fontSize || 14,
                  fontWeight: mergedTooltip.subtitle?.fontWeight as any || '600',
                  color: mergedTooltip.subtitle?.color || '#666',
                  fontFamily: mergedTooltip.subtitle?.fontFamily,
                },
              ]}
              animatedProps={animatedDateProps}
              defaultValue={defaultDate}
            />
          ) : (
            <Text style={[
              styles.tooltipSubtitle,
              {
                fontSize: mergedTooltip.subtitle?.fontSize || 14,
                fontWeight: mergedTooltip.subtitle?.fontWeight as any || '600',
                color: mergedTooltip.subtitle?.color || '#666',
                fontFamily: mergedTooltip.subtitle?.fontFamily,
              },
            ]}>
              {dateText.value}
            </Text>
          )}
          {mergedTooltip.separator?.show && (
            <View
              style={[
                styles.separator,
                {
                  backgroundColor: mergedTooltip.separator.color || '#e0e0e0',
                  height: mergedTooltip.separator.height || 1,
                  marginVertical: mergedTooltip.separator.marginVertical || 12,
                },
              ]}
            />
          )}
        </View>
      )}
      {/* Chart */}
      {data.length > 0 && (
        <CartesianChart
          chartPressState={mergedInteraction.press?.enabled ? state : undefined}
          frame={
            mergedAxisOptions.showGrid
              ? { lineColor: mergedAxisOptions.lineColor }
              : undefined
          }
          axisOptions={
            mergedAxisOptions.showAxes
              ? {
                  font,
                  lineColor: mergedAxisOptions.lineColor,
                  lineWidth: mergedAxisOptions.lineWidth,
                  tickCount: mergedAxisOptions.tickCount,
                  labelOffset: mergedAxisOptions.labelOffset,
                  labelColor: mergedAxisOptions.labelColor,
                  formatYLabel: mergedAxisOptions.formatYLabel || formatNumber,
                  formatXLabel: mergedAxisOptions.formatXLabel || formatLabel,
                  axisSide: mergedAxisOptions.axisSide,
                }
              : undefined
          }
          transformConfig={transformConfig}
          domain={{ y: yDomain, ...domain }}
          domainPadding={mergedDomainPadding}
          padding={mergedChartPadding}
          data={data}
          xKey={keys.x}
          yKeys={Array.isArray(keys.y) ? keys.y : [keys.y]}
          renderOutside={({ chartBounds }) => {
            if (mergedTooltip.show && mergedTooltip.position === 'inline' && isActive) {
              return (
                <ActiveValueIndicatorInline
                  xPosition={state.x.position}
                  yPosition={state.y[yKey].position}
                  top={0}
                  bottom={mergedDimensions.height || 300}
                  lineColor="#666"
                  indicatorColor="#e40000"
                  circleColor="#ffa9a9"
                />
              );
            }
            // Activity indicator with value label for non-inline mode
            if (isActive && mergedActiveIndicator.show && (!mergedTooltip.show || mergedTooltip.position !== 'inline')) {
              return (
                <ActiveValueIndicator
                  xPosition={state.x.position}
                  yPosition={state.y[yKey].position}
                  top={0}
                  bottom={mergedDimensions.height || 300}
                  activeValue={state.y[yKey].value as unknown as import('react-native-reanimated').SharedValue<string | number>}
                  config={mergedActiveIndicator}
                  valueFormatter={mergedTooltip.valueFormatter}
                  unit={unit}
                />
              );
            }
            return null;
          }}
        >
          {({ points, chartBounds }) => {
            if (renderCustomBar) {
              return renderCustomBar({
                points,
                chartBounds,
                barStyle: mergedBarStyle,
                animation: chartAnimationConfig,
              });
            }
            return (
              <Bar
                barWidth={mergedBarStyle.width}
                animate={chartAnimationConfig}
                chartBounds={chartBounds}
                points={points[yKey]}
                roundedCorners={mergedBarStyle.roundedCorners}
                opacity={mergedBarStyle.opacity}
              >
                <LinearGradient
                  start={
                    mergedBarStyle.gradientStart
                      ? vec(mergedBarStyle.gradientStart.x, mergedBarStyle.gradientStart.y)
                      : vec(200, 0)
                  }
                  end={
                    mergedBarStyle.gradientEnd
                      ? vec(mergedBarStyle.gradientEnd.x, mergedBarStyle.gradientEnd.y)
                      : vec(chartBounds.bottom, chartBounds.bottom)
                  }
                  colors={mergedBarStyle.colors || ['#26A2FB', '#26A2FB']}
                />
              </Bar>
            );
          }}
        </CartesianChart>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tooltipContainer: {
    paddingVertical: 8,
  },
  tooltipTitle: {
    padding: 0,
    margin: 0,
  },
  tooltipSubtitle: {
    marginTop: 5,
    padding: 0,
    margin: 0,
  },
  separator: {
    width: '100%',
  },
});

export default memo(CustomizableBarChart);