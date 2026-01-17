import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Path, Skia, LinearGradient, vec, Group, Line, BlurMask, Circle, Text as SkiaText } from '@shopify/react-native-skia';
import * as d3 from 'd3';
import { generateNormativeData } from './utils/dataGenerator';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    withTiming,
    useDerivedValue,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';

import { ChevronRight, Info, Zap } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 100;

interface SmoothAreaChartProps {
    title?: string;
    label?: string;
    data?: number[];
    labels?: string[];
}

const SmoothAreaChart = ({
    title = "Cycling",
    label = "Long duration",
    data: initialData,
    labels = ['0h', '1', '2', '3+']
}: SmoothAreaChartProps) => {
    const data = useMemo(() => initialData || generateNormativeData(7), [initialData]);
    const touchX = useSharedValue(0);
    const touchActive = useSharedValue(0);
    const entryProgress = useSharedValue(0);

    React.useEffect(() => {
        entryProgress.value = withTiming(1, { duration: 1000 });
    }, []);

    const xScale = useMemo(() =>
        d3.scaleLinear().domain([0, data.length - 1]).range([0, CHART_WIDTH]),
        [data]);
    const yScale = useMemo(() =>
        d3.scaleLinear().domain([0, 100]).range([CHART_HEIGHT, 0]),
        []);

    const xPoints = useMemo(() => data.map((_, i) => xScale(i)), [xScale, data]);
    const yPoints = useMemo(() => data.map((d) => yScale(d)), [yScale, data]);

    const areaPath = useMemo(() => {
        const areaGenerator = d3.area<number>()
            .x((_, i) => xScale(i))
            .y0(CHART_HEIGHT)
            .y1((d) => yScale(d))
            .curve(d3.curveBasis);
        const pathStr = areaGenerator(data) || '';
        return Skia.Path.MakeFromSVGString(pathStr) || Skia.Path.Make();
    }, [xScale, yScale, data]);

    const linePath = useMemo(() => {
        const lineGenerator = d3.line<number>()
            .x((_, i) => xScale(i))
            .y((d) => yScale(d))
            .curve(d3.curveBasis);
        const pathStr = lineGenerator(data) || '';
        return Skia.Path.MakeFromSVGString(pathStr) || Skia.Path.Make();
    }, [xScale, yScale, data]);

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

    const activeValue = useDerivedValue(() => {
        const idx = Math.round(interpolate(touchX.value, [0, CHART_WIDTH], [0, data.length - 1], Extrapolate.CLAMP));
        return data[idx] || 0;
    });

    const activeY = useDerivedValue(() => {
        const idx = Math.round(interpolate(touchX.value, [0, CHART_WIDTH], [0, data.length - 1], Extrapolate.CLAMP));
        return yPoints[idx] || 0;
    });

    const clipRect = useDerivedValue(() => Skia.XYWHRect(0, 0, CHART_WIDTH * entryProgress.value, CHART_HEIGHT));
    const touchX1vec = useDerivedValue(() => vec(touchX.value, 0));
    const touchX2vec = useDerivedValue(() => vec(touchX.value, CHART_HEIGHT));
    const normLineX = useMemo(() => CHART_WIDTH * 0.8, []);
    const normLineY = useMemo(() => yScale(70), [yScale]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <ChevronRight size={18} color="#64748b" />
            </View>
            <Text style={styles.subtext}>{label}</Text>

            <View style={styles.chartWrapper}>
                <GestureDetector gesture={gesture}>
                    <Canvas style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}>
                        <Group clip={clipRect}>
                            <Path path={areaPath}>
                                <LinearGradient
                                    start={vec(0, 0)}
                                    end={vec(0, CHART_HEIGHT)}
                                    colors={['#bef26440', '#bef26400']}
                                />
                            </Path>
                            <Path
                                path={linePath}
                                style="stroke"
                                strokeWidth={3}
                                color="#bef264"
                            />

                            {/* Norm line */}
                            <Group>
                                <Line p1={vec(normLineX, 0)} p2={vec(normLineX, CHART_HEIGHT)} color="#ffffff20" strokeWidth={1} />
                                <Line p1={vec(normLineX, normLineY)} p2={vec(normLineX, CHART_HEIGHT)} color="#bef264" strokeWidth={2} />
                            </Group>

                            {/* Interactive Tooltip */}
                            <Group opacity={touchActive}>
                                <Line
                                    p1={touchX1vec}
                                    p2={touchX2vec}
                                    color="#ffffff30"
                                    strokeWidth={1}
                                />
                                <Circle cx={touchX} cy={activeY} r={6} color="#bef264">
                                    <BlurMask blur={8} style="normal" />
                                </Circle>
                                <Circle cx={touchX} cy={activeY} r={3} color="#ffffff" />
                            </Group>
                        </Group>
                    </Canvas>
                </GestureDetector>
                <View style={styles.labels}>
                    {labels.map((lbl, idx) => (
                        <Text key={idx} style={styles.label}>{lbl}</Text>
                    ))}
                </View>
            </View>
        </View>
    );
};

export default SmoothAreaChart;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1a1a2e',
        borderRadius: 24,
        padding: 20,
        marginVertical: 10,
        width: SCREEN_WIDTH - 32,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    increase: {
        color: '#10b981',
        fontSize: 16,
        fontWeight: '600',
    },
    subtext: {
        color: '#10b981',
        fontSize: 12,
        opacity: 0.8,
        marginTop: 4,
        marginBottom: 20,
    },
    chartWrapper: {
        marginTop: 10,
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
});
