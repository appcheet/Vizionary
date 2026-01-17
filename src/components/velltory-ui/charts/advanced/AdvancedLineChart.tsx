/**
 * Advanced Chart System - Best Practices
 * 
 * Architecture:
 * 1. D3 - Data transformation & scale calculations (JS thread)
 * 2. Skia - High-performance rendering (GPU)
 * 3. Reanimated - Smooth animations (UI thread)
 * 4. Gesture Handler - Native touch interactions
 * 
 * Performance Optimizations:
 * - Pre-calculate all paths on JS thread
 * - Use worklets for UI thread calculations
 * - Minimize re-renders with React.memo
 * - Batch state updates
 * - Use derived values for reactive calculations
 */

import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Dimensions, LayoutChangeEvent } from 'react-native';
import { Canvas, Path, Group, Circle, Line, vec, Skia, useFont, Text as SkiaText } from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSharedValue, useDerivedValue, withTiming, runOnJS, SharedValue } from 'react-native-reanimated';
import * as d3 from 'd3';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

export interface ChartDataPoint {
    x: number;
    y: number;
    [key: string]: any;
}

export interface AdvancedLineChartProps {
    data: ChartDataPoint[];
    width?: number;
    height?: number;
    padding?: { top: number; right: number; bottom: number; left: number };
    lineColor?: string;
    areaColors?: string[];
    showArea?: boolean;
    showPoints?: boolean;
    showGrid?: boolean;
    animated?: boolean;
    curve?: any;
    onPointSelect?: (point: ChartDataPoint, index: number) => void;
}

// ============================================================================
// UTILITY FUNCTIONS (Worklet-safe)
// ============================================================================

/**
 * Find closest data point index (worklet-safe)
 */
const findClosestIndex = (x: number, xPoints: number[]): number => {
    'worklet';
    let closestIdx = 0;
    let minDist = Infinity;

    for (let i = 0; i < xPoints.length; i++) {
        const dist = Math.abs(xPoints[i] - x);
        if (dist < minDist) {
            minDist = dist;
            closestIdx = i;
        }
    }

    return closestIdx;
};

// ============================================================================
// ADVANCED LINE CHART COMPONENT
// ============================================================================

