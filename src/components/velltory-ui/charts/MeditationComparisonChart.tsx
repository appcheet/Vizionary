import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import {
    Canvas,
    Path,
    Skia,
    useFont,
    LinearGradient,
    vec,
    Group,
    Line,
    Circle,
    BlurMask,
    Text as SkiaText,
} from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    withTiming,
    useDerivedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { Heart, Share2, MoreHorizontal } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 40;
const CHART_HEIGHT = 180;

const FONT_PATH = require('../../../assets/fonts/SFProDisplayRegular.ttf');

interface MeditationProps {
    badgeTitle?: string;
    time?: string;
    beforeValue?: string;
    afterValue?: string;
}

const MeditationComparisonChart = ({
    badgeTitle = "meditation 13 min",
    time = "08:54",
    beforeValue = "86 bpm",
    afterValue = "78 bpm",
}: MeditationProps) => {
    const font = useFont(FONT_PATH, 12);
    const valueFont = useFont(FONT_PATH, 28);

    const touchX = useSharedValue(0);
    const touchActive = useSharedValue(0);

    const curvePath = useMemo(() => {
        const p = Skia.Path.Make();
        p.moveTo(20, 60);
        p.cubicTo(CHART_WIDTH * 0.4, 60, CHART_WIDTH * 0.6, 140, CHART_WIDTH - 20, 140);
        return p;
    }, []);

    const gesture = Gesture.Pan()
        .runOnJS(false)
        .onStart((e) => {
            'worklet';
            touchActive.value = withTiming(1, { duration: 200 });
            touchX.value = e.x;
        })
        .onUpdate((e) => {
            'worklet';
            touchX.value = e.x;
        })
        .onEnd(() => {
            'worklet';
            touchActive.value = withTiming(0, { duration: 200 });
        });

    const curveY = useDerivedValue(() => {
        const t = touchX.value / CHART_WIDTH;
        // Approximate cubic bezier y-value
        const y = 60 + (140 - 60) * t * t;
        return y;
    });

    const tooltipTransform = useDerivedValue(() => [
        { translateX: touchX.value - 30 },
        { translateY: curveY.value - 40 }
    ]);

    const pulseStyle = useAnimatedStyle(() => ({
        opacity: touchActive.value,
    }));

    if (!font || !valueFont) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badgeTitle}</Text>
                </View>
                <Text style={styles.timeText}>{time}</Text>
            </View>

            <View style={styles.content}>
                <GestureDetector gesture={gesture}>
                    <Canvas style={styles.canvas}>
                        {/* Reference Lines */}
                        <Line p1={vec(20, 60)} p2={vec(CHART_WIDTH * 0.6, 60)} color="#ffffff10" strokeWidth={1} />
                        <Line p1={vec(20, 140)} p2={vec(CHART_WIDTH * 0.6, 140)} color="#ffffff10" strokeWidth={1} />

                        {/* Curve */}
                        <Path
                            path={curvePath}
                            style="stroke"
                            strokeWidth={3}
                            strokeCap="round"
                        >
                            <LinearGradient
                                start={vec(0, 0)}
                                end={vec(CHART_WIDTH, 0)}
                                colors={['#f87171', '#818cf8']}
                            />
                        </Path>

                        {/* Interactive Marker */}
                        <Group opacity={touchActive}>
                            <Circle cx={touchX} cy={curveY} r={6} color="#ffffff">
                                <BlurMask blur={8} style="normal" />
                            </Circle>
                            <Circle cx={touchX} cy={curveY} r={3} color="#ffffff" />

                            {/* Tooltip */}
                            <Group transform={tooltipTransform}>
                                <SkiaText x={0} y={0} text="Relaxing..." font={font} color="#ffffff" />
                            </Group>
                        </Group>
                    </Canvas>
                </GestureDetector>

                <View style={styles.stats}>
                    <View>
                        <Text style={styles.label}>BEFORE</Text>
                        <Text style={styles.value}>{beforeValue}</Text>
                    </View>
                    <View style={styles.rightAlign}>
                        <Text style={styles.label}>AFTER</Text>
                        <Text style={styles.value}>{afterValue}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.footerIcons}>
                    <Heart size={20} color="#ffffff60" />
                    <Share2 size={20} color="#ffffff60" />
                    <MoreHorizontal size={20} color="#ffffff60" />
                </View>
            </View>

            <Animated.View style={[styles.pulseIndicator, pulseStyle]} />
        </View>
    );
};

export default MeditationComparisonChart;

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
        marginBottom: 20,
    },
    badge: {
        backgroundColor: '#a855f7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    timeText: {
        color: '#64748b',
        fontSize: 14,
    },
    content: {
        marginBottom: 20,
    },
    canvas: {
        width: CHART_WIDTH,
        height: CHART_HEIGHT,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    label: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    value: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    rightAlign: {
        alignItems: 'flex-end',
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#ffffff08',
        paddingTop: 16,
    },
    footerIcons: {
        flexDirection: 'row',
        gap: 20,
    },
    pulseIndicator: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10b981',
    },
});
