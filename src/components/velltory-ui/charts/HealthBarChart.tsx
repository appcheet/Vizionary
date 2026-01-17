import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import {
    Canvas,
    RoundedRect,
    Skia,
    LinearGradient,
    vec,
    Group,
    Line,
    Circle,
    BlurMask,
} from '@shopify/react-native-skia';
import * as d3 from 'd3';
import { generateHealthBarData } from './utils/dataGenerator';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    withTiming,
    useDerivedValue,
    runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 160;

const HealthBarChart = () => {
    const data = useMemo(() => generateHealthBarData(8), []);
    const [selectedRange, setSelectedRange] = React.useState('Weeks');
    const [activeIndex, setActiveIndex] = React.useState(-1);

    const touchX = useSharedValue(0);
    const touchActive = useSharedValue(0);
    const selectedIdx = useSharedValue(-1);

    const xScale = useMemo(() =>
        d3.scaleBand()
            .domain(data.map((_, i) => i.toString()))
            .range([0, CHART_WIDTH])
            .padding(0.3),
        [data]);

    const yScale = useMemo(() =>
        d3.scaleLinear().domain([0, 100]).range([CHART_HEIGHT, 0]),
        []);

    const xPoints = useMemo(() => data.map((_, i) => (xScale(i.toString()) || 0) + xScale.bandwidth() / 2), [data, xScale]);

    const handleTouch = (x: number) => {
        'worklet';
        let closestIndex = -1;
        let minDistance = Infinity;
        xPoints.forEach((px, i) => {
            const dist = Math.abs(px - x);
            if (dist < minDistance && dist < 30) {
                minDistance = dist;
                closestIndex = i;
            }
        });
        touchX.value = closestIndex >= 0 ? xPoints[closestIndex] : x;
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

    const caps = ['Latest', 'Days', 'Weeks', 'Months'];

    return (
        <View style={styles.container}>
            <View style={styles.rangeSelector}>
                {caps.map((range) => (
                    <TouchableOpacity
                        key={range}
                        onPress={() => setSelectedRange(range)}
                        style={[
                            styles.rangeItem,
                            selectedRange === range && styles.activeRangeItem
                        ]}
                    >
                        <Text style={[
                            styles.rangeText,
                            selectedRange === range && styles.activeRangeText
                        ]}>
                            {range}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.mainTitle}>Health</Text>

            <View style={styles.chartWrapper}>
                <GestureDetector gesture={gesture}>
                    <Canvas style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}>
                        <Group>
                            <LinearGradient
                                start={vec(0, 0)}
                                end={vec(0, CHART_HEIGHT)}
                                colors={['#10b98140', '#10b98100']}
                            />
                            <RoundedRect x={0} y={0} width={CHART_WIDTH} height={CHART_HEIGHT / 2} r={0} />
                        </Group>

                        {data.map((d, i) => {
                            const bw = xScale.bandwidth();
                            const bh = CHART_HEIGHT - yScale(d.value);
                            const bx = xScale(i.toString()) || 0;
                            const by = yScale(d.value);
                            const isActive = selectedIdx.value === i && touchActive.value > 0;

                            return (
                                <Group key={i}>
                                    <RoundedRect
                                        x={bx}
                                        y={by}
                                        width={bw}
                                        height={bh}
                                        r={2}
                                        color={d.color}
                                        opacity={isActive ? 1 : 0.8}
                                    />
                                    {isActive && (
                                        <Circle cx={bx + bw / 2} cy={by} r={4} color="#ffffff">
                                            <BlurMask blur={6} style="normal" />
                                        </Circle>
                                    )}
                                </Group>
                            );
                        })}

                        {/* Reference Lines */}
                        <Line p1={vec(0, CHART_HEIGHT)} p2={vec(CHART_WIDTH, CHART_HEIGHT)} color="#ffffff20" strokeWidth={1} />

                        {/* Vertical Grid Lines mimicking Dec/Nov markers */}
                        <Line p1={vec(CHART_WIDTH * 0.25, 100)} p2={vec(CHART_WIDTH * 0.25, CHART_HEIGHT)} color="#ffffff10" strokeWidth={1} />
                        <Line p1={vec(CHART_WIDTH * 0.5, 100)} p2={vec(CHART_WIDTH * 0.5, CHART_HEIGHT)} color="#ffffff10" strokeWidth={1} />
                    </Canvas>
                </GestureDetector>

                {/* Overlaid Labels from Image */}
                <View style={styles.dataLabels}>
                    {data.map((d, i) => {
                        const bx = xScale(i.toString()) || 0;
                        if (i < 4) return null; // Only show last 4 as in image
                        return (
                            <Text key={i} style={[styles.dataLabelText, { left: bx + 2 }]}>
                                {Math.round(d.value)}
                            </Text>
                        );
                    })}
                </View>

                {/* Floating Highlight from Image */}
                <View style={[styles.highlightContainer, { right: 20 }]}>
                    <Text style={styles.dateRange}>6 Dec–12 Dec</Text>
                    <Text style={styles.percentage}>94%</Text>
                </View>

                <View style={styles.xAxis}>
                    <Text style={styles.xAxisLabel}>Sep</Text>
                    <Text style={styles.xAxisLabel}>Oct</Text>
                    <Text style={styles.xAxisLabel}>Nov</Text>
                    <Text style={[styles.xAxisLabel, { color: '#ffffff80' }]}>Dec</Text>
                </View>
            </View>
        </View>
    );
};

export default HealthBarChart;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000000',
        borderRadius: 24,
        padding: 20,
        marginVertical: 10,
        width: SCREEN_WIDTH - 32,
    },
    rangeSelector: {
        flexDirection: 'row',
        backgroundColor: '#1f2937',
        borderRadius: 20,
        padding: 4,
        marginBottom: 30,
    },
    rangeItem: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 16,
    },
    activeRangeItem: {
        backgroundColor: '#4b5563',
    },
    rangeText: {
        color: '#ffffff80',
        fontSize: 13,
        fontWeight: '600',
    },
    activeRangeText: {
        color: '#ffffff',
    },
    mainTitle: {
        color: '#ffffff',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    chartWrapper: {
        marginTop: 40,
        height: 220,
    },
    dataLabels: {
        position: 'absolute',
        top: -20,
        left: 0,
        right: 0,
        height: 20,
    },
    dataLabelText: {
        position: 'absolute',
        color: '#ffffff60',
        fontSize: 11,
        fontWeight: 'bold',
    },
    highlightContainer: {
        position: 'absolute',
        top: -45,
        alignItems: 'flex-end',
    },
    dateRange: {
        color: '#ffffff40',
        fontSize: 12,
    },
    percentage: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    xAxis: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
        paddingHorizontal: 0,
    },
    xAxisLabel: {
        color: '#ffffff20',
        fontSize: 12,
        fontWeight: '600',
    }
});
