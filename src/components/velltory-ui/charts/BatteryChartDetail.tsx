import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import {
    Canvas,
    RoundedRect,
    Skia,
    LinearGradient,
    vec,
    Group,
    Line,
    BlurMask,
    useFont,
    Circle,
} from '@shopify/react-native-skia';
import * as d3 from 'd3';
import { Moon } from 'lucide-react-native';
import { generateBatteryDetailData } from './utils/dataGenerator';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    withTiming,
    useDerivedValue,
    runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 200;

const FONT_PATH = require('../../../assets/fonts/SFProDisplayRegular.ttf');

const BatteryChartDetail = React.memo(() => {
    const data = useMemo(() => generateBatteryDetailData(32), []);
    const touchX = useSharedValue(0);
    const touchActive = useSharedValue(0);
    const selectedIdx = useSharedValue(data.length - 1);
    const [activeIndex, setActiveIndex] = React.useState(data.length - 1);

    const font = useFont(FONT_PATH, 12);

    const xScale = useMemo(() =>
        d3.scaleBand()
            .domain(data.map((_, i) => i.toString()))
            .range([0, CHART_WIDTH])
            .padding(0.2),
        [data]);

    const yScale = useMemo(() =>
        d3.scaleLinear().domain([0, 100]).range([CHART_HEIGHT, 0]),
        []);

    const xPoints = useMemo(() => data.map((_, i) => (xScale(i.toString()) || 0) + xScale.bandwidth() / 2), [data, xScale]);

    // Pre-calculate all y-values (can't call scale functions in worklets)
    const yValues = useMemo(() => data.map(d => yScale(d.value)), [data, yScale]);

    const handleTouch = (x: number) => {
        'worklet';
        let closestIndex = 0;
        let minDistance = Infinity;
        xPoints.forEach((px, i) => {
            const dist = Math.abs(px - x);
            if (dist < minDistance) {
                minDistance = dist;
                closestIndex = i;
            }
        });
        touchX.value = xPoints[closestIndex];
        selectedIdx.value = closestIndex;
        runOnJS(setActiveIndex)(closestIndex);
    };

    const gesture = Gesture.Pan()
        .runOnJS(false)
        .onStart((e) => {
            'worklet';
            touchActive.value = withTiming(1);
            handleTouch(e.x);
        })
        .onUpdate((e) => {
            'worklet';
            handleTouch(e.x);
        })
        .onEnd(() => {
            'worklet';
            touchActive.value = withTiming(0);
        });

    // Derived values for interactive elements (must be at top level)
    const lineP1 = useDerivedValue(() => vec(touchX.value, 0));
    const lineP2 = useDerivedValue(() => vec(touchX.value, CHART_HEIGHT));
    const circleY = useDerivedValue(() => {
        const idx = selectedIdx.value;
        // Use pre-calculated y-values instead of calling yScale
        return yValues[idx] || 0;
    });

    if (!font) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.mainTitle}>Battery</Text>

            <View style={styles.chartWrapper}>
                <View style={styles.sleepHighlight}>
                    <View style={styles.sleepInfo}>
                        <Text style={styles.sleepTime}>5h 53m</Text>
                        <Moon size={16} color="#ffffff80" fill="#ffffff20" />
                    </View>
                </View>

                <GestureDetector gesture={gesture}>
                    <Canvas style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}>
                        {data.map((d, i) => {
                            const bw = xScale.bandwidth();
                            const bh = CHART_HEIGHT - yScale(d.value);
                            const bx = xScale(i.toString()) || 0;
                            const by = yScale(d.value);

                            let color = '#6366f1';
                            if (d.type === 'forecast') color = '#312e81';

                            return (
                                <Group key={i}>
                                    <RoundedRect
                                        x={bx}
                                        y={by}
                                        width={bw}
                                        height={bh}
                                        r={4}
                                        color={color}
                                    />
                                </Group>
                            );
                        })}

                        {/* Interactive Tooltip Line & Dot */}
                        <Group opacity={touchActive}>
                            <Line
                                p1={lineP1}
                                p2={lineP2}
                                color="#ffffff40"
                                strokeWidth={1}
                            />
                            {/* We use a single dynamic circle instead of one per bar */}
                            <Circle
                                cx={touchX}
                                cy={circleY}
                                r={4}
                                color="#ffffff"
                            />
                        </Group>
                    </Canvas>
                </GestureDetector>

                {/* Floating Tooltip Labels */}
                <Animated.View style={[styles.tooltipPos, { left: xPoints[7] }]}>
                    <Text style={styles.tooltipValue}>77%</Text>
                </Animated.View>

                <View style={styles.timeLabels}>
                    <Text style={styles.timeText}>11:53 pm</Text>
                    <Text style={styles.timeText}>6:32 am</Text>
                </View>
            </View>

            <View style={styles.tabs}>
                <Text style={[styles.tabText, styles.activeTabText]}>BATTERY CHARGE</Text>
                <Text style={styles.tabText}>FORECAST</Text>
            </View>

            <Text style={styles.description}>
                Your battery reflects how much energy you have left. We use your sleep and morning heart rate to estimate your charge level in the morning. Activities that raise your heart rate drain your battery. Relaxation practices that keep your heart rate low can replenish it.
            </Text>
        </View>
    );
});

export default BatteryChartDetail;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000000',
        borderRadius: 24,
        padding: 20,
        marginVertical: 10,
        width: SCREEN_WIDTH - 32,
    },
    mainTitle: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    chartWrapper: {
        height: 280,
    },
    sleepHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: CHART_WIDTH * 0.25,
        height: CHART_HEIGHT + 40,
        backgroundColor: '#312e8130',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        padding: 10,
    },
    sleepInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    sleepTime: {
        color: '#818cf8',
        fontSize: 14,
        fontWeight: '600',
    },
    tooltipPos: {
        position: 'absolute',
        top: 40,
        alignItems: 'center',
    },
    tooltipValue: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        opacity: 0.8,
    },
    timeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: CHART_WIDTH,
        marginTop: 10,
    },
    timeText: {
        color: '#ffffff40',
        fontSize: 12,
    },
    tabs: {
        flexDirection: 'row',
        gap: 20,
        marginVertical: 20,
    },
    tabText: {
        color: '#ffffff40',
        fontSize: 13,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    activeTabText: {
        color: '#fbbf24',
    },
    description: {
        color: '#ffffffcc',
        fontSize: 15,
        lineHeight: 22,
    }
});
