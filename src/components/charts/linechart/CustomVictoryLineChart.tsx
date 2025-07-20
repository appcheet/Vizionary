import React, { memo, useMemo } from 'react';
import { View, TextInput, Text, StyleSheet, Dimensions } from 'react-native';
import { 
  Area, 
  CartesianChart, 
  Line, 
  Scatter, 
  useChartPressState,
} from 'victory-native';
import {
  Circle,
  Line as SkiaLine,
  Text as SkiaText,
  useFont,
  vec,
  LinearGradient,
} from "@shopify/react-native-skia";
import Animated, { useDerivedValue, useAnimatedProps } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Add whitelisted props for Animated
Animated.addWhitelistedNativeProps({ text: true });

// AnimatedTextInput for animated tooltip
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// --- Types ---
export interface ChartDataPoint<T extends Record<string, any> = Record<string, any>> {
  label: string;
  [key: string]: any;
}

export interface SeriesConfig {
  key: string;
  color: string;
  areaColor?: string;
  strokeWidth?: number;
  showArea?: boolean;
  showLine?: boolean;
  showScatter?: boolean;
  scatterRadius?: number;
  curveType?: 'linear' | 'natural' | 'cardinal' | 'catmullRom' | 'monotoneX';
  unit?: string;
  label?: string;
}

export interface CustomVictoryLineChartProps<T extends ChartDataPoint = ChartDataPoint> {
  data: T[];
  series: SeriesConfig[];
  xKey?: keyof T;
  width?: number;
  height?: number;
  containerStyle?: any;
  axisOptions?: any;
  domainPadding?: { left?: number; right?: number; top?: number; bottom?: number };
  padding?: { left?: number; right?: number; top?: number; bottom?: number };
  showArea?: boolean;
  showLine?: boolean;
  showScatter?: boolean;
  showActiveIndicator?: boolean;
  animationDuration?: number;
  formatXLabel?: (value: any) => string;
  formatYLabel?: (value: number, seriesKey: string) => string;
  onDataPointPress?: (dataPoint: T, seriesKey: string) => void;
  axisSide?: { x?: 'top' | 'bottom'; y?: 'left' | 'right' };
  tooltip?: TooltipOptions;
  areaGradient?: AreaGradientOptions;
  unit?: string;
}

// Tooltip prop type
interface TooltipOptions {
  show?: boolean;
  position?: 'inline' | 'overlay';
  animated?: boolean;
  valueFormatter?: (value: number, unit?: string) => string;
  dateFormatter?: (value: any) => string;
  title?: {
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    fontFamily?: string;
  };
  subtitle?: {
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    fontFamily?: string;
  };
  container?: {
    backgroundColor?: string;
    borderRadius?: number;
    padding?: { horizontal?: number; vertical?: number };
    margin?: { horizontal?: number; vertical?: number };
    borderColor?: string;
    borderWidth?: number;
  };
}

// Area gradient prop type
interface AreaGradientOptions {
  from: string;
  to: string;
}

// ActiveValueIndicator props
interface ActiveValueIndicatorProps {
  xPosition: SharedValue<number>;
  yPosition: SharedValue<number>;
  top: number;
  bottom: number;
  activeValue: SharedValue<number>;
  config: any;
  valueFormatter?: (value: number, unit?: string) => string;
  unit?: string;
}

// --- Utility Functions ---
export const createSeriesConfig = (
  key: string,
  color: string,
  options: Partial<Omit<SeriesConfig, 'key' | 'color'>> = {}
): SeriesConfig => ({
  key,
  color,
  areaColor: `${color}20`,
  strokeWidth: 1.5,
  showArea: true,
  showLine: true,
  showScatter: true,
  scatterRadius: 3,
  curveType: 'natural',
  ...options,
});

const formatNumber = (num: number): string => {
  if (isNaN(num)) return '0';
  if (num < 1000) return `${num}`;
  if (num < 1_000_000) return `${(num / 1_000).toFixed(1)}K`;
  if (num < 1_000_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  return `${(num / 1_000_000_000).toFixed(1)}B`;
};

const formatLabel = (val: string | number | undefined): string => (val == null ? '' : `${val}`);

const findLastValidValue = (data: ChartDataPoint[], yKey: string) => {
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i][yKey] != null && data[i][yKey] !== false) {
      return data[i];
    }
  }
  return data[0] || null;
};

