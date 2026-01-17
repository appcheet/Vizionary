import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';


import { X, MoreHorizontal, Activity } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ReportStoryProps {
    title?: string;
    time?: string;
    mainTitle?: string;
    subTitle?: string;
    icon?: React.ReactNode;
}

const ReportStoryCard = ({
    title = "Norm report",
    time = "today, 22:30",
    mainTitle = "You started moving more in March",
    subTitle = "What has become new norm for your body",
    icon = <Activity size={48} color="#10b981" />
}: ReportStoryProps) => {
    return (
        <LinearGradient
            colors={['#1e293b', '#0f172a']}
            style={styles.container}
        >
            <View style={styles.header}>
                <X color="#ffffff80" size={20} />
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <Text style={styles.headerSub}>{time}</Text>
                </View>
                <MoreHorizontal color="#ffffff80" size={20} />
            </View>

            <View style={styles.centerContent}>
                <View style={styles.iconCircle}>
                    {icon}
                </View>
                <Text style={styles.mainTitle}>{mainTitle}</Text>
                <Text style={styles.subTitle}>{subTitle}</Text>
            </View>

            <View style={styles.tabContainer}>
                <View style={[styles.tab, styles.activeTab]}>
                    <Text style={styles.activeTabText}>Training</Text>
                </View>
                <View style={styles.tab}>
                    <Text style={styles.tabText}>Activity</Text>
                </View>
                <View style={styles.tab}>
                    <Text style={styles.tabText}>Sleep</Text>
                </View>
                <View style={styles.tab}>
                    <Text style={styles.tabText}>Meditation</Text>
                </View>
            </View>
        </LinearGradient>
    );
};

export default ReportStoryCard;

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        padding: 24,
        marginVertical: 10,
        height: 500,
        width: SCREEN_WIDTH - 32,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    closeIcon: {
        color: '#ffffff80',
        fontSize: 20,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    headerSub: {
        color: '#64748b',
        fontSize: 12,
    },
    moreIcon: {
        color: '#ffffff80',
        fontSize: 20,
    },
    centerContent: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#10b98130',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#10b98150',
    },
    runningIcon: {
        fontSize: 48,
    },
    mainTitle: {
        color: '#ffffff',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 40,
    },
    subTitle: {
        color: '#94a3b8',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 12,
    },
    tabContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    tab: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#334155',
    },
    activeTab: {
        backgroundColor: '#bef264',
    },
    tabText: {
        color: '#94a3b8',
        fontSize: 12,
    },
    activeTabText: {
        color: '#000000',
        fontSize: 12,
        fontWeight: '600',
    },
});
