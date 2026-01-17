import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import {
    Canvas,
    Path,
    Skia,
    LinearGradient,
    vec,
    Group,
    BlurMask,
    Circle as SkiaCircle,
} from '@shopify/react-native-skia';
import Animated, {
    useSharedValue,
    useDerivedValue,
    withRepeat,
    withTiming,
    Easing,
    useAnimatedStyle,
    withSequence,
    interpolate,
} from 'react-native-reanimated';
import { Share2, Heart, MoreHorizontal, ChevronRight } from 'lucide-react-native';
import * as d3 from 'd3';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CANVAS_HEIGHT = 250; // Fixed canvas height for the animation area

interface LiquidWellnessProps {
    stress?: number;
    energy?: number;
    health?: number;
    statusText?: string;
    insightText?: string;
}

const LiquidWellnessCard = ({
    stress = 86,
    energy = 43,
    health = 86,
    statusText = "You could use a break",
    insightText = "You're under some serious pressure and it's taking a big toll on you. Overall, you're ready to coast through the day at a chill and laid-back pace.",
}: LiquidWellnessProps) => {
    // ========================================================================
    // ANIMATION VALUES
    // ========================================================================
    const wavePhase = useSharedValue(0); // Horizontal phase
    const verticalSwell = useSharedValue(0); // Slow up/down swell
    const fillLevel = useSharedValue(0); // Current fill progress
    const tilt = useSharedValue(0); // Simulated Gyroscope (tilt angle in radians)

    // ========================================================================
    // DYNAMIC THEME
    // ========================================================================
    const { colors, status, insight, targetFill, bg } = useMemo(() => {
        // High stress = low water (drained), Low stress = high water (full)
        const baseFill = 1 - (stress / 100);
        // Ensure some minimum liquid is always visible (at least 20%)
        const clampedFill = Math.max(0.2, Math.min(0.9, baseFill));

        if (stress > 80) {
            return {
                colors: ['#ef4444', '#dc2626', '#b91c1c'],
                bg: '#450a0a',
                status: "Go easy on yourself",
                insight: "You're wound tight and it's sapping your fuel reserves. Today is best for focusing on your well-being.",
                targetFill: clampedFill,
            };
        } else if (stress > 50) {
            return {
                colors: ['#fbbf24', '#d97706', '#92400e'],
                bg: '#111111',
                status: "Laze a trail",
                insight: "You're slightly strained and could use time to reboot. Overall, you're ready to plug away today as long as you pace yourself.",
                targetFill: clampedFill,
            };
        } else {
            return {
                colors: ['#10b981', '#059669', '#047857'],
                bg: '#111111',
                status: "You got this in the bag",
                insight: "You're in the low-pressure zone and your systems are running like a well-oiled machine. All in all, you can handle just about anything.",
                targetFill: clampedFill,
            };
        }
    }, [stress]);

    // ========================================================================
    // WAVE CONFIGURATION
    // ========================================================================
    const waveHeight = 15; // Amplitude
    const waveCount = 1.0; // Freq
    const waveLength = CARD_WIDTH / waveCount;

    // We generate a long path string to scroll horizontally
    const waveSvgPath = useMemo(() => {
        const points = 60;
        const data: [number, number][] = [];
        // Generate two full wavelengths to loop seamlessly
        for (let i = 0; i <= points * 2; i++) {
            const x = (i / points) * CARD_WIDTH;
            const y = Math.sin((i / points) * Math.PI * 2) * waveHeight;
            data.push([x, y]);
        }

        const lineGenerator = d3.line<[number, number]>()
            .x(d => d[0])
            .y(d => d[1])
            .curve(d3.curveBasis);

        const pathData = lineGenerator(data) || "";
        // Close the path to form the liquid mass
        return `${pathData} L ${CARD_WIDTH * 2} ${CANVAS_HEIGHT} L 0 ${CANVAS_HEIGHT} Z`;
    }, []);

    // Bubbles persistent state
    const bubbles = useMemo(() => Array.from({ length: 12 }).map(() => ({
        x: Math.random() * CARD_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        r: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.2,
        wobble: Math.random() * 20,
    })), []);

    // ========================================================================
    // ANIMATION LOOPS
    // ========================================================================
    useEffect(() => {
        // Horizontal Wave flow
        wavePhase.value = withRepeat(
            withTiming(1, { duration: 6000, easing: Easing.linear }),
            -1,
            false
        );

        // Slow vertical "up-down" flow movement
        verticalSwell.value = withRepeat(
            withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
            -1,
            true
        );

        // Fill target level animation
        fillLevel.value = withTiming(targetFill, { duration: 2500, easing: Easing.out(Easing.exp) });

        // Simulate random tilt (gyro)
        tilt.value = withRepeat(
            withSequence(
                withTiming(0.1, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
                withTiming(-0.08, { duration: 4500, easing: Easing.inOut(Easing.quad) }),
                withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) })
            ),
            -1,
            true
        );
    }, [targetFill]);

    // ========================================================================
    // DERIVED PATHS (UI THREAD)
    // ========================================================================

    // Create the primary wave with slosh/tilt and vertical swell
    const createSloshingWave = (phaseOffset: number, speedMult: number, swellOffset: number) => {
        'worklet';
        const p = Skia.Path.MakeFromSVGString(waveSvgPath);
        if (!p) return Skia.Path.Make();

        const m = Skia.Matrix();

        // Horizontal movement
        const tx = -(wavePhase.value * speedMult + phaseOffset) % 1 * CARD_WIDTH;

        // Vertical position: canvas bottom - (fillLevel * totalHeight) + swell
        const swell = Math.sin(verticalSwell.value * Math.PI * 2) * 5 + swellOffset;
        const ty = CANVAS_HEIGHT - (fillLevel.value * CANVAS_HEIGHT) + swell;

        m.translate(tx, ty);

        // Tilt rotation (sloshing) centered on liquid mass
        // We rotate around the horizontal center and the current water surface level
        const px = CARD_WIDTH / 2;
        const py = ty;
        m.postTranslate(-px, -py);
        m.postRotate(tilt.value);
        m.postTranslate(px, py);

        p.transform(m);
        return p;
    };

    const frontWave = useDerivedValue(() => createSloshingWave(0, 1.0, 0));
    const backWave = useDerivedValue(() => createSloshingWave(0.4, 0.7, -8));

    // Unified bubble state calculation to avoid hooks-in-loop
    const bubblePositions = useDerivedValue(() => {
        // Current surface level from the front wave (approximate without rotation)
        const swell = Math.sin(verticalSwell.value * Math.PI * 2) * 5;
        const surfaceY = CANVAS_HEIGHT - (fillLevel.value * CANVAS_HEIGHT) + swell;

        return bubbles.map((b) => {
            // Rise up
            const timeScaled = wavePhase.value * 200 * b.speed;
            let y = (b.y - timeScaled) % CANVAS_HEIGHT;
            if (y < 0) y += CANVAS_HEIGHT;

            // X wobble
            const x = b.x + Math.sin(wavePhase.value * Math.PI * 4 + b.wobble) * 5;

            // Limit bubbles to stay below the liquid surface with some buffer
            const opacity = y < surfaceY + 15 ? 0 : 1;

            return { x, y, opacity };
        });
    });
    const statsStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: tilt.value * 50 },
            { translateY: Math.sin(verticalSwell.value * Math.PI * 2) * 3 }
        ]
    }));

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <View style={[styles.container, { backgroundColor: bg }]}>
            <View style={styles.header}>
                <Text style={styles.dateText}>MONDAY, 18 JAN  •  1:11 AM</Text>
                <Text style={styles.title}>{status}</Text>
            </View>

            <View style={styles.liquidContainer}>
                <Canvas style={styles.canvas}>
                    {/* Background Wave */}
                    <Path path={backWave} color={colors[1] + '44'} />

                    {/* Foreground Wave Clipping Group */}
                    <Group clip={frontWave}>
                        <Path
                            path={Skia.Path.Make().addRect(Skia.XYWHRect(0, 0, CARD_WIDTH, CANVAS_HEIGHT))}
                        >
                            <LinearGradient
                                start={vec(0, 0)}
                                end={vec(0, CANVAS_HEIGHT)}
                                colors={[colors[0], colors[1], colors[2]]}
                            />
                        </Path>

                        {/* Bubbles - strictly inside liquid */}
                        {bubbles.map((b, i) => {
                            return (
                                <Group
                                    key={i}
                                    opacity={useDerivedValue(() => bubblePositions.value[i].opacity)}
                                >
                                    <SkiaCircle
                                        cx={useDerivedValue(() => bubblePositions.value[i].x)}
                                        cy={useDerivedValue(() => bubblePositions.value[i].y)}
                                        r={b.r}
                                        color="#ffffff55"
                                    >
                                        <BlurMask blur={1} style="normal" />
                                    </SkiaCircle>
                                </Group>
                            );
                        })}
                    </Group>

                    {/* Surface Glow Line */}
                    <Group opacity={0.3}>
                        <Path path={frontWave} strokeWidth={2} style="stroke" color="#ffffff" />
                    </Group>
                </Canvas>

                {/* Overlaid Stats */}
                <Animated.View style={[styles.statsOverlay, statsStyle]}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stress}%</Text>
                        <Text style={styles.statLabel}>STRESS</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{energy}%</Text>
                        <Text style={styles.statLabel}>ENERGY</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{health}%</Text>
                        <Text style={styles.statLabel}>HEALTH</Text>
                    </View>
                </Animated.View>
            </View>

            {/* Insight Text */}
            <View style={styles.insightBox}>
                <Text style={styles.insightText}>{insight}</Text>
            </View>

            {/* Actions Bar */}
            <View style={styles.footer}>
                <View style={styles.footerLeft}>
                    <Share2 size={20} color="#ffffff66" />
                    <Heart size={20} color="#ffffff66" />
                    <MoreHorizontal size={20} color="#ffffff66" />
                </View>
                <View style={[styles.footerRight]}>
                    <Text style={styles.detailsText}>DETAILS</Text>
                    <ChevronRight size={18} color="#ffffff66" />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        borderRadius: 30,
        overflow: 'hidden',
        marginVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 15,
    },
    header: {
        padding: 24,
        paddingBottom: 16,
    },
    dateText: {
        color: '#ffffff55',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    title: {
        color: '#ffffff',
        fontSize: 30,
        fontWeight: '800',
        lineHeight: 36,
    },
    liquidContainer: {
        height: CANVAS_HEIGHT,
        position: 'relative',
        backgroundColor: '#00000033', // Subtle tray color
    },
    canvas: {
        width: CARD_WIDTH,
        height: CANVAS_HEIGHT,
    },
    statsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    statBox: {
        alignItems: 'center',
    },
    statValue: {
        color: '#ffffff',
        fontSize: 34,
        fontWeight: '900',
        textShadowColor: '#00000044',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    statLabel: {
        color: '#ffffff88',
        fontSize: 10,
        fontWeight: '800',
        marginTop: 4,
        letterSpacing: 2,
    },
    insightBox: {
        padding: 24,
        paddingTop: 20,
    },
    insightText: {
        color: '#fffff88',
        fontSize: 15,
        lineHeight: 24,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingTop: 16,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: '#ffffff08',
    },
    footerLeft: {
        flexDirection: 'row',
        gap: 22,
    },
    footerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#ffffff11',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    detailsText: {
        color: '#ffffffaa',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },
});

export default React.memo(LiquidWellnessCard);
