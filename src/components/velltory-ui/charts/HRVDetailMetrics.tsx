import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MetricSparklineChart from './MetricSparklineChart';

const HRVDetailMetrics = () => {
    return (
        <View style={styles.container}>
            <MetricSparklineChart
                label="Heart Rate"
                value="117 bpm"
                status="Tachycardia"
                statusColor="#ef4444"
                range="45—100 bpm"
                description="Your heart is beating very fast."
                lineColor="#f97316"
                isECG={true}
            />

            <MetricSparklineChart
                label="Mean RR"
                value="514 ms"
                status="Overstrained"
                statusColor="#ef4444"
                range="666—1364 ms"
                description="Looks like you overdid it or are starting to get sick. The average time between your heartbeats is relatively short."
                lineColor="#ef4444"
            />

            <MetricSparklineChart
                label="RMSSD"
                value="19.5 ms"
                status="Strained"
                statusColor="#ef4444"
                range="20—89 ms"
                description="Your body is barely recovering at all. The parasympathetic nervous system, which is responsible for relaxation, isn't active enough."
                lineColor="#10b981"
            />

            <MetricSparklineChart
                label="pNN50"
                value="0%"
                status="Overstrained"
                statusColor="#fbbf24"
                range="5—40%"
                description="Your body's current state is very unstable. This can happen if you're tired or stressed."
                lineColor="#fbbf24"
            />

            <MetricSparklineChart
                label="MxDMn"
                value="0.05 s"
                status="Strained"
                statusColor="#fbbf24"
                range="0.12—0.46 s"
                description="This happens when something stressed you out. It looks like your brain and sympathetic nervous system are in charge of your heart."
                lineColor="#fbbf24"
            />

            <MetricSparklineChart
                label="Moda"
                value="525 ms"
                status="Strained"
                statusColor="#ef4444"
                range="666—1364 ms"
                description="Your body is most likely under a lot of pressure. The more your Moda value differs from your Mean RR, the harder it is for your body's systems to run smoothly."
                lineColor="#ef4444"
            />
        </View>
    );
};

export default HRVDetailMetrics;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#1a1a2e',
        borderRadius: 24,
        padding: 16,
        marginVertical: 10,
    }
});
