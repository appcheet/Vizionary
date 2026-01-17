/**
 * Example: Using Advanced Charts in Welltory Dashboard
 * 
 * This demonstrates the optimal way to use the advanced chart system
 * following all best practices for performance and maintainability.
 */

import React, { useMemo, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AdvancedLineChart, AdvancedBarChart } from './advanced';
import type { ChartDataPoint, BarDataPoint } from './advanced';

const WelltoryAdvancedExample = () => {
    // ========================================================================
    // DATA GENERATION (Memoized)
    // ========================================================================

    // Heart Rate Data
    const heartRateData = useMemo<ChartDataPoint[]>(() =>
        Array.from({ length: 24 }, (_, i) => ({
            x: i,
            y: 60 + Math.sin(i / 3) * 30 + Math.random() * 15,
            hour: i,
            timestamp: Date.now() + i * 3600000,
        })),
        []);

    // Weekly Steps Data
    const weeklySteps = useMemo<BarDataPoint[]>(() => [
        { label: 'Mon', value: 8500, color: '#fbbf24' },
        { label: 'Tue', value: 12000, color: '#10b981' },
        { label: 'Wed', value: 9200, color: '#fbbf24' },
        { label: 'Thu', value: 11500, color: '#10b981' },
        { label: 'Fri', value: 7800, color: '#ef4444' },
        { label: 'Sat', value: 15000, color: '#10b981' },
        { label: 'Sun', value: 13200, color: '#10b981' },
    ], []);

    // HRV Trend Data
    const hrvData = useMemo<ChartDataPoint[]>(() =>
        Array.from({ length: 30 }, (_, i) => ({
            x: i,
            y: 50 + Math.sin(i / 5) * 20 + Math.random() * 10,
            day: i,
        })),
        []);

    // ========================================================================
    // EVENT HANDLERS (useCallback for performance)
    // ========================================================================

    const handleHeartRateSelect = useCallback((point: ChartDataPoint, index: number) => {
        const bpm = Math.round(point.y);
        const hour = point.hour;
        console.log(`Heart Rate: ${bpm} BPM at ${hour}:00`);
        // You can show a tooltip, update state, etc.
    }, []);

    const handleStepsSelect = useCallback((bar: BarDataPoint, index: number) => {
        const percentage = Math.round((bar.value / 10000) * 100);
        console.log(`${bar.label}: ${bar.value} steps (${percentage}% of goal)`);
    }, []);

    const handleHRVSelect = useCallback((point: ChartDataPoint, index: number) => {
        const hrv = Math.round(point.y);
        console.log(`HRV: ${hrv}ms on day ${point.day}`);
    }, []);

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Heart Rate Chart */}
            <Animated.View
                style={styles.section}
                entering={FadeInDown.delay(100).duration(600)}
            >
                <Text style={styles.sectionTitle}>Heart Rate - Last 24 Hours</Text>
                <Text style={styles.sectionSubtitle}>Tap and drag to explore</Text>

                <View style={styles.chartCard}>
                    <AdvancedLineChart
                        data={heartRateData}
                        lineColor="#ef4444"
                        areaColors={['#ef444440', '#ef444410']}
                        showArea={true}
                        showGrid={true}
                        animated={true}
                        onPointSelect={handleHeartRateSelect}
                    />
                </View>
            </Animated.View>

            {/* Weekly Steps Chart */}
            <Animated.View
                style={styles.section}
                entering={FadeInDown.delay(200).duration(600)}
            >
                <Text style={styles.sectionTitle}>Weekly Steps</Text>
                <Text style={styles.sectionSubtitle}>Goal: 10,000 steps/day</Text>

                <View style={styles.chartCard}>
                    <AdvancedBarChart
                        data={weeklySteps}
                        showGradient={true}
                        showGrid={true}
                        barRadius={8}
                        animated={true}
                        onBarSelect={handleStepsSelect}
                    />
                </View>
            </Animated.View>

            {/* HRV Trend Chart */}
            <Animated.View
                style={styles.section}
                entering={FadeInDown.delay(300).duration(600)}
            >
                <Text style={styles.sectionTitle}>HRV Trend - Last 30 Days</Text>
                <Text style={styles.sectionSubtitle}>Higher is better</Text>

                <View style={styles.chartCard}>
                    <AdvancedLineChart
                        data={hrvData}
                        lineColor="#8b5cf6"
                        areaColors={['#8b5cf640', '#8b5cf610']}
                        showArea={true}
                        showGrid={true}
                        animated={true}
                        onPointSelect={handleHRVSelect}
                    />
                </View>
            </Animated.View>

            {/* Performance Tips */}
            <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>⚡ Performance Optimized</Text>
                <Text style={styles.tipsText}>
                    • 60 FPS interactions{'\n'}
                    • GPU-accelerated rendering{'\n'}
                    • Minimal re-renders{'\n'}
                    • Worklet-based gestures
                </Text>
            </View>
        </ScrollView>
    );
};

export default WelltoryAdvancedExample;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1e',
    },
    content: {
        padding: 16,
        paddingBottom: 60,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 16,
    },
    chartCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    tipsCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#10b98140',
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10b981',
        marginBottom: 12,
    },
    tipsText: {
        fontSize: 14,
        color: '#94a3b8',
        lineHeight: 22,
    },
});
