/**
 * Advanced Bar Chart - Production Ready
 * 
 * Optimizations:
 * - Pre-calculated bar positions (JS thread)
 * - Worklet-based touch detection (UI thread)
 * - Smooth animations with Reanimated
 * - GPU-accelerated rendering with Skia
 */

import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, RoundedRect, Group, Line, vec, Skia, LinearGradient } from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSharedValue, useDerivedValue, withSpring, runOnJS } from 'react-native-reanimated';
import * as d3 from 'd3';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

export interface BarDataPoint {
    label: string;
    value: number;
    color?: string;
    [key: string]: any;
}

export interface AdvancedBarChartProps {
    data: BarDataPoint[];
    width?: number;
    height?: number;
    padding?: { top: number; right: number; bottom: number; left: number };
    barColor?: string;
    barRadius?: number;
    showGradient?: boolean;
    showGrid?: boolean;
    animated?: boolean;
    onBarSelect?: (bar: BarDataPoint, index: number) => void;
}

// ============================================================================
// WORKLET UTILITIES
// ============================================================================

const findBarIndex = (x: number, barPositions: { x: number; width: number }[]): number => {
    'worklet';
    for (let i = 0; i < barPositions.length; i++) {
        const bar = barPositions[i];
        if (x >= bar.x && x <= bar.x + bar.width) {
            return i;
        }
    }
    return -1;
};

// ============================================================================
// ADVANCED BAR CHART
// ============================================================================

export const AdvancedBarChart: React.FC<AdvancedBarChartProps> = React.memo(({
    data,
    width = SCREEN_WIDTH - 64,
    height = 200,
    padding = { top: 20, right: 20, bottom: 40, left: 20 },
    barColor = '#10b981',
    barRadius = 8,
    showGradient = true,
    showGrid = true,
    animated = true,
    onBarSelect,
}) => {
    // ========================================================================
    // SCALES (Memoized - JS Thread)
    // ========================================================================
    const { xScale, yScale } = useMemo(() => {
        const xScale = d3.scaleBand()
            .domain(data.map((_, i) => i.toString()))
            .range([padding.left, width - padding.right])
            .padding(0.2);

        const yMax = d3.max(data, d => d.value) || 100;
        const yScale = d3.scaleLinear()
            .domain([0, yMax])
            .range([height - padding.bottom, padding.top])
            .nice();

        return { xScale, yScale };
    }, [data, width, height, padding]);

    // ========================================================================
    // PRE-CALCULATED BAR POSITIONS (JS Thread)
    // ========================================================================
    const barPositions = useMemo(() => {
        return data.map((d, i) => {
            const x = xScale(i.toString()) || 0;
            const y = yScale(d.value);
            const barWidth = xScale.bandwidth();
            const barHeight = (height - padding.bottom) - y;

            return {
                x,
                y,
                width: barWidth,
                height: Math.max(barHeight, 2), // Minimum height
                centerX: x + barWidth / 2,
                color: d.color || barColor,
            };
        });
    }, [data, xScale, yScale, height, padding, barColor]);

    // ========================================================================
    // GRID LINES
    // ========================================================================
    const gridLines = useMemo(() => {
        if (!showGrid) return [];
        const ticks = yScale.ticks(5);
        return ticks.map(tick => ({
            y: yScale(tick),
            value: tick,
        }));
    }, [yScale, showGrid]);

    // ========================================================================
    // ANIMATION
    // ========================================================================
    const animationProgress = useSharedValue(animated ? 0 : 1);

    React.useEffect(() => {
        if (animated) {
            animationProgress.value = withSpring(1, {
                damping: 15,
                stiffness: 100,
            });
        }
    }, [animated]);

    // ========================================================================
    // INTERACTION STATE
    // ========================================================================
    const selectedIndex = useSharedValue(-1);
    const isActive = useSharedValue(0);

    // ========================================================================
    // GESTURE HANDLER
    // ========================================================================
    const handleBarSelection = useCallback((index: number) => {
        if (onBarSelect && index >= 0 && index < data.length) {
            onBarSelect(data[index], index);
        }
    }, [data, onBarSelect]);

    const gesture = useMemo(() => Gesture.Pan()
        .runOnJS(false)
        .onStart((e) => {
            'worklet';
            const idx = findBarIndex(e.x, barPositions);
            selectedIndex.value = idx;
            isActive.value = withSpring(1, { damping: 10 });
            if (idx >= 0 && onBarSelect) {
                runOnJS(handleBarSelection)(idx);
            }
        })
        .onUpdate((e) => {
            'worklet';
            const idx = findBarIndex(e.x, barPositions);
            selectedIndex.value = idx;
        })
        .onEnd(() => {
            'worklet';
            isActive.value = withSpring(0, { damping: 10 });
            selectedIndex.value = -1;
        }), [barPositions, onBarSelect, handleBarSelection]);

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <View style={[styles.container, { width, height }]}>
            <GestureDetector gesture={gesture}>
                <Canvas style={{ width, height }}>
                    {/* Grid Lines */}
                    {showGrid && gridLines.map((grid, i) => (
                        <Line
                            key={i}
                            p1={vec(padding.left, grid.y)}
                            p2={vec(width - padding.right, grid.y)}
                            color="#ffffff08"
                            strokeWidth={1}
                        />
                    ))}

                    {/* Bars */}
                    {barPositions.map((bar, i) => {
                        const isSelected = selectedIndex.value === i && isActive.value > 0;
                        const animatedHeight = bar.height * animationProgress.value;
                        const animatedY = bar.y + (bar.height - animatedHeight);

                        return (
                            <Group key={i}>
                                <RoundedRect
                                    x={bar.x}
                                    y={animatedY}
                                    width={bar.width}
                                    height={animatedHeight}
                                    r={barRadius}
                                    opacity={isSelected ? 1 : 0.9}
                                >
                                    {showGradient ? (
                                        <LinearGradient
                                            start={vec(bar.x, bar.y)}
                                            end={vec(bar.x, height - padding.bottom)}
                                            colors={[bar.color, bar.color + '80']}
                                        />
                                    ) : (
                                        <>{bar.color}</>
                                    )}
                                </RoundedRect>

                                {/* Selection Indicator */}
                                {isSelected && (
                                    <RoundedRect
                                        x={bar.x - 2}
                                        y={animatedY - 2}
                                        width={bar.width + 4}
                                        height={animatedHeight + 4}
                                        r={barRadius + 2}
                                        color="#ffffff40"
                                        style="stroke"
                                        strokeWidth={2}
                                    />
                                )}
                            </Group>
                        );
                    })}
                </Canvas>
            </GestureDetector>
        </View>
    );
});

AdvancedBarChart.displayName = 'AdvancedBarChart';

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
    },
});

export default AdvancedBarChart;
