import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import {
    Canvas,
    Path,
    Skia,
    LinearGradient,
    vec,
    Circle,
    Group,
    Line,
    useFont,
} from '@shopify/react-native-skia';
import * as d3 from 'd3';
import { ChevronDown } from 'lucide-react-native';
import { generateSparklineData, generateECGWaveform } from './utils/dataGenerator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 60;

const FONT_PATH = require('../../../assets/fonts/SFProDisplayRegular.ttf');

interface MetricSparklineProps {
    label: string;
    value: string;
    status: string;
    statusColor: string;
    range: string;
    description: string;
    lineColor: string;
    isECG?: boolean;
}

const MetricSparklineChart = ({
    label,
    value,
    status,
    statusColor,
    range,
    description,
    lineColor,
    isECG = false,
}: MetricSparklineProps) => {
    const data = useMemo(() => isECG ? generateECGWaveform(120) : generateSparklineData(12), [isECG]);
    const font = useFont(FONT_PATH, 10);

    const xScale = useMemo(() =>
        d3.scaleLinear().domain([0, data.length - 1]).range([5, CHART_WIDTH - 5]),
        [data.length]);

    const yScale = useMemo(() => {
        const yDomain = d3.extent(data, (d: any) => d.y) as [number, number];
        return d3.scaleLinear().domain(yDomain).range([CHART_HEIGHT - 5, 5]);
    }, [data]);

    const linePath = useMemo(() => {
        const lineGenerator = d3.line<any>()
            .x((_, i) => xScale(i))
            .y((d) => yScale(d.y))
            .curve(isECG ? d3.curveStepAfter : d3.curveBasis)(data);
        const pathStr = lineGenerator || '';
        if (!pathStr) return Skia.Path.Make();
        return Skia.Path.MakeFromSVGString(pathStr) || Skia.Path.Make();
    }, [xScale, yScale, data, isECG]);

    if (!font) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.metricInfo}>
                    <View style={[styles.badge, { backgroundColor: statusColor }]}>
                        <Text style={styles.valueText}>{value}</Text>
                    </View>
                    <View style={styles.labelCol}>
                        <View style={styles.labelRow}>
                            <Text style={styles.labelText}>{label}</Text>
                            <ChevronDown size={14} color="#ffffff60" />
                        </View>
                        <View style={styles.statusRow}>
                            <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
                            <Text style={styles.rangeText}>Normal range: {range}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <Text style={styles.descriptionText}>{description}</Text>

            <View style={styles.chartContainer}>
                <Canvas style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}>
                    <Path
                        path={linePath}
                        style="stroke"
                        strokeWidth={isECG ? 1 : 2}
                        color={lineColor}
                        strokeCap="round"
                    />

                    {/* Today Marker */}
                    {!isECG && (
                        <Group>
                            <Line
                                p1={vec(CHART_WIDTH * 0.8, 0)}
                                p2={vec(CHART_WIDTH * 0.8, CHART_HEIGHT)}
                                color="#ffffff20"
                                strokeWidth={1}
                            />
                            <Circle
                                cx={CHART_WIDTH * 0.8}
                                cy={yScale(data[Math.floor(data.length * 0.8)]?.y || 0)}
                                r={3}
                                color={lineColor}
                            />
                        </Group>
                    )}
                </Canvas>
                <View style={styles.timeAxis}>
                    <Text style={styles.timeText}>14:41 Today</Text>
                </View>
            </View>
        </View>
    );
};

export default MetricSparklineChart;

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ffffff10',
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    metricInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    badge: {
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    valueText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    labelCol: {
        gap: 2,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    labelText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    rangeText: {
        color: '#ffffff40',
        fontSize: 11,
    },
    descriptionText: {
        color: '#ffffffcc',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    chartContainer: {
        alignItems: 'center',
    },
    timeAxis: {
        width: CHART_WIDTH,
        alignItems: 'flex-end',
        marginTop: 4,
    },
    timeText: {
        color: '#ffffff30',
        fontSize: 10,
    }
});
