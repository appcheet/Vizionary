import React, { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Modern Chart System
import { ModernLineChart, ModernBarChart } from './index';

// Existing Components (to be migrated)
import WelcomeHeaderCard from './WelcomeHeaderCard';
import BatteryCard from './BatteryCard';
import ActivityScoreGauge from './ActivityScoreGauge';
import LiquidWellnessCard from './LiquidWellnessCard';

/**
 * Example: Modern Dashboard using the new chart system
 * This demonstrates how to use the reusable charts with real data
 */
const ModernDashboardExample = () => {
    // Example: Heart Rate Data
    const heartRateData = useMemo(() =>
        Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            bpm: 60 + Math.sin(i / 3) * 30 + Math.random() * 20,
            timestamp: Date.now() + i * 3600000,
        })),
        []);

    // Example: Weekly Activity Data
    const weeklyActivity = useMemo(() => [
        { day: 'Mon', steps: 8500, goal: 10000, color: '#fbbf24' },
        { day: 'Tue', steps: 12000, goal: 10000, color: '#10b981' },
        { day: 'Wed', steps: 9200, goal: 10000, color: '#fbbf24' },
        { day: 'Thu', steps: 11500, goal: 10000, color: '#10b981' },
        { day: 'Fri', steps: 7800, goal: 10000, color: '#ef4444' },
        { day: 'Sat', steps: 15000, goal: 10000, color: '#10b981' },
        { day: 'Sun', steps: 13200, goal: 10000, color: '#10b981' },
    ], []);

    // Example: HRV Data
    const hrvData = useMemo(() =>
        Array.from({ length: 30 }, (_, i) => ({
            day: i,
            value: 50 + Math.sin(i / 5) * 20 + Math.random() * 10,
            date: new Date(Date.now() - (29 - i) * 86400000),
        })),
        []);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Hero Card */}
            <Animated.View entering={FadeInDown.delay(50).duration(800)}>
                <LiquidWellnessCard
                    stress={Math.floor(Math.random() * 100)}
                    energy={Math.floor(Math.random() * 100)}
                    health={Math.floor(Math.random() * 100)}
                />
            </Animated.View>

            {/* Welcome */}
            <Animated.View entering={FadeInDown.delay(100).duration(800)}>
                <WelcomeHeaderCard />
            </Animated.View>

            {/* Quick Stats */}
            <Animated.View style={styles.statusRow} entering={FadeInDown.delay(200).duration(800)}>
                <BatteryCard />
                <ActivityScoreGauge />
            </Animated.View>

            {/* Modern Heart Rate Chart */}
            <Animated.View entering={FadeInDown.delay(300).duration(800)}>
                <ModernLineChart
                    data={heartRateData}
                    xKey={(d) => d.hour}
                    yKey={(d) => d.bpm}
                    colors={['#ef4444', '#f97316', '#fbbf24', '#10b981']}
                    yDomain={[40, 180]}
                    showArea={true}
                    showGrid={true}
                    showMarker={true}
                    title="Heart Rate - Last 24 Hours"
                    subtitle="Tap and drag to explore"
                    onPointSelect={(index, data) => {
                        console.log(`${Math.round(data.bpm)} BPM at ${data.hour}:00`);
                    }}
                />
            </Animated.View>

            {/* Modern Weekly Activity Chart */}
            <Animated.View entering={FadeInDown.delay(400).duration(800)}>
                <ModernBarChart
                    data={weeklyActivity}
                    xKey="day"
                    yKey="steps"
                    colorKey={(d) => d.color}
                    yDomain={[0, 16000]}
                    showGradient={true}
                    showGrid={true}
                    barRadius={8}
                    title="Weekly Steps"
                    subtitle="Goal: 10,000 steps/day"
                    onBarSelect={(index, data) => {
                        const percentage = Math.round((data.steps / data.goal) * 100);
                        console.log(`${data.day}: ${data.steps} steps (${percentage}% of goal)`);
                    }}
                />
            </Animated.View>

            {/* Modern HRV Trend Chart */}
            <Animated.View entering={FadeInDown.delay(500).duration(800)}>
                <ModernLineChart
                    data={hrvData}
                    xKey={(d, i) => i}
                    yKey={(d) => d.value}
                    colors={['#8b5cf6', '#6366f1']}
                    showArea={true}
                    showGrid={true}
                    title="HRV Trend - Last 30 Days"
                    subtitle="Higher is better"
                    onPointSelect={(index, data) => {
                        const date = data.date.toLocaleDateString();
                        console.log(`${Math.round(data.value)}ms on ${date}`);
                    }}
                />
            </Animated.View>
        </ScrollView>
    );
};

export default ModernDashboardExample;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1e',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 60,
        alignItems: 'center',
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginVertical: 10,
        gap: 12,
    },
});
