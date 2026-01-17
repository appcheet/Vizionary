import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, DimensionValue } from 'react-native';
import {
    Canvas,
    Path,
    Skia,
    useFont,
    Text as SkiaText,
    Group,
    vec,
    Line,
    LinearGradient,
    Circle,
    BlurMask,
    Rect,
} from '@shopify/react-native-skia';
import * as d3 from 'd3';
import { generateWorkoutData } from './utils/dataGenerator';
import { Activity, Flame, Clock, Zap, Heart, Thermometer, ChevronRight } from 'lucide-react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    withTiming,
    useDerivedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import WelltoryCard from './components/WelltoryCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH * 0.55;
const CHART_HEIGHT = 120;

const FONT_PATH = require('../../../assets/fonts/SFProDisplayRegular.ttf');

interface WorkoutStat {
    label: string;
    value: string;
    icon?: React.ReactNode;
}

interface StrengthTrainingCardProps {
    title?: string;
    time?: string;
    data?: { bpm: number }[];
    zones?: { label: string; color: string; value: string; width: DimensionValue }[];
    stats?: WorkoutStat[];
}

const StrengthTrainingCard = ({
    title = "Strength training",
    time = "1:40 PM",
    data: initialData,
    zones: initialZones,
    stats: initialStats,
}: StrengthTrainingCardProps) => {
    const data = useMemo(() => initialData || generateWorkoutData(15), [initialData]);

    const zones = useMemo(() => initialZones || [
        { label: 'Peak', color: '#ef4444', value: '8 s', width: '5%' },
        { label: 'Cardio', color: '#fbbf24', value: '9 min', width: '60%' },
        { label: 'Fat burn', color: '#bef264', value: '11 min', width: '75%' },
        { label: 'Light', color: '#3b82f6', value: '8 min', width: '40%' },
    ], [initialZones]);

    const stats = useMemo(() => initialStats || [
        { label: 'Total Time', value: '1h 14 min', icon: <Clock size={12} color="#64748b" /> },
        { label: 'Burned', value: '321 kcal', icon: <Flame size={12} color="#64748b" /> },
        { label: 'Active Kcal', value: '254 kcal', icon: <Zap size={12} color="#64748b" /> },
        { label: 'Avg Pulse', value: '95 bpm', icon: <Heart size={12} color="#64748b" /> },
        { label: 'Resting HR', value: '40 bpm', icon: <Activity size={12} color="#64748b" /> },
        { label: 'Air Temp', value: '17°C', icon: <Thermometer size={12} color="#64748b" /> },
    ], [initialStats]);
    const touchX = useSharedValue(0);
    const touchActive = useSharedValue(0);
    const entryProgress = useSharedValue(0);

    React.useEffect(() => {
        entryProgress.value = withTiming(1, { duration: 1000 });
    }, []);

    const font = useFont(FONT_PATH, 10);
    const valueFont = useFont(FONT_PATH, 14);

    const xScale = useMemo(() =>
        d3.scaleLinear().domain([0, data.length - 1]).range([0, CHART_WIDTH]),
        [data.length]);

    const yScale = useMemo(() =>
        d3.scaleLinear().domain([60, 180]).range([CHART_HEIGHT, 0]),
        []);

    const xPoints = useMemo(() => data.map((_, i) => xScale(i)), [xScale, data]);
    const yPoints = useMemo(() => data.map((d) => yScale(d.bpm)), [yScale, data]);
    const grid100Y = useMemo(() => yScale(100), [yScale]);
    const grid140Y = useMemo(() => yScale(140), [yScale]);

    const fullPath = useMemo(() => {
        const lineGenerator = d3.line<any>()
            .x((_, i) => xScale(i))
            .y((d) => yScale(d.bpm))
            .curve(d3.curveMonotoneX)(data);
        return Skia.Path.MakeFromSVGString(lineGenerator || '') || Skia.Path.Make();
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

    const activeBpm = useDerivedValue(() => {
        const idx = Math.round(interpolate(touchX.value, [0, CHART_WIDTH], [0, data.length - 1], Extrapolate.CLAMP));
        return data[idx]?.bpm || 0;
    });

    const activeY = useDerivedValue(() => {
        const idx = Math.round(interpolate(touchX.value, [0, CHART_WIDTH], [0, data.length - 1], Extrapolate.CLAMP));
        return yPoints[idx] || 0;
    });

    const clipRect = useDerivedValue(() => Skia.XYWHRect(0, 0, CHART_WIDTH * entryProgress.value, CHART_HEIGHT));
    const touchX1vec = useDerivedValue(() => vec(touchX.value, 0));
    const touchX2vec = useDerivedValue(() => vec(touchX.value, CHART_HEIGHT));
    const indicatorTextX = useDerivedValue(() => touchX.value - 20);
    const indicatorTextY = useDerivedValue(() => activeY.value - 15);
    const indicatorText = useDerivedValue(() => `${activeBpm.value} bpm`);

    const animatedZoneStyle = useAnimatedStyle(() => ({
        transform: [{ scaleX: entryProgress.value }],
        opacity: entryProgress.value,
    }));

    if (!font || !valueFont) return null;

    return (
        <WelltoryCard title={title} headerRight={time}>
            <View style={styles.badgeContainer}>
                <View style={styles.badge}>
                    <Activity size={14} color="#000" style={{ marginRight: 6 }} />
                    <Text style={styles.badgeText}>{title}</Text>
                </View>
            </View>

            <View style={styles.mainContent}>
                <View style={styles.chartCol}>
                    <GestureDetector gesture={gesture}>
                        <Canvas style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}>
                            {/* Entry Reveal Animation Clip */}
                            <Group clip={clipRect}>
                                {/* Grid Lines */}
                                <Line p1={vec(0, grid100Y)} p2={vec(CHART_WIDTH, grid100Y)} color="#ffffff08" strokeWidth={1} />
                                <Line p1={vec(0, grid140Y)} p2={vec(CHART_WIDTH, grid140Y)} color="#ffffff08" strokeWidth={1} />

                                {/* Multicolored Path using Linear Gradient for zones */}
                                <Path
                                    path={fullPath}
                                    style="stroke"
                                    strokeWidth={2.5}
                                    strokeCap="round"
                                >
                                    <LinearGradient
                                        start={vec(0, CHART_HEIGHT)}
                                        end={vec(0, 0)}
                                        colors={['#3b82f6', '#3b82f6', '#bef264', '#fbbf24', '#ef4444']}
                                        positions={[0, 0.2, 0.4, 0.7, 1]}
                                    />
                                </Path>

                                {/* Interaction Elements */}
                                <Group opacity={touchActive}>
                                    <Line
                                        p1={touchX1vec}
                                        p2={touchX2vec}
                                        color="#ffffff30"
                                        strokeWidth={1}
                                    />
                                    <Circle cx={touchX} cy={activeY} r={6} color="#ffffff">
                                        <BlurMask blur={10} style="normal" />
                                    </Circle>
                                    <Circle cx={touchX} cy={activeY} r={3} color="#ffffff" />

                                    <SkiaText
                                        x={indicatorTextX}
                                        y={indicatorTextY}
                                        text={indicatorText}
                                        font={valueFont}
                                        color="#ffffff"
                                    />
                                </Group>
                            </Group>
                        </Canvas>
                    </GestureDetector>
                    <View style={styles.chartXLabels}>
                        <Text style={styles.xLabel}>12:26</Text>
                        <Text style={styles.xLabel}>13:40</Text>
                    </View>
                </View>

                <View style={styles.zonesCol}>
                    {zones.map((zone, i) => (
                        <View key={i} style={styles.zoneItem}>
                            <View style={styles.zoneHeader}>
                                <Text style={[styles.zoneLabel, { color: zone.label === 'Peak' ? '#ef4444' : '#ffffff' }]}>{zone.label}</Text>
                                <Text style={[styles.zoneValue, { color: zone.color }]}>{zone.value}</Text>
                            </View>
                            <View style={styles.zoneBarBg}>
                                <Animated.View
                                    style={[
                                        styles.zoneBar,
                                        {
                                            backgroundColor: zone.color,
                                            width: zone.width as any,
                                        },
                                        animatedZoneStyle
                                    ]}
                                />
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.statsGrid}>
                {stats.map((stat, i) => (
                    <View key={i} style={styles.statBox}>
                        <View style={styles.statHeader}>
                            {stat.icon}
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                        <Text style={styles.statVal}>{stat.value}</Text>
                    </View>
                ))}
            </View>
        </WelltoryCard>
    );
};

export default StrengthTrainingCard;

const styles = StyleSheet.create({
    badgeContainer: {
        marginBottom: 16,
    },
    badge: {
        backgroundColor: '#bef264',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: 16,
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
    zonesCol: {
        flex: 1,
        paddingLeft: 10,
    },
    zoneItem: {
        marginBottom: 12,
    },
    zoneHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    zoneLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    zoneValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    zoneBarBg: {
        height: 4,
        backgroundColor: '#ffffff10',
        borderRadius: 2,
    },
    zoneBar: {
        height: 4,
        borderRadius: 2,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 20,
        gap: 20,
    },
    statBox: {
        width: '30%',
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    statLabel: {
        color: '#64748b',
        fontSize: 10,
    },
    statVal: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
