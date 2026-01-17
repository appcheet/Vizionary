import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, DimensionValue } from 'react-native';
import {
    Canvas,
    Path,
    Skia,
    useFont,
    vec,
    Line,
    Group,
    Circle,
    BlurMask,
} from '@shopify/react-native-skia';
import * as d3 from 'd3';
import { generateRandomSleepData, generateWorkoutData } from './utils/dataGenerator';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    withTiming,
    useDerivedValue,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import WelltoryCard from './components/WelltoryCard';
import { Moon, Info } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH * 0.55;
const CHART_HEIGHT = 120;

const FONT_PATH = require('../../../assets/fonts/SFProDisplayRegular.ttf');

interface SleepStage {
    label: string;
    value: number;
    color: string;
}

interface SleepAnalysisProps {
    title?: string;
    subtitle?: string;
    time?: string;
    sleepData?: {
        stages: SleepStage[];
        asleep: number;
        wakeUps: number;
        minHR: number;
    };
    hrData?: { bpm: number }[];
}

const SleepAnalysisCard = ({
    title = "Nighttime lulla-cries: you didn't sleep well",
    subtitle = "Sleep analysis",
    time = "9:19 AM",
    sleepData: initialSleepData,
    hrData: initialHrData,
}: SleepAnalysisProps) => {
    const sleepData = useMemo(() => initialSleepData || generateRandomSleepData(), [initialSleepData]);

    const hrData = useMemo(() => initialHrData || generateWorkoutData(15), [initialHrData]);

    const touchX = useSharedValue(0);
    const touchActive = useSharedValue(0);
    const entryProgress = useSharedValue(0);

    React.useEffect(() => {
        entryProgress.value = withTiming(1, { duration: 1000 });
    }, []);

    const font = useFont(FONT_PATH, 12);
    const valueFont = useFont(FONT_PATH, 14);

    const xScale = useMemo(() =>
        d3.scaleLinear().domain([0, hrData.length - 1]).range([0, CHART_WIDTH]),
        [hrData.length]);

    const yScale = useMemo(() =>
        d3.scaleLinear().domain([40, 90]).range([CHART_HEIGHT, 0]),
        []);

    const xPoints = useMemo(() => hrData.map((_, i) => xScale(i)), [xScale, hrData]);
    const yPoints = useMemo(() => hrData.map((d) => yScale(d.bpm)), [yScale, hrData]);
    const grid60Y = useMemo(() => yScale(60), [yScale]);
    const grid80Y = useMemo(() => yScale(80), [yScale]);

    const linePath = useMemo(() => {
        const lineGenerator = d3.line<any>()
            .x((_, i) => xScale(i))
            .y((d) => yScale(d.bpm))
            .curve(d3.curveMonotoneX)(hrData);
        return Skia.Path.MakeFromSVGString(lineGenerator || '') || Skia.Path.Make();
    }, [xScale, yScale, hrData]);

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

    const activeBpm = useDerivedValue(() => {
        const idx = Math.round(interpolate(touchX.value, [0, CHART_WIDTH], [0, hrData.length - 1], Extrapolate.CLAMP));
        return hrData[idx]?.bpm || 40;
    });

    const activeY = useDerivedValue(() => {
        const idx = Math.round(interpolate(touchX.value, [0, CHART_WIDTH], [0, hrData.length - 1], Extrapolate.CLAMP));
        return yPoints[idx] || 0;
    });

    const clipRect = useDerivedValue(() => Skia.XYWHRect(0, 0, CHART_WIDTH * entryProgress.value, CHART_HEIGHT));
    const touchX1vec = useDerivedValue(() => vec(touchX.value, 0));
    const touchX2vec = useDerivedValue(() => vec(touchX.value, CHART_HEIGHT));

    if (!font || !valueFont) return null;

    return (
        <WelltoryCard title={title} subtitle={subtitle} headerRight={time}>
            <View style={styles.headerRow}>
                <View style={styles.avatar}>
                    <Moon size={20} color="#3b82f6" />
                </View>
                <Info size={18} color="#64748b" />
            </View>

            <View style={styles.mainContent}>
                <View style={styles.chartCol}>
                    <GestureDetector gesture={gesture}>
                        <Canvas style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}>
                            <Group clip={clipRect}>
                                <Line p1={vec(0, grid60Y)} p2={vec(CHART_WIDTH, grid60Y)} color="#ffffff08" strokeWidth={1} />
                                <Line p1={vec(0, grid80Y)} p2={vec(CHART_WIDTH, grid80Y)} color="#ffffff08" strokeWidth={1} />

                                <Path
                                    path={linePath}
                                    style="stroke"
                                    strokeWidth={2}
                                    color="#3b82f6"
                                />

                                <Group opacity={touchActive}>
                                    <Line
                                        p1={touchX1vec}
                                        p2={touchX2vec}
                                        color="#ffffff30"
                                        strokeWidth={1}
                                    />
                                    <Circle cx={touchX} cy={activeY} r={6} color="#3b82f6">
                                        <BlurMask blur={8} style="normal" />
                                    </Circle>
                                    <Circle cx={touchX} cy={activeY} r={3} color="#ffffff" />
                                </Group>
                            </Group>
                        </Canvas>
                    </GestureDetector>
                    <View style={styles.chartXLabels}>
                        <Text style={styles.xLabel}>03:01</Text>
                        <Text style={styles.xLabel}>09:16</Text>
                    </View>
                </View>

                <View style={styles.stagesCol}>
                    {sleepData.stages.map((stage, i) => (
                        <View key={i} style={styles.stageItem}>
                            <View style={styles.stageHeader}>
                                <Text style={[styles.stageLabel, { color: stage.color }]}>{stage.label}</Text>
                                <Text style={styles.stageValue}>{stage.value} min</Text>
                            </View>
                            <View style={styles.stageBarBg}>
                                <View style={[styles.stageBar, { backgroundColor: stage.color, width: `${(stage.value / 300) * 100}%` as DimensionValue }]} />
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.metricsRow}>
                <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Asleep/In Bed</Text>
                    <Text style={styles.metricVal}>{sleepData.asleep}%</Text>
                </View>
                <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Wake-ups</Text>
                    <Text style={styles.metricVal}>{sleepData.wakeUps}</Text>
                </View>
                <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Min Heart Rate</Text>
                    <Text style={styles.metricVal}>{sleepData.minHR} bpm</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.detailsBtn}>
                <Text style={styles.detailsBtnText}>See details</Text>
            </TouchableOpacity>
        </WelltoryCard>
    );
};

export default SleepAnalysisCard;

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#3b82f630',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    chartCol: {
        flex: 1.5,
    },
    chartXLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    xLabel: {
        color: '#4b5563',
        fontSize: 10,
    },
    stagesCol: {
        flex: 1,
        paddingLeft: 10,
    },
    stageItem: {
        marginBottom: 12,
    },
    stageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    stageLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    stageValue: {
        fontSize: 14,
        color: '#ffffff',
    },
    stageBarBg: {
        height: 4,
        backgroundColor: '#ffffff10',
        borderRadius: 2,
    },
    stageBar: {
        height: 4,
        borderRadius: 2,
    },
    metricsRow: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 30,
    },
    metricBox: {
        flex: 1,
    },
    metricLabel: {
        color: '#64748b',
        fontSize: 12,
        marginBottom: 4,
    },
    metricVal: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    detailsBtn: {
        backgroundColor: '#ffffff10',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    detailsBtnText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
});