// --- Active Indicator Components ---
const ActiveValueIndicatorInline = ({
  xPosition,
  yPosition,
  lineColor = '#666',
  indicatorColor = '#e40000',
  circleColor = '#ffa9a9',
}: {
  xPosition: SharedValue<number>;
  yPosition: SharedValue<number>;
  lineColor?: string;
  indicatorColor?: string;
  circleColor?: string;
}) => {
  return (
    <>
      <Circle cx={xPosition} cy={yPosition} r={8} color={circleColor} />
      <Circle cx={xPosition} cy={yPosition} r={5} color={indicatorColor} />
      <Circle cx={xPosition} cy={yPosition} r={3} color={'#fff'} />
    </>
  );
};

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
    require('../../../assets/fonts/SFProDisplayRegular.ttf'),
    config.text?.fontSize || 10
  );

  const formattedValue = useDerivedValue(() => {
    const val = Number(activeValue.value);
    if (isNaN(val)) return 'N/A';
    if (valueFormatter) {
      return valueFormatter(val, unit);
    }
    return unit ? `${Math.round(val)} ${unit}` : String(Math.round(val));
  });

  const start = useDerivedValue(() => vec(xPosition.value, bottom));
  const end = useDerivedValue(() => vec(xPosition.value, top + 20));
  const textWidth = useDerivedValue(() => font?.measureText(formattedValue.value).width || 0);
  const activeValueX = useDerivedValue(() => {
    const half = textWidth.value / 2;
    let pos = xPosition.value - half;
    if (pos < 0) return 0;
    if (pos + textWidth.value > SCREEN_WIDTH - 50) {
      return SCREEN_WIDTH - textWidth.value - 50;
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
      <Circle
        cx={xPosition}
        cy={yPosition}
        r={8}
        color={'#ffa9a9'}
      />
      <Circle
        cx={xPosition}
        cy={yPosition}
        r={5}
        color={'#e40000'}
      />
      <Circle
        cx={xPosition}
        cy={yPosition}
        r={3}
        color={'#fff'}
      />
      {font && config.text && (
        <SkiaText
          color={config.text.color || '#666'}
          font={font}
          text={formattedValue}
          x={activeValueX}
          y={top + 15}
        />
      )}
    </>
  );
};

// --- Main Component ---
const CustomVictoryLineChart: React.FC<CustomVictoryLineChartProps & { scatterConfig?: ScatterConfig[] }> = ({
  data,
  series,
  xKey = 'label',
  width = 400,
  height = 230,
  containerStyle,
  axisOptions = {},
  domainPadding = { left: 20, right: 10, top: 40, bottom: 12 },
  padding = { left: 10, right: 18, bottom: 0, top: 20 },
  showArea,
  showLine,
  showScatter,
  showActiveIndicator = true,
  animationDuration = 300,
  formatXLabel,
  formatYLabel,
  axisSide = { x: "bottom", y: "right" },
  tooltip = { show: false, position: 'inline' },
  areaGradient,
  unit = '',
  scatterConfig,
}) => {
  const { colors } = useTheme();
  const font = useFont(require('../../../assets/fonts/SFProDisplayRegular.ttf'), 9);
  
  // Validate data
  const isValidData = useMemo(() => {
    if (!data || data.length === 0) return false;
    const hasXKey = data.every((item: any) => xKey in item);
    if (!hasXKey) return false;
    const missingKeys = series.filter((s: any) => 
      !data.some((item: any) => s.key in item && typeof item[s.key] === 'number')
    );
    return missingKeys.length === 0;
  }, [data, series, xKey]);

  const primarySeries = series[0];
  const yKeys = series.map((s) => s.key);
  
  // Find last valid value for default state
  const lastValidValue = useMemo(() => 
    findLastValidValue(data, primarySeries?.key), 
    [data, primarySeries?.key]
  );
  
  const defaultValue = useMemo(() => {
    const value = lastValidValue?.[primarySeries?.key] || 0;
    if (tooltip.valueFormatter) {
      return tooltip.valueFormatter(value, unit);
    }
    return unit ? `${Math.round(value)} ${unit}` : String(Math.round(value));
  }, [lastValidValue, primarySeries?.key, unit, tooltip.valueFormatter]);
  
  const defaultDate = useMemo(() => {
    const date = lastValidValue?.[xKey as string];
    if (tooltip.dateFormatter) {
      return tooltip.dateFormatter(date);
    }
    return date ? String(date) : '';
  }, [lastValidValue, xKey, tooltip.dateFormatter]);

  // Chart press state
  const { state, isActive } = useChartPressState({
    x: lastValidValue?.[xKey as string] ?? '',
    y: primarySeries ? { [primarySeries.key]: lastValidValue?.[primarySeries.key] ?? 0 } : {},
  });

  // Derived values for tooltip
  const valueText = useDerivedValue(() => {
    if (!primarySeries) return defaultValue;
    const val = Number(state.y[primarySeries.key]?.value?.value);
    if (isNaN(val)) return defaultValue;
    if (tooltip.valueFormatter) {
      return tooltip.valueFormatter(val, unit);
    }
    return unit ? `${Math.round(val)} ${unit}` : String(Math.round(val));
  });

  const dateText = useDerivedValue(() => {
    return String(state.x.value?.value || defaultDate);
  });

  const animatedValueProps = useAnimatedProps(() => ({ 
    text: String(valueText.value) 
  }));
  
  const animatedDateProps = useAnimatedProps(() => ({ 
    text: String(dateText.value) 
  }));

  if (!isValidData || !primarySeries) {
    return (
      <View style={[{ width, height, backgroundColor: 'transparent' }, styles.graphContainer]}>
        <View style={styles.errorContainer}>
          <Text style={{ color: colors.text }}>Invalid data structure</Text>
        </View>
      </View>
    );
  }

  const activeIndicatorConfig = {
    show: showActiveIndicator,
    line: { color: primarySeries.color, opacity: 0.3, strokeWidth: 0.5 },
    text: { color: primarySeries.color, fontSize: 10 },
  };

  return (
    <View style={[{ width, height, backgroundColor: 'transparent' }, containerStyle, styles.graphContainer]}>
      {/* Inline Tooltip */}
      {tooltip.show && tooltip.position === 'inline' && (
        <View style={[
          styles.tooltipContainer,
          {
            backgroundColor: tooltip.container?.backgroundColor || 'rgba(255,255,255,0.95)',
            borderRadius: tooltip.container?.borderRadius || 16,
            paddingHorizontal: tooltip.container?.padding?.horizontal || 20,
            paddingVertical: tooltip.container?.padding?.vertical || 12,
            marginHorizontal: tooltip.container?.margin?.horizontal || 0,
            marginVertical: tooltip.container?.margin?.vertical || 0,
            borderColor: tooltip.container?.borderColor || '#eee',
            borderWidth: tooltip.container?.borderWidth || 1,
          },
        ]}>
          {tooltip.animated ? (
            <AnimatedTextInput
              editable={false}
              underlineColorAndroid="transparent"
              style={[
                styles.tooltipTitle,
                {
                  fontSize: tooltip.title?.fontSize || 20,
                  fontWeight: tooltip.title?.fontWeight as any || '700',
                  color: tooltip.title?.color || primarySeries.color,
                  fontFamily: tooltip.title?.fontFamily,
                },
              ]}
              animatedProps={animatedValueProps}
              defaultValue={defaultValue}
            />
          ) : (
            <Text style={[
              styles.tooltipTitle,
              {
                fontSize: tooltip.title?.fontSize || 20,
                fontWeight: tooltip.title?.fontWeight as any || '700',
                color: tooltip.title?.color || primarySeries.color,
                fontFamily: tooltip.title?.fontFamily,
              },
            ]}>
              {valueText.value}
            </Text>
          )}
          
          {tooltip.animated ? (
            <AnimatedTextInput
              editable={false}
              underlineColorAndroid="transparent"
              style={[
                styles.tooltipSubtitle,
                {
                  fontSize: tooltip.subtitle?.fontSize || 14,
                  fontWeight: tooltip.subtitle?.fontWeight as any || '600',
                  color: tooltip.subtitle?.color || '#666',
                  fontFamily: tooltip.subtitle?.fontFamily,
                },
              ]}
              animatedProps={animatedDateProps}
              defaultValue={defaultDate}
            />
          ) : (
            <Text style={[
              styles.tooltipSubtitle,
              {
                fontSize: tooltip.subtitle?.fontSize || 14,
                fontWeight: tooltip.subtitle?.fontWeight as any || '600',
                color: tooltip.subtitle?.color || '#666',
                fontFamily: tooltip.subtitle?.fontFamily,
              },
            ]}>
              {dateText.value}
            </Text>
          )}
    </View>
      )}

      {/* Chart */}
      <CartesianChart
        chartPressState={state}
        axisOptions={{
          font,
          lineColor: axisOptions.lineColor || "rgba(128, 128, 128, 0.049)",
          tickCount: axisOptions.tickCount || { x: 12, y: 6 },
          labelOffset: axisOptions.labelOffset || { x: 2, y: 8 },
          labelColor: axisOptions.labelColor || '#666',
          formatYLabel: formatYLabel || formatNumber,
          formatXLabel: formatXLabel || formatLabel,
          axisSide: axisOptions.axisSide || axisSide,
        }}
        domainPadding={domainPadding}
        padding={padding}
        data={data}
        xKey={String(xKey)}
        yKeys={yKeys}
        renderOutside={({ chartBounds }) => {
          if (tooltip.show && tooltip.position === 'inline' && isActive) {
            return (
              <ActiveValueIndicatorInline
                xPosition={state.x.position}
                yPosition={state.y[primarySeries.key]?.position}
                lineColor={primarySeries.color}
                indicatorColor="#e40000"
                circleColor="#ffa9a9"
              />
            );
          }
          
          // Activity indicator with value label for non-inline mode
          if (isActive && showActiveIndicator && (!tooltip.show || tooltip.position !== 'inline')) {
            return (
              <ActiveValueIndicator
                xPosition={state.x.position}
                yPosition={state.y[primarySeries.key]?.position}
                top={chartBounds.top}
                bottom={chartBounds.bottom}
                activeValue={state.y[primarySeries.key]?.value as SharedValue<number>}
                config={activeIndicatorConfig}
                valueFormatter={tooltip.valueFormatter}
                unit={unit}
              />
            );
          }
          
          return null;
        }}
      >
        {({ points }) => (
          <>
            {series.map((seriesConfig) => {
              const seriesPoints = points[seriesConfig.key];
              if (!seriesPoints) return null;

              return (
                <React.Fragment key={seriesConfig.key}>
                  {/* Area with optional gradient */}
                  {(showArea ?? seriesConfig.showArea) !== false && (
                    areaGradient ? (
                      <Area
                        curveType={seriesConfig.curveType || "cardinal"}
                        points={seriesPoints}
                        connectMissingData={true}
                        animate={{ type: "timing", duration: animationDuration }}
                      >
                        <LinearGradient
                          start={vec(0, 0)}
                          end={vec(0, height)}
                          colors={[areaGradient.from, areaGradient.to]}
                        />
                      </Area>
                    ) : (
                      <Area
                        curveType={seriesConfig.curveType || "cardinal"}
                        points={seriesPoints}
                        color={seriesConfig.areaColor || `${seriesConfig.color}20`}
                        connectMissingData={true}
                        animate={{ type: "timing", duration: animationDuration }}
                      />
                    )
                  )}
                  
                  {/* Line */}
                  {(showLine ?? seriesConfig.showLine) !== false && (
                    <Line
                      curveType={seriesConfig.curveType || 'natural'}
                      connectMissingData={true}
                      animate={{ type: "timing", duration: animationDuration }}
                      points={seriesPoints}
                      color={seriesConfig.color}
                      strokeWidth={seriesConfig.strokeWidth || 1.5}
                    />
                  )}
                  
                  {/* Scatter points (customizable overlays) */}
                  {(showScatter ?? seriesConfig.showScatter) !== false && (
                    scatterConfig && scatterConfig.length > 0
                      ? scatterConfig.map((sc: ScatterConfig, idx: number) => (
                          <Scatter
                            key={idx}
                            points={seriesPoints}
                            color={sc.color}
                            radius={sc.radius || 3}
                            style={sc.style || 'fill'}
                            // strokeColor and strokeWidth are not supported by Scatter, but can be added if the library supports them in the future
                          />
                        ))
                      : (
                          <Scatter
                            points={seriesPoints}
                            shape="circle"
                            radius={seriesConfig.scatterRadius || 3}
                            style="fill"
                            color={seriesConfig.color}
                          />
                        )
                  )}
                </React.Fragment>
              );
            })}
          </>
        )}
      </CartesianChart>
    </View>
  );
};

const styles = StyleSheet.create({
  graphContainer: {
    borderRadius: 16,
    paddingVertical: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContainer: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tooltipTitle: {
    padding: 0,
    margin: 0,
    textAlign: 'center',
  },
  tooltipSubtitle: {
    marginTop: 5,
    padding: 0,
    margin: 0,
    textAlign: 'center',
  },
});

export default memo(CustomVictoryLineChart);