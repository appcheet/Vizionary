import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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
    BlurMask,
    Rect,
} from '@shopify/react-native-skia';
import { Activity, Info, Heart, Zap, Flame } from 'lucide-react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    withTiming,
    useDerivedValue,
    useAnimatedReaction,
    runOnJS,
} from 'react-native-reanimated';
import * as d3 from 'd3';
import { generateRandomHeartData } from './utils/dataGenerator';
import WelltoryCard from './components/WelltoryCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 72;
const CHART_HEIGHT = 150;
const PADDING = { top: 10, right: 10, bottom: 20, left: 10 };

const FONT_PATH = require('../../../assets/fonts/SFProDisplayRegular.ttf');

interface HeartDataPoint {
    health: number;
    energy: number;
    stress: number;
    value: number;
}

interface HeartReportDetailsProps {
    title?: string;
    subtitle?: string;
    data?: HeartDataPoint[];
}

const HeartReportDetails = ({
    title = "Yesterday's heart report",
    subtitle = "JUN 14, 2024",
    data: initialData,
}: HeartReportDetailsProps) => {
    const data = useMemo(() => initialData || generateRandomHeartData(10) as any, [initialData]);
    const touchX = useSharedValue(0);
    const touchActive = useSharedValue(0);
    const selectedIndex = useSharedValue(data.length - 1);
    const [activeIdx, setActiveIdx] = React.useState(data.length - 1);

    useAnimatedReaction(
        () => selectedIndex.value,
        (idx) => {
            runOnJS(setActiveIdx)(idx);
        }
    );

    const font = useFont(FONT_PATH, 12);
    const labelFont = useFont(FONT_PATH, 10);
    const valueFont = useFont(FONT_PATH, 14);

    const xScale = useMemo(() =>
        d3.scaleLinear()
            .domain([0, data.length - 1])
            .range([PADDING.left, CHART_WIDTH - PADDING.right]),
        [data.length]
    );

    const yScale = useMemo(() =>
        d3.scaleLinear()
            .domain([0, 100])
            .range([CHART_HEIGHT - PADDING.bottom, PADDING.top]),
        []
    );

    const xPoints = useMemo(() => data.map((_: any, i: number) => xScale(i)), [xScale, data]);
    const healthYPoints = useMemo(() => data.map((d: any) => yScale(d.health)), [yScale, data]);
    const energyYPoints = useMemo(() => data.map((d: any) => yScale(d.energy)), [yScale, data]);
    const stressYPoints = useMemo(() => data.map((d: any) => yScale(d.stress)), [yScale, data]);

    const paths = useMemo(() => {
        const lineGen = (key: 'health' | 'energy' | 'stress') => {
            const gen = d3.line<any>()
                .x((_: any, i: number) => xScale(i))
                .y((d: any) => yScale(d[key]))
                .curve(d3.curveMonotoneX)(data);
            return gen || '';
        };

        return {
            health: Skia.Path.MakeFromSVGString(lineGen('health')) || Skia.Path.Make(),
            energy: Skia.Path.MakeFromSVGString(lineGen('energy')) || Skia.Path.Make(),
            stress: Skia.Path.MakeFromSVGString(lineGen('stress')) || Skia.Path.Make(),
        };
    }, [xScale, yScale, data]);

    const handleTouch = (x: number, isInitial = false) => {
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
        if (isInitial) {
            touchX.value = withTiming(xPoints[closestIndex], { duration: 150 });
        } else {
            touchX.value = xPoints[closestIndex];
        }
        selectedIndex.value = closestIndex;
    };

    const entryProgress = useSharedValue(0);

    React.useEffect(() => {
        entryProgress.value = withTiming(1, { duration: 1200 });
    }, []);

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

    const activeBpm = useDerivedValue(() => {
        const idx = selectedIndex.value;
        return data[idx]?.value || 0;
    });

    const activeTime = useDerivedValue(() => {
        const hour = 10 + Math.floor(selectedIndex.value / 6);
        const min = (selectedIndex.value % 6) * 10;
        return `${hour}:${min < 10 ? '0' + min : min}`;
    });

    const stressVal = useDerivedValue(() => `${data[selectedIndex.value]?.stress || 0}%`);
    const energyVal = useDerivedValue(() => `${data[selectedIndex.value]?.energy || 0}%`);
    const healthVal = useDerivedValue(() => `${data[selectedIndex.value]?.health || 0}%`);
    const bpmVal = useDerivedValue(() => `${data[selectedIndex.value]?.value || 60} bpm`);

    const p1vec = useDerivedValue(() => vec(touchX.value, 0));
    const p2vec = useDerivedValue(() => vec(touchX.value, CHART_HEIGHT));

    const healthY = useDerivedValue(() => healthYPoints[selectedIndex.value] || 0);
    const energyY = useDerivedValue(() => energyYPoints[selectedIndex.value] || 0);
    const stressY = useDerivedValue(() => stressYPoints[selectedIndex.value] || 0);

    const clipRect = useDerivedValue(() => Skia.XYWHRect(0, 0, CHART_WIDTH * entryProgress.value, CHART_HEIGHT));
    const grid60Y = useMemo(() => yScale(60), [yScale]);
    const grid90Y = useMemo(() => yScale(90), [yScale]);
    const grid120Y = useMemo(() => yScale(120), [yScale]);

    if (!font || !labelFont || !valueFont) return null;

    return (
        <WelltoryCard
            title={title}
            subtitle={subtitle}
            headerRight={<Info size={18} color="#64748b" />}
        >
            <View style={styles.responsiveHeader}>
                <View style={styles.timeValGroup}>
                    <Animated.Text style={styles.bpmValueText}>
                        {data[activeIdx]?.value || 60} bpm
                    </Animated.Text>
                    <Text style={styles.timeLabelText}>{subtitle}</Text>
                </View>

                <View style={styles.metricsGrid}>
                    <View style={styles.metricItemFix}>
                        <Activity size={10} color="#ef4444" />
                        <Text style={[styles.mLabel, { color: '#ef4444' }]}>STRESS</Text>
                        <Text style={styles.mValue}>{data[activeIdx]?.stress || 0}%</Text>
                    </View>
                    <View style={styles.metricItemFix}>
                        <Zap size={10} color="#fbbf24" />
                        <Text style={[styles.mLabel, { color: '#fbbf24' }]}>ENERGY</Text>
                        <Text style={styles.mValue}>{data[activeIdx]?.energy || 0}%</Text>
                    </View>
                    <View style={styles.metricItemFix}>
                        <Heart size={10} color="#10b981" />
                        <Text style={[styles.mLabel, { color: '#10b981' }]}>HEALTH</Text>
                        <Text style={styles.mValue}>{data[activeIdx]?.health || 0}%</Text>
                    </View>
                </View>
            </View>

            <GestureDetector gesture={gesture}>
                <Canvas style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}>
                    <Group clip={clipRect}>
                        <Line p1={vec(0, grid60Y)} p2={vec(CHART_WIDTH, grid60Y)} color="#ffffff08" strokeWidth={1} />
                        <Line p1={vec(0, grid90Y)} p2={vec(CHART_WIDTH, grid90Y)} color="#ffffff08" strokeWidth={1} />
                        <Line p1={vec(0, grid120Y)} p2={vec(CHART_WIDTH, grid120Y)} color="#ffffff08" strokeWidth={1} />

                        <Path path={paths.health} style="stroke" strokeWidth={2.5} color="#10b981" strokeCap="round" />
                        <Path path={paths.energy} style="stroke" strokeWidth={2.5} color="#fbbf24" strokeCap="round" />
                        <Path path={paths.stress} style="stroke" strokeWidth={2.5} color="#ef4444" strokeCap="round" />

                        <Group opacity={touchActive}>
                            <Line p1={p1vec} p2={p2vec} color="#ffffff30" strokeWidth={1} />
                            <Circle cx={touchX} cy={healthY} r={5} color="#10b981">
                                <BlurMask blur={8} style="normal" />
                            </Circle>
                            <Circle cx={touchX} cy={energyY} r={5} color="#fbbf24">
                                <BlurMask blur={8} style="normal" />
                            </Circle>
                            <Circle cx={touchX} cy={stressY} r={5} color="#ef4444">
                                <BlurMask blur={8} style="normal" />
                            </Circle>

                            {/* Inner dots */}
                            <Circle cx={touchX} cy={healthY} r={2} color="#ffffff" />
                            <Circle cx={touchX} cy={energyY} r={2} color="#ffffff" />
                            <Circle cx={touchX} cy={stressY} r={2} color="#ffffff" />
                        </Group>
                    </Group>
                </Canvas>
            </GestureDetector>

            <View style={styles.legend}>
                <Text style={[styles.legendItem, { color: '#3b82f6' }]}>SLEEP</Text>
                <Text style={[styles.legendItem, { color: '#10b981' }]}>EXERCISE</Text>
                <Text style={[styles.legendItem, { color: '#fbbf24' }]}>MOVE</Text>
            </View>
        </WelltoryCard>
    );
};

export default HeartReportDetails;

const styles = StyleSheet.create({
    responsiveHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        width: '100%',
    },
    timeValGroup: {
        flex: 1,
    },
    bpmValueText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    timeLabelText: {
        fontSize: 12,
        color: '#64748b',
    },
    metricsGrid: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 4,
    },
    metricItemFix: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    mLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        width: 50,
        textAlign: 'right',
    },
    mValue: {
        fontSize: 12,
        color: '#ffffff',
        width: 35,
        fontWeight: '600',
    },
    legend: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    legendItem: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});
