import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Canvas, RoundedRect, LinearGradient, vec, Group, Circle, BlurMask } from '@shopify/react-native-skia';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import * as d3 from 'd3';
import { useInteractiveChart } from '../hooks/useChartInteraction';
import { GridLines } from './ChartElements';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ModernBarChartProps<T = any> {
    data: T[];
    xKey: keyof T | ((d: T, i: number) => string);
    yKey: keyof T | ((d: T) => number);
    colorKey?: keyof T | ((d: T) => string);
    width?: number;
    height?: number;
    defaultColor?: string;
    showGradient?: boolean;
    showGrid?: boolean;
    barRadius?: number;
    title?: string;
    subtitle?: string;
    onBarSelect?: (index: number, data: T) => void;
    yDomain?: [number, number];
    padding?: { top: number; right: number; bottom: number; left: number };
}

/**
 * Modern, reusable bar chart component
 * - Fully typed with generics
 * - Interactive with touch feedback
 * - Customizable styling
 * - Optimized rendering
 */
export function ModernBarChart<T = any>({
    data,
    xKey,
    yKey,
    colorKey,
    width = SCREEN_WIDTH - 64,
    height = 200,
    defaultColor = '#10b981',
    showGradient = false,
    showGrid = true,
    barRadius = 4,
    title,
    subtitle,
    onBarSelect,
    yDomain,
    padding = { top: 20, right: 10, bottom: 40, left: 10 },
}: ModernBarChartProps<T>) {

    // Scales
    const xScale = useMemo(() =>
        d3.scaleBand()
            .domain(data.map((d, i) =>
                typeof xKey === 'function' ? xKey(d, i) : String(d[xKey])
            ))
            .range([padding.left, width - padding.right])
            .padding(0.2),
        [data, xKey, width, padding]);

    const yScale = useMemo(() => {
        const domain = yDomain || [0, d3.max(data, d =>
            typeof yKey === 'function' ? yKey(d) : Number(d[yKey])
        ) as number];
        return d3.scaleLinear()
            .domain(domain)
            .range([height - padding.bottom, padding.top]);
    }, [data, yKey, yDomain, height, padding]);

    // Data points
    const xPoints = useMemo(() =>
        data.map((_, i) => (xScale(String(i)) || 0) + xScale.bandwidth() / 2),
        [data, xScale]);

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
            if (onBarSelect) {
                onBarSelect(index, data[index]);
            }
        },
        snapThreshold: xScale.bandwidth(),
    });

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

                    {/* Bars */}
                    {data.map((d, i) => {
                        const xPos = xScale(String(i)) || 0;
                        const yValue = typeof yKey === 'function' ? yKey(d) : Number(d[yKey]);
                        const yPos = yScale(yValue);
                        const barHeight = height - padding.bottom - yPos;
                        const barWidth = xScale.bandwidth();

                        const color = colorKey
                            ? (typeof colorKey === 'function' ? colorKey(d) : String(d[colorKey]))
                            : defaultColor;

                        const isActive = selectedIndex.value === i && touchActive.value > 0;

                        return (
                            <Group key={i}>
                                <RoundedRect
                                    x={xPos}
                                    y={yPos}
                                    width={barWidth}
                                    height={Math.max(barHeight, 2)}
                                    r={barRadius}
                                    opacity={isActive ? 1 : 0.85}
                                >
                                    {showGradient ? (
                                        <LinearGradient
                                            start={vec(xPos, yPos)}
                                            end={vec(xPos, height - padding.bottom)}
                                            colors={[color, color + '80']}
                                        />
                                    ) : (
                                        <>{color}</>
                                    )}
                                </RoundedRect>

                                {/* Active indicator */}
                                {isActive && (
                                    <Circle
                                        cx={xPos + barWidth / 2}
                                        cy={yPos}
                                        r={4}
                                        color="#ffffff"
                                    >
                                        <BlurMask blur={6} style="normal" />
                                    </Circle>
                                )}
                            </Group>
                        );
                    })}
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
