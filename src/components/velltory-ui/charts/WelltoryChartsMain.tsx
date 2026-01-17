import { StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import React, { useMemo, useState } from 'react';
import { useScrollViewOffset } from 'react-native-reanimated';

// Layout Components
import WelcomeHeaderCard from './WelcomeHeaderCard';
import BatteryCard from './BatteryCard';
import ActivityScoreGauge from './ActivityScoreGauge';

// Chart Components
import SmoothAreaChart from './SmoothAreaChart';
import CircularGaugeWelltory from './CircularGaugeWelltory';
import MeditationComparisonChart from './MeditationComparisonChart';
import NormativeGraph from './NormativeGraph';
import HistogramChart from './HistogramChart';
import HeartReportDetails from './HeartReportDetails';
import StrengthTrainingCard from './StrengthTrainingCard';
import SleepAnalysisCard from './SleepAnalysisCard';
import ReportStoryCard from './ReportStoryCard';
import CorrelationChart from './CorrelationChart';
import FullDayHeartRateChart from './FullDayHeartRateChart';
import LiquidWellnessCard from './LiquidWellnessCard';
import HRVDetailMetrics from './HRVDetailMetrics';
import BatteryChartDetail from './BatteryChartDetail';
import HealthBarChart from './HealthBarChart';

// Existing Raw components for fallback/reference
import Animated, { FadeInDown } from 'react-native-reanimated';

/**
 * Lazy Chart Wrapper - Only renders when visible
 * This prevents "Should not already be working" errors
 */
const LazyChart = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
    const [isVisible, setIsVisible] = useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    if (!isVisible) {
        return <View style={{ height: 200, backgroundColor: '#1a1a2e20', borderRadius: 24, margin: 10 }} />;
    }

    return <>{children}</>;
};

const WelltoryChartsMain = () => {
    // Generate some random state for the hero card to show off dynamic themes
    const heroData = useMemo(() => ({
        stress: Math.floor(Math.random() * 100),
        energy: Math.floor(Math.random() * 100),
        health: Math.floor(Math.random() * 100),
    }), []);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Premium Animated Wave Card */}
            <Animated.View entering={FadeInDown.delay(50).duration(800)}>
                <LiquidWellnessCard
                    stress={heroData.stress}
                    energy={heroData.energy}
                    health={heroData.health}
                />
            </Animated.View>

            {/* Top Level Greeting */}
            <Animated.View entering={FadeInDown.delay(100).duration(800)}>
                <WelcomeHeaderCard />
            </Animated.View>

            {/* Quick Status Bar */}
            <Animated.View style={styles.statusRow} entering={FadeInDown.delay(200).duration(800)}>
                <BatteryCard />
                <ActivityScoreGauge />
            </Animated.View>

            {/* Detailed Battery Forecast - Lazy loaded */}
            <Animated.View style={styles.fullWidth} entering={FadeInDown.delay(250).duration(800)}>
                <LazyChart delay={300}>
                    <BatteryChartDetail />
                </LazyChart>
            </Animated.View>

            {/* Daily Summary Sections - Lazy loaded */}
            <Animated.View style={styles.fullWidth} entering={FadeInDown.delay(300).duration(800)}>
                <Text style={styles.sectionTitle}>Heart & Recovery</Text>
                <LazyChart delay={600}>
                    <FullDayHeartRateChart />
                </LazyChart>
                <LazyChart delay={900}>
                    <HeartReportDetails />
                </LazyChart>
                <HRVDetailMetrics />
            </Animated.View>

            <Animated.View style={styles.adviceContainer} entering={FadeInDown.delay(400).duration(800)}>
                <Text style={styles.adviceText}>
                    Efficiency reigned supreme yesterday. You dedicated your regular time to productive tasks and stayed true to your schedule.
                </Text>
            </Animated.View>

            <Animated.View style={styles.fullWidth} entering={FadeInDown.delay(500).duration(800)}>
                <Text style={styles.sectionTitle}>Workout Analysis</Text>
                <LazyChart delay={1200}>
                    <StrengthTrainingCard />
                </LazyChart>
            </Animated.View>

            <Animated.View style={styles.fullWidth} entering={FadeInDown.delay(600).duration(800)}>
                <Text style={styles.sectionTitle}>Sleep Insights</Text>
                <LazyChart delay={1500}>
                    <SleepAnalysisCard />
                </LazyChart>
            </Animated.View>

            <Animated.View style={styles.fullWidth} entering={FadeInDown.delay(700).duration(800)}>
                <Text style={styles.sectionTitle}>Long-term Comparison</Text>
                <LazyChart delay={1800}>
                    <HistogramChart />
                </LazyChart>
                <LazyChart delay={2100}>
                    <NormativeGraph />
                </LazyChart>
            </Animated.View>

            <Animated.View style={styles.fullWidth} entering={FadeInDown.delay(800).duration(800)}>
                <Text style={styles.sectionTitle}>Health Insights</Text>
                <LazyChart delay={2400}>
                    <HealthBarChart />
                </LazyChart>
                <CircularGaugeWelltory />
                <MeditationComparisonChart />
            </Animated.View>

            <Animated.View style={styles.fullWidth} entering={FadeInDown.delay(900).duration(800)}>
                <Text style={styles.sectionTitle}>Correlations</Text>
                <LazyChart delay={2700}>
                    <CorrelationChart />
                </LazyChart>
            </Animated.View>

            <Animated.View style={styles.fullWidth} entering={FadeInDown.delay(1000).duration(800)}>
                <Text style={styles.sectionTitle}>Activity Trends</Text>
                <LazyChart delay={3000}>
                    <SmoothAreaChart />
                </LazyChart>
            </Animated.View>

            <Animated.View style={styles.fullWidth} entering={FadeInDown.delay(1100).duration(800)}>
                <Text style={styles.sectionTitle}>Weekly Reports</Text>
                <ReportStoryCard />
            </Animated.View>
        </ScrollView>
    );
};

export default React.memo(WelltoryChartsMain);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1e', // Very dark background like Welltory
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        alignSelf: 'flex-start',
        marginTop: 30,
        marginBottom: 10,
        marginLeft: 4,
    },
    adviceContainer: {
        paddingHorizontal: 8,
        marginVertical: 15,
        width: '100%',
    },
    adviceText: {
        fontSize: 15,
        color: '#94a3b8',
        lineHeight: 24,
    },
    fullWidth: {
        width: '100%',
        alignItems: 'center',
    },
});