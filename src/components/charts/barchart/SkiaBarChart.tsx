import React, { useEffect, useState } from 'react';
import {
  GestureResponderEvent,
  StyleSheet,
  Text as RNText,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  Canvas,
  Group,
  Path,
  Skia,
  Text,
  useFont,
} from '@shopify/react-native-skia';
import * as d3 from 'd3';
import {
  SharedValue,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// ================== Data ==================

interface Data {
  label: string;
  day: string;
  value: number;
}

const data: Data[] = [
  { label: 'Mon', day: 'Monday', value: 5796 },
  { label: 'Tue', day: 'Tuesday', value: 4036 },
  { label: 'Wed', day: 'Wednesday', value: 4897 },
  { label: 'Thu', day: 'Thursday', value: 5455 },
  { label: 'Fri', day: 'Friday', value: 4811 },
  { label: 'Sat', day: 'Saturday', value: 2113 },
  { label: 'Sun', day: 'Sunday', value: 1675 },
];

const FONT_PATH = require('../../../assets/fonts/SFProDisplayRegular.ttf');

// ================== Utils ==================

const useBarColor = (
  selectedBar: SharedValue<string | null>,
  label: string,
  active = '#7c3aed',
  inactive = '#fafafa',
) =>
  useDerivedValue(() =>
    withTiming(
      !selectedBar.value || selectedBar.value === label
        ? active
        : inactive,
    ),
  );

// ================== Animated Text ==================

const AnimatedText = ({ selectedValue }: { selectedValue: SharedValue<number> }) => {
  const font = useFont(FONT_PATH, 32);
  const text = useDerivedValue(() => `${Math.round(selectedValue.value)}`);

  if (!font) return null;

  const { height } = font.measureText('0');

  return (
    <Canvas style={{ height: height + 28 }}>
      <Text text={text} font={font} color="#111111" y={height + 15} />
    </Canvas>
  );
};

// ================== X Axis Text ==================

const XAxisText = ({
  x,
  y,
  text,
  selectedBar,
}: {
  x: number;
  y: number;
  text: string;
  selectedBar: SharedValue<string | null>;
}) => {
  const font = useFont(FONT_PATH, 18);
  const color = useBarColor(selectedBar, text, '#111111');

  if (!font) return null;

  const { width } = font.measureText(text);

  return (
    <Text
      font={font}
      text={text}
      x={x - width / 2}
      y={y}
      color={color}
    />
  );
};

// ================== Bar ==================

const BarPath = ({
  x,
  y,
  barWidth,
  graphHeight,
  progress,
  label,
  selectedBar,
}: {
  x: number;
  y: number;
  barWidth: number;
  graphHeight: number;
  progress: SharedValue<number>;
  label: string;
  selectedBar: SharedValue<string | null>;
}) => {
  const color = useBarColor(selectedBar, label);

  const path = useDerivedValue(() => {
    const p = Skia.Path.Make();
    p.addRRect({
      rect: {
        x: x - barWidth / 2,
        y: graphHeight,
        width: barWidth,
        height: -y * progress.value,
      },
      rx: 8,
      ry: 8,
    });
    return p;
  });

  return <Path path={path} color={color} />;
};

// ================== Chart ==================

const SkiaBarChart = () => {
  const { width } = useWindowDimensions();

  const barWidth = 28;
  const canvasHeight = 220;
  const graphHeight = canvasHeight - 20;

  const totalValue = data.reduce((a, b) => a + b.value, 0);

  const selectedBar = useSharedValue<string | null>(null);
  const selectedValue = useSharedValue(0);
  const progress = useSharedValue(0);

  const [selectedDay, setSelectedDay] = useState('Total');

  const x = d3
    .scalePoint<string>()
    .domain(data.map(d => d.label))
    .range([0, width])
    .padding(1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.value)!])
    .range([0, graphHeight]);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 1000 });
    selectedValue.value = withTiming(totalValue, { duration: 1000 });
  }, []);

  const onTouch = ({ nativeEvent }: GestureResponderEvent) => {
    const { locationX, locationY } = nativeEvent;

    const bars = data.map(d => ({
      ...d,
      x: x(d.label)!,
    }));

    const closest = bars.reduce((a, b) =>
      Math.abs(b.x - locationX) < Math.abs(a.x - locationX) ? b : a,
    );

    const barHeight = y(closest.value) * progress.value;
    const barTop = graphHeight - barHeight;

    const inside =
      locationX >= closest.x - barWidth / 2 &&
      locationX <= closest.x + barWidth / 2 &&
      locationY >= barTop &&
      locationY <= graphHeight;

    selectedBar.value = inside ? closest.label : null;
    selectedValue.value = withTiming(inside ? closest.value : totalValue);
    setSelectedDay(inside ? closest.day : 'Total');
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <RNText style={styles.textTitle}>Skia & D3 Bar charts</RNText>
        <AnimatedText selectedValue={selectedValue} />
        <RNText style={styles.textSteps}>{selectedDay} Steps</RNText>
      </View>

      <Canvas
        style={{ width, height: canvasHeight, marginBottom: 26 }}
        onTouchStart={onTouch}
      >
        {data.map(d => {
          const cx = x(d.label)!;
          return (
            <Group key={d.label}>
              <BarPath
                x={cx}
                y={y(d.value)}
                barWidth={barWidth}
                graphHeight={graphHeight}
                progress={progress}
                label={d.label}
                selectedBar={selectedBar}
              />
              <XAxisText
                x={cx}
                y={canvasHeight}
                text={d.label}
                selectedBar={selectedBar}
              />
            </Group>
          );
        })}
      </Canvas>
    </View>
  );
};

export default SkiaBarChart;

// ================== Styles ==================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 20,
    marginBottom: 40,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  textTitle: {
    fontSize: 26,
    color: '#111111',
    fontWeight: '800',
  },
  textSteps: {
    fontSize: 20,
    color: '#111111',
  },
});
