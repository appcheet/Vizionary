import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';


import { Heart, ChevronRight } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WelcomeHeaderProps {
    greeting?: string;
    subtext?: string;
    icon?: React.ReactNode;
}

const WelcomeHeaderCard = ({
    greeting = "Good Afternoon",
    subtext = "Your wellness scores are within your personal norm today",
    icon = <Heart size={24} color="#bef264" fill="#bef264" />
}: WelcomeHeaderProps) => {
    return (
        <LinearGradient
            colors={['#064e3b', '#065f46']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.container}
        >
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    {icon}
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.greeting}>{greeting}</Text>
                    <Text style={styles.subtext}>{subtext}</Text>
                </View>
                <ChevronRight size={20} color="#ffffff80" />
            </View>
        </LinearGradient>
    );
};

export default WelcomeHeaderCard;

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        padding: 20,
        marginVertical: 10,
        width: SCREEN_WIDTH - 32,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#ffffff20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heartIcon: {
        fontSize: 24,
    },
    textContainer: {
        flex: 1,
        marginLeft: 16,
    },
    greeting: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtext: {
        color: '#ffffffcc',
        fontSize: 14,
        marginTop: 4,
    },
    arrow: {
        color: '#ffffff80',
        fontSize: 20,
        marginLeft: 8,
    },
});
