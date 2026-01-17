import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Heart, Share2, MoreHorizontal } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WelltoryCardProps {
    title?: string;
    subtitle?: string;
    headerRight?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    showIcons?: boolean;
}

const WelltoryCard = ({
    title,
    subtitle,
    headerRight,
    children,
    footer,
    showIcons = true
}: WelltoryCardProps) => {
    return (
        <View style={styles.card}>
            {(title || headerRight) && (
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        {title && <Text style={styles.title}>{title}</Text>}
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </View>
                    {headerRight && (
                        typeof headerRight === 'string' ? (
                            <Text style={styles.headerRight}>{headerRight}</Text>
                        ) : (
                            headerRight
                        )
                    )}
                </View>
            )}

            <View style={styles.content}>
                {children}
            </View>

            {footer && <View style={styles.footer}>{footer}</View>}

            {showIcons && (
                <View style={styles.iconRow}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Heart size={20} color="#ffffff60" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Share2 size={20} color="#ffffff60" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <MoreHorizontal size={20} color="#ffffff60" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default WelltoryCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1a1a2e',
        borderRadius: 24,
        padding: 20,
        marginVertical: 10,
        width: SCREEN_WIDTH - 32,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#ffffff08',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        color: '#ffffff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: 14,
        marginTop: 4,
    },
    headerRight: {
        color: '#64748b',
        fontSize: 14,
    },
    content: {
        width: '100%',
    },
    footer: {
        marginTop: 20,
    },
    iconRow: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 20,
    },
    iconButton: {
        opacity: 0.6,
    },
    icon: {
        fontSize: 18,
    },
});
