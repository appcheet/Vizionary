import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import {
    Canvas,
    Path,
    Skia,
    LinearGradient,
    vec,
    Group,
    Line,
    Circle,
    BlurMask,
    Text as SkiaText,
    useFont,
} from '@shopify/react-native-skia';
import * as d3 from 'd3';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    withTiming,
    useDerivedValue,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { Activity, ChevronRight } from 'lucide-react-native';
import { generateFullDayHRData } from './utils/dataGenerator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;
const CHART_HEIGHT = 200;

const FONT_PATH = require('../../../assets/fonts/SFProDisplayRegular.ttf');

interface FullDayHRChartProps {
    title?: string;
    subtitle?: string;
    data?: { bpm: number; hour: number }[];
}

const FullDayHeartRateChart = ({
    title = "Great job today - keep that energy going!",
    subtitle = "Running",
    data: initialData,
}: FullDayHRChartProps) => {
    const data = useMemo(() => initialData || generateFullDayHRData(1000), [initialData]);
    const font = useFont(FONT_PATH, 12);
    const labelFont = useFont(FONT_PATH, 10);

    const touchX = useSharedValue(0);
    const touchActive = useSharedValue(0);

    const xScale = useMemo(() =>
        d3.scaleLinear().domain([0, 23.99]).range([10, CHART_WIDTH - 10]),
        []);

    const yScale = useMemo(() =>
        d3.scaleLinear().domain([40, 200]).range([CHART_HEIGHT - 40, 20]),
        []);

    const xPoints = useMemo(() => data.map((d: any) => xScale(d.hour)), [xScale, data]);
    const yPoints = useMemo(() => data.map((d: any) => yScale(d.bpm)), [yScale, data]);

    const linePath = useMemo(() => {
        const lineGenerator = d3.line<any>()
            .x((d) => xScale(d.hour))
            .y((d) => yScale(d.bpm))
            .curve(d3.curveStepAfter)(data);
        return Skia.Path.MakeFromSVGString(lineGenerator || '') || Skia.Path.Make();
    }, [xScale, yScale, data]);

    const areaPath = useMemo(() => {
        const areaGenerator = d3.area<any>()
            .x((d) => xScale(d.hour))
            .y0(CHART_HEIGHT - 40)
            .y1((d) => yScale(d.bpm))
            .curve(d3.curveStepAfter)(data);
        return Skia.Path.MakeFromSVGString(areaGenerator || '') || Skia.Path.Make();
    }, [xScale, yScale, data]);

    const handleTouch = (x: number) => {
        'worklet';
        let closestIndex = 0;
        let minDistance = Infinity;
        xPoints.forEach((px: number, i: number) => {
            const dist = Math.abs(px - x);
            if (dist < minDistance) {
                minDistance = dist;
                closestIndex = i;
            }
        });
        touchX.value = xPoints[closestIndex];
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

    const activeBpm = useDerivedValue(() => {
        const idx = Math.round(interpolate(touchX.value, [10, CHART_WIDTH - 10], [0, data.length - 1], Extrapolate.CLAMP));
        const bpmVal = data[idx]?.bpm;
        return bpmVal !== undefined ? Math.round(bpmVal) : 60;
    });

    const activeY = useDerivedValue(() => {
        const idx = Math.round(interpolate(touchX.value, [10, CHART_WIDTH - 10], [0, data.length - 1], Extrapolate.CLAMP));
        return yPoints[idx] || 0;
    });

    const activeTime = useDerivedValue(() => {
        const idx = Math.round(interpolate(touchX.value, [10, CHART_WIDTH - 10], [0, data.length - 1], Extrapolate.CLAMP));
        const hour = data[idx]?.hour || 0;
        const h = Math.floor(hour);
        const m = Math.floor((hour - h) * 60);
        return `${h}:${m < 10 ? '0' + m : m}`;
    });

    const touchX1vec = useDerivedValue(() => vec(touchX.value, 10));
    const touchX2vec = useDerivedValue(() => vec(touchX.value, CHART_HEIGHT - 40));
    const activePointVec = useDerivedValue(() => vec(touchX.value, activeY.value));
    const tooltipText = useDerivedValue(() => `${activeBpm.value} BPM • ${activeTime.value}`);
    const tooltipTransform = useDerivedValue(() => [
        { translateX: touchX.value + 10 },
        { translateY: activeY.value - 10 }
    ]);

    if (!font || !labelFont) return null; // Added safety guard

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Activity size={20} color="#bef264" />
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>
                <Text style={styles.title}>{title}</Text>
            </View>

            <View style={styles.chartWrapper}>
                <GestureDetector gesture={gesture}>
                    <Canvas style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}>
                        {/* Area Gradient */}
                        <Path path={areaPath}>
                            <LinearGradient
                                start={vec(0, 20)}
                                end={vec(0, CHART_HEIGHT - 40)}
                                colors={['#ef444430', '#f9731620', '#fbbf2415', '#bef26410', '#3b82f605']}
                                positions={[0, 0.2, 0.4, 0.6, 1]}
                            />
                        </Path>

                        {/* Multi-color Line */}
                        <Path
                            path={linePath}
                            style="stroke"
                            strokeWidth={2}
                        >
                            <LinearGradient
                                start={vec(0, 20)}
                                end={vec(0, CHART_HEIGHT - 40)}
                                colors={['#ef4444', '#f97316', '#fbbf24', '#bef264', '#3b82f6']}
                                positions={[0, 0.2, 0.4, 0.6, 1]}
                            />
                        </Path>

                        {/* Y-Axis Labels */}
                        <SkiaText x={5} y={yScale(180)} text="180" font={labelFont} color="#ffffff60" />
                        <SkiaText x={5} y={yScale(70)} text="70" font={labelFont} color="#ffffff60" />

                        {/* Interactivity */}
                        <Group opacity={touchActive}>
                            <Line
                                p1={touchX1vec}
                                p2={touchX2vec}
                                color="#ffffff30"
                                strokeWidth={1}
                            />
                            <Circle c={activePointVec} r={6} color="#ffffff">
                                <BlurMask blur={8} style="normal" />
                            </Circle>
                            <Circle c={activePointVec} r={3} color="#ffffff" />

                            {/* Animated Tooltip Text */}
                            <Group transform={tooltipTransform}>
                                <SkiaText x={0} y={0} text={tooltipText} font={font} color="#ffffff" />
                            </Group>
                        </Group>

                        {/* X-Axis labels */}
                        <SkiaText x={10} y={CHART_HEIGHT - 10} text="12 AM" font={labelFont} color="#ffffff40" />
                        <SkiaText x={CHART_WIDTH / 2 - 15} y={CHART_HEIGHT - 10} text="12 PM" font={labelFont} color="#ffffff40" />
                        <SkiaText x={CHART_WIDTH - 40} y={CHART_HEIGHT - 10} text="11 PM" font={labelFont} color="#ffffff40" />
                    </Canvas>
                </GestureDetector>
            </View>
        </View>
    );
};

// Helper removed in favor of direct import
export default FullDayHeartRateChart;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1a1a2e',
        borderRadius: 24,
        padding: 20,
        marginVertical: 10,
        width: SCREEN_WIDTH - 32,
    },
    header: {
        marginBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    subtitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
    title: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 4,
        lineHeight: 32,
    },
    chartWrapper: {
        marginTop: 10,
        height: CHART_HEIGHT,
    },
});
