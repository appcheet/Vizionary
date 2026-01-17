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
  Shadow,
  BlurMask,
} from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  useDerivedValue,
} from 'react-native-reanimated';
import * as d3 from 'd3';
import { generateRandomHeartData } from './utils/dataGenerator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 20;
const CHART_HEIGHT = 350;
const PADDING = { top: 80, right: 80, bottom: 60, left: 20 };

const FONT_PATH = require('../../../assets/fonts/SFProDisplayRegular.ttf');

interface MultiLineDataPoint {
  timestamp: string;
  date: string;
  health: number;
  energy: number;
  stress: number;
}

interface MultiLineChartProps {
  data?: MultiLineDataPoint[];
}

const MultiLineChartWelltory = ({ data: initialData }: MultiLineChartProps) => {
  const data = useMemo(() => initialData || generateRandomHeartData(7) as any, [initialData]);

  const touchX = useSharedValue(0);
  const touchActive = useSharedValue(0);
  const selectedIndex = useSharedValue(data.length - 1);

  const font = useFont(FONT_PATH, 11);
  const labelFont = useFont(FONT_PATH, 16);
  const smallLabelFont = useFont(FONT_PATH, 12);

  const xScale = useMemo(() =>
    d3.scalePoint()
      .domain(data.map((d) => d.timestamp))
      .range([PADDING.left, CHART_WIDTH - PADDING.right])
      .padding(0.1),
    []
  );

  const yScale = useMemo(() =>
    d3.scaleLinear()
      .domain([0, 100])
      .range([CHART_HEIGHT - PADDING.bottom, PADDING.top]),
    []
  );

  // Generate paths
  const healthPath = useMemo(() => {
    const line = d3.line<MultiLineDataPoint>()
      .x((d) => xScale(d.timestamp) || 0)
      .y((d) => yScale(d.health))
      .curve(d3.curveCatmullRom.alpha(0.5))(data);
    return Skia.Path.MakeFromSVGString(line || '') || Skia.Path.Make();
  }, [xScale, yScale]);

  const energyPath = useMemo(() => {
    const line = d3.line<MultiLineDataPoint>()
      .x((d) => xScale(d.timestamp) || 0)
      .y((d) => yScale(d.energy))
      .curve(d3.curveCatmullRom.alpha(0.5))(data);
    return Skia.Path.MakeFromSVGString(line || '') || Skia.Path.Make();
  }, [xScale, yScale]);

  const stressPath = useMemo(() => {
    const line = d3.line<MultiLineDataPoint>()
      .x((d) => xScale(d.timestamp) || 0)
      .y((d) => yScale(d.stress))
      .curve(d3.curveCatmullRom.alpha(0.5))(data);
    return Skia.Path.MakeFromSVGString(line || '') || Skia.Path.Make();
  }, [xScale, yScale]);

  const xPoints = useMemo(() => data.map((d: any) => xScale(d.timestamp) || 0), [xScale, data]);
  const healthYPoints = useMemo(() => data.map((d: any) => yScale(d.health)), [yScale, data]);
  const energyYPoints = useMemo(() => data.map((d: any) => yScale(d.energy)), [yScale, data]);
  const stressYPoints = useMemo(() => data.map((d: any) => yScale(d.stress)), [yScale, data]);

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

  const indicatorOpacity = useDerivedValue(() => touchActive.value);
  const indicatorX = useDerivedValue(() => touchX.value);

  const healthVal = useDerivedValue(() => `HEALTH ${data[selectedIndex.value]?.health || 0} %`);
  const energyVal = useDerivedValue(() => `ENERGY ${data[selectedIndex.value]?.energy || 0} %`);
  const stressVal = useDerivedValue(() => `STRESS ${data[selectedIndex.value]?.stress || 0} %`);

  const lastHealthY = useMemo(() => yScale(data[data.length - 1].health), [yScale, data]);
  const lastEnergyY = useMemo(() => yScale(data[data.length - 1].energy), [yScale, data]);
  const lastStressY = useMemo(() => yScale(data[data.length - 1].stress), [yScale, data]);

  const p1vec = useDerivedValue(() => vec(indicatorX.value, PADDING.top - 20));
  const p2vec = useDerivedValue(() => vec(indicatorX.value, CHART_HEIGHT - PADDING.bottom));

  if (!font || !labelFont || !smallLabelFont) return null;


  return (
    <View style={styles.chartContainer}>
      <GestureDetector gesture={gesture}>
        <Canvas style={styles.canvas}>
          {/* Background */}
          <RoundedRect x={0} y={0} width={CHART_WIDTH} height={CHART_HEIGHT} r={16} color="#1a1a2e" />

          {/* Grid Lines */}
          {data.map((d, i) => (
            <Line
              key={i}
              p1={vec(xScale(d.timestamp) || 0, PADDING.top)}
              p2={vec(xScale(d.timestamp) || 0, CHART_HEIGHT - PADDING.bottom)}
              color="#ffffff10"
              strokeWidth={1}
            />
          ))}

          {/* Horizontal Safe Line */}
          <Line
            p1={vec(PADDING.left, PADDING.top - 10)}
            p2={vec(CHART_WIDTH - PADDING.right, PADDING.top - 10)}
            color="#10b981"
            strokeWidth={1.5}
          />

          {/* Paths */}
          <Group>
            <Path path={healthPath} style="stroke" strokeWidth={3} strokeCap="round" color="#10b981" />
            <Path path={energyPath} style="stroke" strokeWidth={3} strokeCap="round" color="#fbbf24" />
            <Path path={stressPath} style="stroke" strokeWidth={3} strokeCap="round" color="#3b82f6" />
          </Group>

          {/* Dots on points */}
          {data.map((d, i) => {
            const cx = xScale(d.timestamp) || 0;
            return (
              <Group key={i}>
                <Circle cx={cx} cy={healthYPoints[i]} r={2} color="#10b981" />
                <Circle cx={cx} cy={energyYPoints[i]} r={2} color="#fbbf24" />
                <Circle cx={cx} cy={stressYPoints[i]} r={2} color="#3b82f6" />
              </Group>
            )
          })}

          {/* X-Axis labels */}
          {data.map((d, i) => (
            <Group key={i}>
              <SkiaText
                x={(xScale(d.timestamp) || 0) - 15}
                y={CHART_HEIGHT - PADDING.bottom + 25}
                text={d.timestamp}
                font={font}
                color="#6b7280"
              />
              <SkiaText
                x={(xScale(d.timestamp) || 0) - 15}
                y={CHART_HEIGHT - PADDING.bottom + 40}
                text={d.date}
                font={font}
                color="#4b5563"
              />
            </Group>
          ))}

          {/* Right Labels styled like Welltory */}
          <Group>
            <SkiaText x={CHART_WIDTH - 70} y={lastHealthY} text="Health" font={smallLabelFont} color="#ffffff" />
            <SkiaText x={CHART_WIDTH - 70} y={lastEnergyY} text="Energy" font={smallLabelFont} color="#ffffff" />
            <SkiaText x={CHART_WIDTH - 70} y={lastStressY} text="Stress" font={smallLabelFont} color="#ffffff" />
          </Group>

          {/* Interactive UI */}
          <Group opacity={indicatorOpacity}>
            <Line
              p1={p1vec}
              p2={p2vec}
              color="#ffffff30"
              strokeWidth={1}
            />
            {/* Glowing Dot at Top */}
            <Group>
              <Circle cx={touchX} cy={PADDING.top - 20} r={10} color="#10b98130">
                <BlurMask blur={5} style="normal" />
              </Circle>
              <Circle cx={touchX} cy={PADDING.top - 20} r={4} color="#10b981" />
              <Circle cx={touchX} cy={PADDING.top - 20} r={1.5} color="#ffffff" />
            </Group>
          </Group>

          {/* Header Stats */}
          <SkiaText x={20} y={35} text={healthVal} font={labelFont} color="#10b981" />
          <SkiaText x={20} y={55} text={energyVal} font={labelFont} color="#fbbf24" />
          <SkiaText x={20} y={75} text={stressVal} font={labelFont} color="#3b82f6" />

        </Canvas>
      </GestureDetector>
    </View>
  );
};

export default MultiLineChartWelltory

const styles = StyleSheet.create({
  chartContainer: {
    marginVertical: 15,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  canvas: {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
  },
});




