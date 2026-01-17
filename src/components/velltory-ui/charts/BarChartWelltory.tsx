import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import {
  Canvas,
  useFont,
  Text as SkiaText,
  RoundedRect,
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
import { generateBarData } from './utils/dataGenerator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 20;
const CHART_HEIGHT = 200;
const CHART_PADDING = { top: 20, right: 20, bottom: 40, left: 20 };

const FONT_PATH = require('../../../assets/fonts/SFProDisplayRegular.ttf');

interface BarDataPoint {
  value: number;
  label: string;
}

interface BarChartProps {
  title?: string;
  time?: string;
  data?: BarDataPoint[];
}

const BarChartWelltory = ({
  title = "Heart rate variability",
  time = "3:47 PM",
  data: initialData
}: BarChartProps) => {
  const data = useMemo(() => initialData || generateBarData() as any, [initialData]);

  const touchX = useSharedValue(0);
  const touchActive = useSharedValue(0);
  const selectedIndex = useSharedValue(-1);

  const font = useFont(FONT_PATH, 11);

  const xScale = useMemo(() =>
    d3.scaleBand()
      .domain(data.map((d) => d.label))
      .range([CHART_PADDING.left, CHART_WIDTH - CHART_PADDING.right])
      .padding(0.8),
    [data]
  );

  const yScale = useMemo(() =>
    d3.scaleLinear()
      .domain([0, 100])
      .range([CHART_HEIGHT - CHART_PADDING.bottom, CHART_PADDING.top]),
    []
  );

  const barWidth = xScale.bandwidth();
  const centerXs = useMemo(() => data.map((d: any) => (xScale(d.label) || 0) + barWidth / 2), [xScale, barWidth, data]);
  const barYPoints = useMemo(() => data.map((d: any) => yScale(d.value)), [yScale, data]);
  const barHPoints = useMemo(() => data.map((d: any) => CHART_HEIGHT - CHART_PADDING.bottom - yScale(d.value)), [yScale, data]);

  const handleTouch = (x: number, isInitial = false) => {
    'worklet';
    let closestIndex = -1;
    let minDistance = Infinity;

    centerXs.forEach((pointX: number, i: number) => {
      const distance = Math.abs(pointX - x);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    });

    if (closestIndex !== -1) {
      if (isInitial) {
        touchX.value = withTiming(centerXs[closestIndex], { duration: 150 });
      } else {
        touchX.value = centerXs[closestIndex];
      }
      selectedIndex.value = closestIndex;
    }
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

  const p1vec = useDerivedValue(() => vec(touchX.value, CHART_PADDING.top));
  const p2vec = useDerivedValue(() => vec(touchX.value, CHART_HEIGHT - CHART_PADDING.bottom));

  if (!font) return null;


  return (
    <View style={styles.chartContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.timeText}>{time}</Text>
      </View>

      <View style={styles.badgeBanner}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>6/9 metrics ok</Text>
        </View>
      </View>

      <View style={styles.valueSection}>
        <Text style={styles.label}>SDNN</Text>
        <Text style={styles.value}>32 ms</Text>
      </View>

      <GestureDetector gesture={gesture}>

        <Canvas style={styles.canvas}>
          <RoundedRect x={0} y={0} width={CHART_WIDTH} height={CHART_HEIGHT} r={16} color="#1a1a2e" />

          {/* Vertical Guides */}
          {data.map((d, i) => (
            <Line
              key={i}
              p1={vec((xScale(d.label) || 0) + barWidth / 2, CHART_PADDING.top)}
              p2={vec((xScale(d.label) || 0) + barWidth / 2, CHART_HEIGHT - CHART_PADDING.bottom)}
              color="#ffffff08"
              strokeWidth={1}
            />
          ))}

          {/* Bars */}
          {data.map((d, i) => {
            const bx = xScale(d.label) || 0;
            const by = barYPoints[i];
            const bh = barHPoints[i];

            return (
              <Group key={i}>
                <RoundedRect
                  x={bx}
                  y={by}
                  width={barWidth}
                  height={Math.max(bh, 2)}
                  r={2}
                  color={d.value > 0 ? '#fbbf24' : '#fbbf2410'}
                >
                  {d.value > 20 && <BlurMask blur={3} style="solid" />}
                </RoundedRect>
              </Group>
            );
          })}

          {/* X-axis labels */}
          {data.map((d, i) => (
            <SkiaText
              key={i}
              x={(xScale(d.label) || 0) + barWidth / 2 - 12}
              y={CHART_HEIGHT - CHART_PADDING.bottom + 20}
              text={d.label}
              font={font}
              color="#4b5563"
            />
          ))}

          {/* Tooltip */}
          <Group opacity={touchActive}>
            <Line
              p1={p1vec}
              p2={p2vec}
              color="#ffffff60"
              strokeWidth={1}
            />
          </Group>
        </Canvas>
      </GestureDetector>
    </View>
  );

};

export default BarChartWelltory;

const styles = StyleSheet.create({
  chartContainer: {
    marginVertical: 15,
    borderRadius: 24,
    backgroundColor: '#1a1a2e',
    padding: 20,
    width: CHART_WIDTH,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  timeText: {
    color: '#4b5563',
    fontSize: 14,
  },
  badgeBanner: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  badge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  valueSection: {
    marginBottom: 10,
  },
  label: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 4,
  },
  value: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  canvas: {
    width: CHART_WIDTH - 40,
    height: CHART_HEIGHT,
  },
});