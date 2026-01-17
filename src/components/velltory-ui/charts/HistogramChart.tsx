import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, DimensionValue } from 'react-native';
import { Canvas, RoundedRect, Skia, BlurMask, Group } from '@shopify/react-native-skia';
import * as d3 from 'd3';
import { generateHistogramData } from './utils/dataGenerator';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    withTiming,
    useDerivedValue,
    useAnimatedStyle,
    useAnimatedReaction,
    runOnJS,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 120;

interface HistogramDataPoint {
    value: number;
    isHighlight?: boolean;
}

interface HistogramChartProps {
    titlePrefix?: string;
    highlightPercent?: string;
    titleSuffix?: string;
    data?: HistogramDataPoint[];
    userValue?: string;
    avgValue?: string;
    userPercent?: DimensionValue;
    avgPercent?: DimensionValue;
}

const HistogramChart = ({
    titlePrefix = "Cycling duration more than ",
    highlightPercent = "65%",
    titleSuffix = " of men your age",
    data: initialData,
    userValue = "3 h 53 min",
    avgValue = "2 h 16 min",
    userPercent = "80%",
    avgPercent = "50%",
}: HistogramChartProps) => {
    const dataSize = 40;
    const data = useMemo(() => initialData || generateHistogramData(40), [initialData]);

    const xScale = useMemo(() =>
        d3.scaleBand()
            .domain(data.map((_, i) => i.toString()))
            .range([0, CHART_WIDTH])
            .padding(0.3),
        [data]);

    const yScale = useMemo(() =>
        d3.scaleLinear().domain([0, 100]).range([CHART_HEIGHT, 0]),
        []);

    const barWidth = xScale.bandwidth();
    const xPoints = useMemo(() => data.map((_, i) => (xScale(i.toString()) || 0) + barWidth / 2), [xScale, data, barWidth]);
    const yPoints = useMemo(() => data.map((d: HistogramDataPoint) => yScale(d.value)), [yScale, data]);

    const touchX = useSharedValue(xPoints[30]);
    const touchActive = useSharedValue(0);
    const selectedIdx = useSharedValue(30);

    const [activeIndex, setActiveIndex] = React.useState(30);

    useAnimatedReaction(
        () => selectedIdx.value,
        (idx) => {
            runOnJS(setActiveIndex)(idx);
        }
    );

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

    const markerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: touchX.value }],
    }));

    const activeBarColor = '#bef264';
    const inactiveBarColor = '#ffffff20';

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{titlePrefix}<Text style={styles.highlightText}>{highlightPercent}</Text>{titleSuffix}</Text>

            <View style={styles.chartWrapper}>
                <GestureDetector gesture={gesture}>
                    <Canvas style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}>
                        {data.map((d, i) => {
                            const by = yScale(d.value);
                            return (
                                <BarComponent
                                    key={i}
                                    index={i}
                                    x={xScale(i.toString()) || 0}
                                    y={by}
                                    width={barWidth}
                                    height={CHART_HEIGHT - by}
                                    selectedIdx={selectedIdx}
                                />
                            );
                        })}
                    </Canvas>
                </GestureDetector>

                {/* Floating User Marker */}
                <Animated.View style={[styles.marker, markerStyle]}>
                    <Text style={styles.markerValue}>{activeIndex === 30 ? userValue : `${Math.round(data[activeIndex].value / 20)} h ${Math.round((data[activeIndex].value % 20) * 3)} min`}</Text>
                    <Text style={styles.markerLabel}>{activeIndex === 30 ? 'you' : 'others'}</Text>
                    <View style={styles.markerLine} />
                    <View style={[styles.avatar, activeIndex !== 30 && { borderColor: '#ffffff40' }]}>
                        <Text style={styles.avatarEmoji}>{activeIndex === 30 ? '🧔🏿‍♂️' : '👤'}</Text>
                    </View>
                </Animated.View>

                <View style={styles.labels}>
                    <Text style={styles.label}>0h</Text>
                    <Text style={styles.label}>1</Text>
                    <Text style={styles.label}>2</Text>
                    <Text style={styles.label}>3</Text>
                    <Text style={styles.label}>4</Text>
                    <Text style={styles.label}>5h</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.footerRow}>
                    <View style={[styles.dot, { backgroundColor: '#bef264' }]} />
                    <Text style={styles.footerText}>you in March</Text>
                    <Text style={styles.footerValue}>{userValue}</Text>
                </View>
                <View style={styles.progressBack}>
                    <View style={[styles.progressFront, { width: userPercent }]} />
                </View>
                <View style={styles.footerRow}>
                    <View style={[styles.dot, { backgroundColor: '#4b5563' }]} />
                    <Text style={styles.footerText}>average men your age</Text>
                    <Text style={styles.footerValue}>{avgValue}</Text>
                </View>
                <View style={[styles.progressBack, { height: 4, width: avgPercent }]} />
            </View>
        </View>
    );
};

export default HistogramChart;

const BarComponent = ({ index, x, y, width, height, selectedIdx }: { index: number; x: number; y: number; width: number; height: number; selectedIdx: Animated.SharedValue<number> }) => {
    const color = useDerivedValue(() => {
        return selectedIdx.value === index ? '#bef264' : '#ffffff20';
    });
    return (
        <RoundedRect
            x={x}
            y={y}
            width={width}
            height={height}
            r={1}
            color={color}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1a1a2e',
        borderRadius: 24,
        padding: 20,
        marginVertical: 10,
        width: SCREEN_WIDTH - 32,
    },
    title: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        lineHeight: 24,
    },
    highlightText: {
        backgroundColor: '#bef264',
        color: '#000000',
    },
    chartWrapper: {
        marginVertical: 20,
        height: 180,
    },
    marker: {
        position: 'absolute',
        top: -40,
        alignItems: 'center',
        marginLeft: -40,
        width: 100,
    },
    markerValue: {
        color: '#bef264',
        fontSize: 12,
        fontWeight: 'bold',
    },
    markerLabel: {
        color: '#ffffff80',
        fontSize: 10,
    },
    markerLine: {
        width: 1,
        height: 40,
        backgroundColor: '#bef26480',
        marginVertical: 4,
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#bef264',
        backgroundColor: '#1a1a2e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarEmoji: {
        fontSize: 16,
    },
    labels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    label: {
        color: '#4b5563',
        fontSize: 10,
    },
    footer: {
        marginTop: 20,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    footerText: {
        color: '#ffffff80',
        fontSize: 14,
        flex: 1,
    },
    footerValue: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    progressBack: {
        height: 2,
        backgroundColor: '#ffffff10',
        width: '100%',
        marginBottom: 12,
        borderRadius: 1,
    },
    progressFront: {
        height: 2,
        backgroundColor: '#bef264',
        borderRadius: 1,
    },
});
