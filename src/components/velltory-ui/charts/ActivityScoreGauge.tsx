import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Path, Skia, vec, SweepGradient, Line } from '@shopify/react-native-skia';

import { ChevronRight, Activity } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ActivityScoreProps {
    title?: string;
    icon?: React.ReactNode;
    percent?: number; // 0 to 1
    backgroundColor?: string;
}

const ActivityScoreGauge = ({
    title = "Pressure",
    icon = <Activity size={14} color="#ffffffcc" />,
    percent = 0.4,
    backgroundColor = '#064e3b'
}: ActivityScoreProps) => {
    const CANVAS_SIZE = 120;
    const RADIUS = 50;
    const center = vec(CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 20);

    const arcPath = useMemo(() => {
        const p = Skia.Path.Make();
        p.addArc({ x: center.x - RADIUS, y: center.y - RADIUS, width: RADIUS * 2, height: RADIUS * 2 }, 180, 180);
        return p;
    }, [center]);

    // Needle logic based on percent
    const needleAngle = 180 + (180 * percent);
    const needleRad = (needleAngle * Math.PI) / 180;
    const nx = center.x + RADIUS * 0.8 * Math.cos(needleRad);
    const ny = center.y + RADIUS * 0.8 * Math.sin(needleRad);

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <View style={styles.header}>
                <View style={{ marginRight: 4 }}>{icon}</View>
                <Text style={styles.title}>{title}</Text>
                <ChevronRight size={16} color="#ffffff50" />
            </View>

            <View style={styles.canvasContainer}>
                <Canvas style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
                    <Path
                        path={arcPath}
                        style="stroke"
                        strokeWidth={12}
                        color="#ffffff15"
                        strokeCap="round"
                    />
                    <Path
                        path={arcPath}
                        style="stroke"
                        strokeWidth={12}
                        strokeCap="round"
                    >
                        <SweepGradient
                            c={center}
                            colors={['#10b981', '#fbbf24', '#ef4444']}
                            start={180}
                            end={360}
                        />
                    </Path>
                    <Line
                        p1={center}
                        p2={vec(nx, ny)}
                        color="#ffffff"
                        strokeWidth={3}
                        strokeCap="round"
                    />
                </Canvas>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>Low</Text>
                    <Text style={styles.label}>High</Text>
                </View>
            </View>
        </View>
    );
};

export default ActivityScoreGauge;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#064e3b',
        borderRadius: 24,
        padding: 16,
        width: (SCREEN_WIDTH - 44) / 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        fontSize: 14,
        marginRight: 4,
    },
    title: {
        color: '#ffffffcc',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    arrow: {
        color: '#ffffff50',
    },
    canvasContainer: {
        alignItems: 'center',
        marginTop: -10,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: -25,
    },
    label: {
        color: '#ffffff80',
        fontSize: 14,
    },
});
