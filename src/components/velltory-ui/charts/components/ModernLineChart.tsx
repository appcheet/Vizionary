import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Path, LinearGradient, vec, Group } from '@shopify/react-native-skia';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import * as d3 from 'd3';
import { useInteractiveChart } from '../hooks/useChartInteraction';
import { useLinePath, useAreaPath, useDataPoints } from '../hooks/useChartScales';
import { InteractiveMarker, VerticalGuideLine, GridLines } from './ChartElements';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ModernLineChartProps<T = any> {
    data: T[];
    xKey: keyof T | ((d: T, i: number) => any);
    yKey: keyof T | ((d: T) => any);
    width?: number;
    height?: number;
    colors?: string[];
    showArea?: boolean;
    showGrid?: boolean;
    showMarker?: boolean;
    curve?: any;
    title?: string;
    subtitle?: string;
    onPointSelect?: (index: number, data: T) => void;
    yDomain?: [number, number];
    padding?: { top: number; right: number; bottom: number; left: number };
}

/**
 * Modern, reusable line chart component with full interactivity
 * - Supports custom data types
 * - Configurable styling
 * - Interactive gestures
 * - Optimized performance
 */
export function ModernLineChart<T = any>({
    data,
    xKey,
    yKey,
    width = SCREEN_WIDTH - 64,
    height = 200,
    colors = ['#10b981', '#059669'],
    showArea = true,
    showGrid = true,
    showMarker = true,
    curve = d3.curveMonotoneX,
    title,
    subtitle,
    onPointSelect,
    yDomain,
    padding = { top: 20, right: 10, bottom: 40, left: 10 },
}: ModernLineChartProps<T>) {

    // Scales
    const xScale = useMemo(() =>
        d3.scaleLinear()
            .domain([0, data.length - 1])
            .range([padding.left, width - padding.right]),
        [data.length, width, padding]);

    const yScale = useMemo(() => {
        const domain = yDomain || d3.extent(data, yKey as any) as [number, number];
        return d3.scaleLinear()
            .domain(domain)
            .range([height - padding.bottom, padding.top]);
    }, [data, yKey, yDomain, height, padding]);

    // Accessors
    const xAccessor = typeof xKey === 'function' ? xKey : (_: T, i: number) => xScale(i);
    const yAccessor = typeof yKey === 'function' ? yKey : (d: T) => yScale(d[yKey] as any);

    // Data points
    const { xPoints, yPoints } = useDataPoints(
        data,
        xScale,
        yScale,
        xKey,
        yKey
    );

    // Paths
    const linePath = useLinePath(
        data,
        (_, i) => xScale(i),
        (d) => yScale((typeof yKey === 'function' ? yKey(d) : d[yKey]) as any),
        curve
    );

    const areaPath = showArea ? useAreaPath(
        data,
        (_, i) => xScale(i),
        () => height - padding.bottom,
        (d) => yScale((typeof yKey === 'function' ? yKey(d) : d[yKey]) as any),
        curve
    ) : null;

    // Interactivity
    const {
        touchX,
        touchActive,
        selectedIndex,
        gesture,
    } = useInteractiveChart({
        data,
        xPoints,
        onIndexChange: (index) => {
            if (onPointSelect) {
                onPointSelect(index, data[index]);
            }
        },
    });

    const activeY = useDerivedValue(() => yPoints[selectedIndex.value] || 0);

    // Grid lines
    const gridYValues = useMemo(() => {
        const ticks = yScale.ticks(5);
        return ticks.map(t => yScale(t));
    }, [yScale]);

    return (
        <View style={styles.container}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

            <GestureDetector gesture={gesture}>
                <Canvas style={{ width, height }}>
                    {/* Grid */}
                    {showGrid && (
                        <GridLines
                            width={width}
                            height={height}
                            yValues={gridYValues}
                        />
                    )}

                    {/* Area */}
                    {showArea && areaPath && (
                        <Path path={areaPath}>
                            <LinearGradient
                                start={vec(0, padding.top)}
                                end={vec(0, height - padding.bottom)}
                                colors={[...colors.map(c => c + '40'), colors[colors.length - 1] + '00']}
                            />
                        </Path>
                    )}

                    {/* Line */}
                    <Path
                        path={linePath}
                        style="stroke"
                        strokeWidth={3}
                        strokeCap="round"
                    >
                        <LinearGradient
                            start={vec(0, 0)}
                            end={vec(width, 0)}
                            colors={colors}
                        />
                    </Path>

                    {/* Interactive elements */}
                    {showMarker && (
                        <Group>
                            <VerticalGuideLine
                                x={touchX}
                                y1={padding.top}
                                y2={height - padding.bottom}
                                opacity={touchActive}
                            />
                            <InteractiveMarker
                                touchX={touchX}
                                touchY={activeY}
                                touchActive={touchActive}
                                color={colors[0]}
                            />
                        </Group>
                    )}
                </Canvas>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1a1a2e',
        borderRadius: 24,
        padding: 20,
        marginVertical: 10,
    },
    title: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        color: '#64748b',
        fontSize: 14,
        marginBottom: 16,
    },
});
