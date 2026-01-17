import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import {
    Canvas,
    Path,
    Skia,
    useFont,
    Text as SkiaText,
    Group,
    vec,
    SweepGradient,
} from '@shopify/react-native-skia';
import Animated, {
    useSharedValue,
    useDerivedValue,
    withSpring,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 40;
const CANVAS_SIZE = 200;
const RADIUS = 80;
const STROKE_WIDTH = 20;

const FONT_PATH = require('../../../assets/fonts/SFProDisplayRegular.ttf');

interface CircularGaugeProps {
    title?: string;
    status?: string;
    value?: string;
    subValue?: string;
    percent?: number; // 0 to 1
    advice?: string;
}

const CircularGaugeWelltory = ({
    title = "Your diastolic pressure is notably high",
    status = "CONCERNING",
    value = "140 / 79",
    subValue = "78 bpm",
    percent = 0.65,
    advice = "Your current reading indicates possible isolated diastolic hypertension. This isn't typical for you and might be stress-related."
}: CircularGaugeProps) => {
    const font = useFont(FONT_PATH, 12);
    const valueFont = useFont(FONT_PATH, 32);
    const labelFont = useFont(FONT_PATH, 16);

    const touchActive = useSharedValue(0);
    const animatedPercent = useSharedValue(percent);

    React.useEffect(() => {
        animatedPercent.value = withSpring(percent, { damping: 15 });
    }, [percent]);

    const gesture = Gesture.Tap()
        .onStart(() => {
            'worklet';
            touchActive.value = withSpring(1, { damping: 10 });
        })
        .onEnd(() => {
            'worklet';
            touchActive.value = withSpring(0, { damping: 10 });
        });

    const scaleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: 1 + touchActive.value * 0.05 }]
    }));

    const center = vec(CANVAS_SIZE / 2, CANVAS_SIZE / 2);

    const backgroundPath = useMemo(() => {
        const p = Skia.Path.Make();
        p.addArc({ x: center.x - RADIUS, y: center.y - RADIUS, width: RADIUS * 2, height: RADIUS * 2 }, 135, 270);
        return p;
    }, [center]);

    const activePath = useMemo(() => {
        const p = Skia.Path.Make();
        const sweepAngle = 270 * percent;
        p.addArc({ x: center.x - RADIUS, y: center.y - RADIUS, width: RADIUS * 2, height: RADIUS * 2 }, 135, sweepAngle);
        return p;
    }, [center, percent]);

    if (!font || !valueFont || !labelFont) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>

            <GestureDetector gesture={gesture}>
                <Animated.View style={[styles.canvasContainer, scaleStyle]}>
                    <Canvas style={styles.canvas}>
                        {/* Background Track */}
                        <Path
                            path={backgroundPath}
                            style="stroke"
                            strokeWidth={STROKE_WIDTH}
                            color="#2a2a3e"
                            strokeCap="round"
                        />
                        {/* Active Track */}
                        <Path
                            path={activePath}
                            style="stroke"
                            strokeWidth={STROKE_WIDTH}
                            strokeCap="round"
                        >
                            <SweepGradient
                                c={center}
                                colors={['#ef4444', '#f97316', '#ef4444']}
                                start={135}
                                end={315}
                            />
                        </Path>

                        {/* Inner Text Labels */}
                        <Group>
                            <SkiaText
                                x={CANVAS_SIZE / 2 - 40}
                                y={CANVAS_SIZE / 2 - 20}
                                text={status}
                                font={font}
                                color="#ef4444"
                            />
                            <SkiaText
                                x={CANVAS_SIZE / 2 - 60}
                                y={CANVAS_SIZE / 2 + 15}
                                text={value}
                                font={valueFont}
                                color="#ffffff"
                            />
                            <SkiaText
                                x={CANVAS_SIZE / 2 - 25}
                                y={CANVAS_SIZE / 2 + 45}
                                text={subValue}
                                font={labelFont}
                                color="#6b7280"
                            />
                        </Group>
                    </Canvas>
                </Animated.View>
            </GestureDetector>

            <Text style={styles.advice}>{advice}</Text>
        </View>
    );
};

export default CircularGaugeWelltory;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1a1a2e',
        borderRadius: 24,
        padding: 20,
        marginVertical: 10,
        width: CHART_WIDTH,
    },
    title: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
    },
    canvasContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    canvas: {
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
    },
    advice: {
        color: '#9ca3af',
        fontSize: 14,
        lineHeight: 20,
        marginTop: 20,
    },
});

