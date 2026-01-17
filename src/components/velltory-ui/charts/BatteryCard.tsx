import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

import { Zap, ChevronLeft } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BatteryCardProps {
    batteryPercentage?: number;
    title?: string;
    footer?: string;
    backgroundColor?: string;
}

const BatteryCard = ({
    batteryPercentage = 70,
    title = "Battery",
    footer = "+9% since wake-up",
    backgroundColor = '#064e3b'
}: BatteryCardProps) => {
    const segments = Array.from({ length: 10 }).map((_, i) => (i < Math.round(batteryPercentage / 10) ? 1 : 0));

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <View style={styles.header}>
                <Zap size={14} color="#ffffffcc" style={{ marginRight: 4 }} />
                <Text style={styles.title}>{title}</Text>
                <ChevronLeft size={16} color="#ffffff50" />
            </View>

            <View style={styles.valueRow}>
                <Text style={styles.percentage}>{batteryPercentage}</Text>
                <Text style={styles.percentSymbol}>%</Text>
            </View>

            <View style={styles.segmentContainer}>
                {segments.map((val, i) => (
                    <View
                        key={i}
                        style={[
                            styles.segment,
                            { backgroundColor: val ? '#10b981' : '#374151' }
                        ]}
                    />
                ))}
            </View>

            <Text style={styles.footer}>{footer}</Text>
        </View>
    );
};

export default BatteryCard;

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
        marginBottom: 12,
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
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    percentage: {
        color: '#ffffff',
        fontSize: 42,
        fontWeight: 'bold',
    },
    percentSymbol: {
        color: '#ffffffcc',
        fontSize: 20,
        marginLeft: 2,
    },
    segmentContainer: {
        flexDirection: 'row',
        gap: 2,
        marginBottom: 12,
    },
    segment: {
        height: 10,
        flex: 1,
        borderRadius: 2,
    },
    footer: {
        color: '#ffffff80',
        fontSize: 12,
    },
});
