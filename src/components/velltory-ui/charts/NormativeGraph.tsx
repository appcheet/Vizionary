import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Path, Skia, LinearGradient, vec, Group, Line, DashPathEffect, Circle, BlurMask } from '@shopify/react-native-skia';
import * as d3 from 'd3';
import { generateNormativeData } from './utils/dataGenerator';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    withTiming,
    useDerivedValue,
} from 'react-native-reanimated';

import { ChevronRight, Info } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 120;

interface NormativeGraphProps {
    title?: string;
    data?: number[];
    labels?: string[];
}

const NormativeGraph = ({
    title = "Moved",
    data: initialData,
    labels = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']
}: NormativeGraphProps) => {
    const data = useMemo(() => initialData || generateNormativeData(7), [initialData]);
    const normMax = 80;
    const normMin = 50;

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
    const normMaxY = useMemo(() => yScale(normMax), [yScale]);
    const normMinY = useMemo(() => yScale(normMin), [yScale]);

    const linePath = useMemo(() => {
        const lineGenerator = d3.line<number>()
            .x((_, i) => xScale(i))
            .y((d) => yScale(d))
            .curve(d3.curveMonotoneX);
        return Skia.Path.MakeFromSVGString(lineGenerator(data) || '')!;
    }, [xScale, yScale]);

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

    const activeY = useDerivedValue(() => {
        const idx = Math.round((touchX.value / CHART_WIDTH) * (data.length - 1));
        return yPoints[idx] || 0;
    });

    const clipRect = useDerivedValue(() => Skia.XYWHRect(0, 0, CHART_WIDTH * entryProgress.value, CHART_HEIGHT));
    const touchX1vec = useDerivedValue(() => vec(touchX.value, 0));
    const touchX2vec = useDerivedValue(() => vec(touchX.value, CHART_HEIGHT));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.userBadge}>
                    <Text style={styles.badgeEmoji}>🧔🏿‍♂️</Text>
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subTitle}>2 h 12 m — 4 h 47 m</Text>
                    <Text style={styles.mainValue}>2 h 53 min</Text>
                </View>
                <ChevronRight size={18} color="#64748b" />
            </View>

            <View style={styles.chartWrapper}>
                <GestureDetector gesture={gesture}>
                    <Canvas style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}>
                        <Group clip={clipRect}>
                            {/* Normative Band */}
                            <Line
                                p1={vec(0, normMaxY)}
                                p2={vec(CHART_WIDTH, normMaxY)}
                                color="#bef26440"
                                strokeWidth={1}
                            >
                                <DashPathEffect intervals={[5, 5]} />
                            </Line>
                            <Line
                                p1={vec(0, normMinY)}
                                p2={vec(CHART_WIDTH, normMinY)}
                                color="#bef26440"
                                strokeWidth={1}
                            >
                                <DashPathEffect intervals={[5, 5]} />
                            </Line>

                            <Path
                                path={linePath}
                                style="stroke"
                                strokeWidth={2}
                                color="#ffffff"
                            />

                            {/* Interactive Tooltip */}
                            <Group opacity={touchActive}>
                                <Line
                                    p1={touchX1vec}
                                    p2={touchX2vec}
                                    color="#ffffff30"
                                    strokeWidth={1}
                                />
                                <Circle cx={touchX} cy={activeY} r={6} color="#ffffff">
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

            <View style={styles.footer}>
                <View style={styles.rangeBadge}>
                    <Text style={styles.rangeText}>within normal limits</Text>
                    <Text style={styles.rangeValue}>3 h — 4 h</Text>
                </View>
            </View>
        </View>
    );
};

export default NormativeGraph;

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
        marginBottom: 20,
    },
    userBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ffffff10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    badgeEmoji: {
        fontSize: 24,
    },
    headerText: {
        flex: 1,
    },
    title: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subTitle: {
        color: '#64748b',
        fontSize: 14,
    },
    mainValue: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 4,
    },
    chartWrapper: {
        marginTop: 20,
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
    rangeBadge: {
        backgroundColor: '#bef26415',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#bef26430',
    },
    rangeText: {
        color: '#bef264',
        fontSize: 14,
    },
    rangeValue: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
});
