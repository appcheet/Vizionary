import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import {
    Canvas,
    Path,
    Skia,
    useFont,
    Text as SkiaText,
    Group,
    vec,
    Line,
    Circle,
    RoundedRect,
    LinearGradient,
    BlurMask
} from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    withTiming,
    useDerivedValue,
} from 'react-native-reanimated';
import * as d3 from 'd3';
import WelltoryCard from './components/WelltoryCard';
import { generateCorrelationData } from './utils/dataGenerator';
import { Heart, Share2, MoreHorizontal, Info } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 72;
const CHART_HEIGHT = 250; // Increased to prevent clipping
const PADDING = { top: 60, right: 10, bottom: 40, left: 10 };

const FONT_PATH = require('../../../assets/fonts/SFProDisplayRegular.ttf');

interface CorrelationChartProps {
    title?: string;
    data?: { day: string; workTime: number; sdnn: number; isBad?: boolean }[];
}

const CorrelationChart = ({
    title = "Work time vs HRV",
    data: initialData
}: CorrelationChartProps) => {
    const data = useMemo(() => initialData || [
        { day: 'Mon', workTime: 8, sdnn: 45 },
        { day: 'Tue', workTime: 9, sdnn: 38, isBad: true },
        { day: 'Wed', workTime: 7.5, sdnn: 50 },
        { day: 'Thu', workTime: 10, sdnn: 32, isBad: true },
        { day: 'Fri', workTime: 8.5, sdnn: 42 },
        { day: 'Sat', workTime: 4, sdnn: 65 },
        { day: 'Sun', workTime: 2, sdnn: 70 },
    ], [initialData]);

    const touchX = useSharedValue(0);
    const touchActive = useSharedValue(0);
    const selectedIndex = useSharedValue(data.length - 1);

    const font = useFont(FONT_PATH, 11);
    const valueFont = useFont(FONT_PATH, 24);

    const xScale = useMemo(() =>
        d3.scalePoint()
            .domain(data.map((d) => d.day))
            .range([PADDING.left, CHART_WIDTH - PADDING.right]),
        [data]
    );

    const yScaleWork = useMemo(() =>
        d3.scaleLinear()
            .domain([0, 12])
            .range([CHART_HEIGHT - PADDING.bottom, PADDING.top]),
        []
    );

    const yScaleSdnn = useMemo(() =>
        d3.scaleLinear()
            .domain([0, 80])
            .range([CHART_HEIGHT - PADDING.bottom, PADDING.top]),
        []
    );

    const xPoints = useMemo(() => data.map((d) => xScale(d.day) || 0), [xScale, data]);
    const sdnnYPoints = useMemo(() => data.map(d => yScaleSdnn(d.sdnn)), [yScaleSdnn, data]);

    const linePath = useMemo(() => {
        const lineGenerator = d3.line<any>()
            .x((d) => xScale(d.day) || 0)
            .y((d) => yScaleSdnn(d.sdnn))
            .curve(d3.curveMonotoneX)(data);
        const pathStr = lineGenerator || '';
        return Skia.Path.MakeFromSVGString(pathStr) || Skia.Path.Make();
    }, [xScale, yScaleSdnn, data]);

    const handleTouch = (x: number, isInitial = false) => {
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

    const highlightP1 = useDerivedValue(() => vec(touchX.value, PADDING.top - 20));
    const highlightP2 = useDerivedValue(() => vec(touchX.value, CHART_HEIGHT - PADDING.bottom));
    const activeSdnnY = useDerivedValue(() => sdnnYPoints[selectedIndex.value] || 0);
    const tooltipTransform = useDerivedValue(() => [
        { translateX: touchX.value - 60 },
        { translateY: 15 }
    ]);

    if (!font || !valueFont) return null;

    return (
        <WelltoryCard title={title} headerRight={<Info size={18} color="#64748b" />}>
            <View style={styles.correlationHeader}>
                <View style={styles.correlationBarContainer}>
                    <Text style={styles.correlationLabel}>LAGGED CORRELATION</Text>
                    <View style={styles.correlationBarBg}>
                        <View style={[styles.correlationBar, { width: '73%' }]} />
                    </View>
                </View>
                <Text style={styles.correlationValue}>-73%</Text>
            </View>

            <GestureDetector gesture={gesture}>
                <Canvas style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}>
                    {/* SDNN Reference Lines */}
                    <Line p1={vec(0, yScaleSdnn(30))} p2={vec(CHART_WIDTH, yScaleSdnn(30))} color="#ffffff08" strokeWidth={1} />
                    <Line p1={vec(0, yScaleSdnn(60))} p2={vec(CHART_WIDTH, yScaleSdnn(60))} color="#ffffff08" strokeWidth={1} />

                    {/* Work Time Bars */}
                    {data.map((d, i) => {
                        const bx = xScale(d.day) || 0;
                        const barTop = yScaleWork(d.workTime);
                        const barHeight = CHART_HEIGHT - PADDING.bottom - barTop;
                        return (
                            <RoundedRect
                                key={i}
                                x={bx - 4}
                                y={barTop}
                                width={8}
                                height={Math.max(barHeight, 4)}
                                r={4}
                                color={d.isBad ? '#f87171' : '#2dd4bf'}
                            />
                        );
                    })}

                    {/* SDNN Line */}
                    <Path path={linePath} style="stroke" strokeWidth={3} color="#ffffffcc" />
                    {data.map((d, i) => (
                        <Circle
                            key={i}
                            cx={xScale(d.day) || 0}
                            cy={yScaleSdnn(d.sdnn)}
                            r={4}
                            color="#1a1a2e"
                        />
                    ))}
                    {data.map((d, i) => (
                        <Circle
                            key={`dot-${i}`}
                            cx={xScale(d.day) || 0}
                            cy={yScaleSdnn(d.sdnn)}
                            r={2.5}
                            color="#ffffff"
                        />
                    ))}

                    {/* Interactive Tooltip */}
                    <Group opacity={touchActive}>
                        <Line
                            p1={highlightP1}
                            p2={highlightP2}
                            color="#ffffff20"
                            strokeWidth={1}
                        />
                        {/* Tooltip Badges */}
                        <Group transform={tooltipTransform}>
                            <RoundedRect x={0} y={0} width={75} height={25} r={6} color="#2dd4bf" />
                            <RoundedRect x={78} y={0} width={45} height={25} r={6} color="#334155" />
                        </Group>

                        <Circle cx={touchX} cy={activeSdnnY} r={4} color="#ffffff">
                            <BlurMask blur={8} style="normal" />
                        </Circle>
                    </Group>

                    {/* X-Axis Labels */}
                    {data.map((d, i) => (
                        <SkiaText
                            key={`label-${i}`}
                            x={(xScale(d.day) || 0) - 10}
                            y={CHART_HEIGHT - 5}
                            text={d.day}
                            font={font}
                            color="#4b5563"
                        />
                    ))}
                </Canvas>
            </GestureDetector>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: '#2dd4bf' }]} />
                    <Text style={styles.legendText}>WORK TIME</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: '#ffffff' }]} />
                    <Text style={styles.legendText}>SDNN</Text>
                </View>
            </View>

            <View style={styles.averagesRow}>
                <View style={styles.averageBox}>
                    <Text style={styles.avgLabel}>AVERAGE</Text>
                    <View style={styles.avgValRow}>
                        <Text style={styles.avgValue}>5 hrs, 48 min</Text>
                        <Text style={styles.changeText}>↑ 13%</Text>
                    </View>
                </View>
                <View style={styles.averageBox}>
                    <Text style={styles.avgLabel}>AVERAGE</Text>
                    <View style={styles.avgValRow}>
                        <Text style={styles.avgValue}>45 ms</Text>
                        <Text style={[styles.changeText, { color: '#10b981' }]}>↑ 1%</Text>
                    </View>
                </View>
            </View>

            <View style={styles.adviceContainer}>
                <Text style={styles.adviceText}>
                    Shows how much worktime you had based solely on your work hours, not all screen time. For a more accurate result, our calculation spans from 3 am to 2:59 am the next day.
                </Text>
            </View>
        </WelltoryCard>
    );
};

export default CorrelationChart;

const styles = StyleSheet.create({
    correlationHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    correlationBarContainer: {
        flex: 1,
        marginRight: 10,
    },
    correlationLabel: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    correlationBarBg: {
        height: 2,
        backgroundColor: '#ffffff08',
        width: '100%',
    },
    correlationBar: {
        height: 2,
        backgroundColor: '#10b981',
    },
    correlationValue: {
        color: '#64748b',
        fontSize: 14,
    },
    legend: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    legendText: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: 'bold',
    },
    averagesRow: {
        flexDirection: 'row',
        marginTop: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#ffffff08',
        gap: 40,
    },
    averageBox: {
        flex: 1,
    },
    avgLabel: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    avgValRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    avgValue: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
    },
    changeText: {
        color: '#64748b',
        fontSize: 14,
    },
    adviceContainer: {
        backgroundColor: '#2a2a3e30',
        padding: 16,
        borderRadius: 16,
        marginTop: 24,
    },
    adviceText: {
        color: '#94a3b8',
        fontSize: 14,
        lineHeight: 22,
    },
});