export const AdvancedLineChart: React.FC<AdvancedLineChartProps> = React.memo(({
    data,
    width = SCREEN_WIDTH - 64,
    height = 200,
    padding = { top: 20, right: 20, bottom: 40, left: 20 },
    lineColor = '#10b981',
    areaColors = ['#10b98140', '#10b98100'],
    showArea = true,
    showPoints = false,
    showGrid = true,
    animated = true,
    curve = d3.curveMonotoneX,
    onPointSelect,
}) => {
    // ========================================================================
    // FONT LOADING
    // ========================================================================
    const font = useFont(require('../../../../assets/fonts/SFProDisplayRegular.ttf'), 12);

    // ========================================================================
    // SCALES (Memoized - JS Thread)
    // ========================================================================
    const { xScale, yScale } = useMemo(() => {
        const xScale = d3.scaleLinear()
            .domain([0, data.length - 1])
            .range([padding.left, width - padding.right]);

        const yExtent = d3.extent(data, d => d.y) as [number, number];
        const yScale = d3.scaleLinear()
            .domain(yExtent)
            .range([height - padding.bottom, padding.top])
            .nice();

        return { xScale, yScale };
    }, [data, width, height, padding]);

    // ========================================================================
    // PRE-CALCULATED POINTS (JS Thread)
    // ========================================================================
    const { xPoints, yPoints } = useMemo(() => {
        const xPoints = data.map((_, i) => xScale(i));
        const yPoints = data.map(d => yScale(d.y));
        return { xPoints, yPoints };
    }, [data, xScale, yScale]);

    // ========================================================================
    // PATHS (Memoized - JS Thread)
    // ========================================================================
    const { linePath, areaPath } = useMemo(() => {
        // Line path
        const lineGenerator = d3.line<ChartDataPoint>()
            .x((_, i) => xScale(i))
            .y(d => yScale(d.y))
            .curve(curve);

        const linePathString = lineGenerator(data) || '';
        const linePath = Skia.Path.MakeFromSVGString(linePathString) || Skia.Path.Make();

        // Area path
        let areaPath = Skia.Path.Make();
        if (showArea) {
            const areaGenerator = d3.area<ChartDataPoint>()
                .x((_, i) => xScale(i))
                .y0(height - padding.bottom)
                .y1(d => yScale(d.y))
                .curve(curve);

            const areaPathString = areaGenerator(data) || '';
            areaPath = Skia.Path.MakeFromSVGString(areaPathString) || Skia.Path.Make();
        }

        return { linePath, areaPath };
    }, [data, xScale, yScale, curve, showArea, height, padding]);

    // ========================================================================
    // GRID LINES (Memoized)
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
    // ANIMATION (Reanimated)
    // ========================================================================
    const animationProgress = useSharedValue(animated ? 0 : 1);

    React.useEffect(() => {
        if (animated) {
            animationProgress.value = withTiming(1, { duration: 1000 });
        }
    }, [animated]);

    // ========================================================================
    // INTERACTION STATE (Reanimated Shared Values)
    // ========================================================================
    const touchX = useSharedValue(0);
    const touchY = useSharedValue(0);
    const isActive = useSharedValue(0);
    const selectedIndex = useSharedValue(-1);

    // ========================================================================
    // GESTURE HANDLER
    // ========================================================================
    const handlePointSelection = useCallback((index: number) => {
        if (onPointSelect && index >= 0 && index < data.length) {
            onPointSelect(data[index], index);
        }
    }, [data, onPointSelect]);

    const gesture = useMemo(() => Gesture.Pan()
        .runOnJS(false)
        .onStart((e) => {
            'worklet';
            isActive.value = withTiming(1, { duration: 150 });
            const idx = findClosestIndex(e.x, xPoints);
            selectedIndex.value = idx;
            touchX.value = xPoints[idx];
            touchY.value = yPoints[idx];
            if (onPointSelect) {
                runOnJS(handlePointSelection)(idx);
            }
        })
        .onUpdate((e) => {
            'worklet';
            const idx = findClosestIndex(e.x, xPoints);
            selectedIndex.value = idx;
            touchX.value = xPoints[idx];
            touchY.value = yPoints[idx];
        })
        .onEnd(() => {
            'worklet';
            isActive.value = withTiming(0, { duration: 150 });
        }), [xPoints, yPoints, onPointSelect, handlePointSelection]);

    // ========================================================================
    // DERIVED VALUES (UI Thread Calculations)
    // ========================================================================
    const lineP1 = useDerivedValue(() => vec(touchX.value, padding.top));
    const lineP2 = useDerivedValue(() => vec(touchX.value, height - padding.bottom));
    const pointPosition = useDerivedValue(() => vec(touchX.value, touchY.value));

    // Animated clip rect for entrance animation
    const clipRect = useDerivedValue(() =>
        Skia.XYWHRect(0, 0, width * animationProgress.value, height)
    );

    // ========================================================================
    // RENDER
    // ========================================================================
    if (!font) return null;

    return (
        <View style={[styles.container, { width, height }]}>
            <GestureDetector gesture={gesture}>
                <Canvas style={{ width, height }}>
                    <Group clip={clipRect}>
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

                        {/* Area Fill */}
                        {showArea && (
                            <Path path={areaPath}>
                                <LinearGradient
                                    start={vec(0, padding.top)}
                                    end={vec(0, height - padding.bottom)}
                                    colors={areaColors}
                                />
                            </Path>
                        )}

                        {/* Line */}
                        <Path
                            path={linePath}
                            style="stroke"
                            strokeWidth={3}
                            strokeCap="round"
                            strokeJoin="round"
                            color={lineColor}
                        />

                        {/* Data Points */}
                        {showPoints && xPoints.map((x, i) => (
                            <Circle
                                key={i}
                                cx={x}
                                cy={yPoints[i]}
                                r={4}
                                color={lineColor}
                            />
                        ))}

                        {/* Interactive Elements */}
                        <Group opacity={isActive}>
                            {/* Vertical Line */}
                            <Line
                                p1={lineP1}
                                p2={lineP2}
                                color="#ffffff40"
                                strokeWidth={1}
                            />

                            {/* Highlight Circle */}
                            <Circle c={pointPosition} r={8} color={lineColor} opacity={0.3} />
                            <Circle c={pointPosition} r={4} color="#ffffff" />
                        </Group>
                    </Group>
                </Canvas>
            </GestureDetector>
        </View>
    );
});

AdvancedLineChart.displayName = 'AdvancedLineChart';

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
    },
});

export default AdvancedLineChart;
