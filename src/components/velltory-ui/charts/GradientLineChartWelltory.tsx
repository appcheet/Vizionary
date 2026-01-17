import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  useFont,
  Text as SkiaText,
  Circle,
  RoundedRect,
  LinearGradient,
  vec,
  Group,
  Line,
  BlurMask,
} from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import * as d3 from 'd3';
import { generateLineData } from './utils/dataGenerator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 20;
const CHART_HEIGHT = 280;
const CHART_PADDING = { top: 60, right: 20, bottom: 60, left: 20 };

const FONT_PATH = require('../../../assets/fonts/SFProDisplayRegular.ttf');

interface LineDataPoint {
  timestamp: string;
  date: string;
  value: number;
}

interface GradientLineChartProps {
  data?: LineDataPoint[];
}

const GradientLineChartWelltory = ({ data: initialData }: GradientLineChartProps) => {
  const data = useMemo(() => initialData || generateLineData(6) as any, [initialData]);

  const touchX = useSharedValue(0);
  const touchActive = useSharedValue(0);
  const selectedIndex = useSharedValue(data.length - 1);

  const font = useFont(FONT_PATH, 10);
  const valueFont = useFont(FONT_PATH, 24);
  const labelFont = useFont(FONT_PATH, 14);
  const tinyFont = useFont(FONT_PATH, 9);

  const xScale = useMemo(() =>
    d3.scalePoint()
      .domain(data.map((d) => d.timestamp))
      .range([CHART_PADDING.left, CHART_WIDTH - CHART_PADDING.right])
      .padding(0.1),
    [data]
  );

  const yScale = useMemo(() =>
    d3.scaleLinear()
      .domain([0, 100])
      .range([CHART_HEIGHT - CHART_PADDING.bottom, CHART_PADDING.top]),
    []
  );

  const linePath = useMemo(() => {
    const line = d3.line<LineDataPoint>()
      .x((d) => xScale(d.timestamp) || 0)
      .y((d) => yScale(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5))(data);
    return Skia.Path.MakeFromSVGString(line || '') || Skia.Path.Make();
  }, [xScale, yScale]);

  const xPoints = useMemo(() => data.map((d: LineDataPoint) => xScale(d.timestamp) || 0), [xScale, data]);
  const yPoints = useMemo(() => data.map((d: LineDataPoint) => yScale(d.value)), [yScale, data]);

  const handleTouch = (x: number, isInitial = false) => {
    'worklet';
    let closestIndex = 0;
    let minDistance = Infinity;

    xPoints.forEach((pointX: number, i: number) => {
      const distance = Math.abs(pointX - x);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    });

    if (isInitial) {
      touchX.value = withTiming(xPoints[closestIndex], { duration: 150 });
    } else {
      touchX.value = xPoints[closestIndex];
    }
    selectedIndex.value = closestIndex;
  };

  const gesture = Gesture.Pan()
    .runOnJS(false)
    .onStart((e) => {
      'worklet';
      touchActive.value = withTiming(1, { duration: 200 });
      handleTouch(e.x, true);
    })
    .onUpdate((e) => {
      'worklet';
      handleTouch(e.x);
    })
    .onEnd(() => {
      'worklet';
      touchActive.value = withTiming(0, { duration: 200 });
    });

  const selectedValueText = useDerivedValue(() => `${data[selectedIndex.value]?.value || 0} ms`);
  const selectedValueColor = useDerivedValue(() => (data[selectedIndex.value]?.value || 0) > 30 ? '#10b981' : '#ef4444');

  const p1 = useDerivedValue(() => vec(touchX.value, CHART_PADDING.top));
  const p2 = useDerivedValue(() => vec(touchX.value, CHART_HEIGHT - CHART_PADDING.bottom));
  const selectedYValue = useDerivedValue(() => yPoints[selectedIndex.value] || 0);

  const tooltipTransform = useDerivedValue(() => [
    { translateX: touchX.value - 60 },
    { translateY: selectedYValue.value - 65 }
  ]);

  const tooltipValueText = useDerivedValue(() => `Value: ${data[selectedIndex.value]?.value || 0}`);

  if (!font || !valueFont || !labelFont || !tinyFont) return null;


  return (
    <View style={styles.chartContainer}>
      <GestureDetector gesture={gesture}>
        <Canvas style={styles.canvas}>
          <RoundedRect x={0} y={0} width={CHART_WIDTH} height={CHART_HEIGHT} r={16} color="#1a1a2e" />

          {/* Grid lines */}
          {data.map((d, i) => (
            <Line
              key={i}
              p1={vec(xScale(d.timestamp) || 0, CHART_PADDING.top)}
              p2={vec(xScale(d.timestamp) || 0, CHART_HEIGHT - CHART_PADDING.bottom)}
              color="#ffffff05"
              strokeWidth={1}
            />
          ))}

          {/* Segmented Line Path */}
          <Path path={linePath} style="stroke" strokeWidth={3} strokeCap="round" strokeJoin="round">
            <LinearGradient
              start={vec(0, CHART_PADDING.top)}
              end={vec(0, CHART_HEIGHT - CHART_PADDING.bottom)}
              colors={['#10b981', '#10b981', '#ef4444', '#ef4444']}
              positions={[0, 0.6, 0.8, 1]}
            />
          </Path>

          {/* Data point dots */}
          {data.map((d, i) => {
            const cx = xScale(d.timestamp) || 0;
            const cy = yScale(d.value);
            const color = d.value > 30 ? '#10b981' : '#ef4444';

            return (
              <Group key={i}>
                <Circle cx={cx} cy={cy} r={3} color={color} />
              </Group>
            );
          })}

          {/* X-axis labels */}
          {data.map((d, i) => {
            if (i % 2 !== 0) return null; // Show every 2nd label to avoid crowding
            return (
              <Group key={i}>
                <SkiaText
                  x={(xScale(d.timestamp) || 0) - 20}
                  y={CHART_HEIGHT - CHART_PADDING.bottom + 25}
                  text={d.timestamp}
                  font={font}
                  color="#6b7280"
                />
                <SkiaText
                  x={(xScale(d.timestamp) || 0) - 10}
                  y={CHART_HEIGHT - CHART_PADDING.bottom + 40}
                  text={d.date}
                  font={font}
                  color="#4b5563"
                />
              </Group>
            );
          })}

          {/* Interactive Highlight */}
          <Group opacity={touchActive}>
            <Line
              p1={p1}
              p2={p2}
              color="#ffffff20"
              strokeWidth={1}
            />

            {/* Speech Bubble Tooltip */}
            <Group transform={tooltipTransform}>
              <RoundedRect
                x={0}
                y={0}
                width={120}
                height={45}
                r={12}
                color={selectedValueColor}
              />
              {/* Triangle tail */}
              <Path
                path="M 50 45 L 60 55 L 70 45 Z"
                color={selectedValueColor}
              />
              <SkiaText
                x={15}
                y={20}
                text={tooltipValueText}
                font={font}
                color="#ffffff"
              />
              <SkiaText
                x={15}
                y={35}
                text="Recovering well"
                font={tinyFont}
                color="#ffffffcc"
              />
            </Group>

            <Circle cx={touchX} cy={selectedYValue} r={10} color={selectedValueColor}>
              <BlurMask blur={8} style="normal" />
            </Circle>
            <Circle cx={touchX} cy={selectedYValue} r={5} color={selectedValueColor} />
            <Circle cx={touchX} cy={selectedYValue} r={2} color="#ffffff" />
          </Group>


          {/* Value Display */}
          <SkiaText
            x={CHART_WIDTH - 100}
            y={40}
            text={selectedValueText}
            font={valueFont}
            color={selectedValueColor}
          />
        </Canvas>
      </GestureDetector>
    </View>
  );
};

export default GradientLineChartWelltory;

const styles = StyleSheet.create({
  chartContainer: {
    marginVertical: 15,
    marginBottom: 30,
    alignItems: 'center',
    borderRadius: 16,
    overflow: 'hidden',
  },
  canvas: {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
  },
});