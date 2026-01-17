export const generateRandomHeartData = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        timestamp: i,
        health: Math.floor(Math.random() * 40) + 60,
        energy: Math.floor(Math.random() * 50) + 30,
        stress: Math.floor(Math.random() * 60) + 20,
        value: Math.floor(Math.random() * 100),
    }));
};

export const generateRandomActivityData = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        label: (i + 1).toString(),
        value: Math.floor(Math.random() * 80) + 10,
    }));
};

export const generateRandomSleepData = () => {
    return {
        asleep: Math.floor(Math.random() * 20) + 70,
        wakeUps: Math.floor(Math.random() * 5),
        minHR: Math.floor(Math.random() * 10) + 40,
        stages: [
            { label: 'REM', value: Math.floor(Math.random() * 40) + 20, color: '#a855f7' },
            { label: 'Light', value: Math.floor(Math.random() * 120) + 180, color: '#6366f1' },
            { label: 'Deep', value: Math.floor(Math.random() * 60) + 60, color: '#3b82f6' },
            { label: 'Awake', value: Math.floor(Math.random() * 30) + 10, color: '#ffffff' },
        ]
    };
};

export const generateWorkoutData = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        timestamp: i,
        bpm: Math.floor(Math.random() * 80) + 80, // 80 - 160 bpm
    }));
};

export const generateCorrelationData = (count: number) => {
    const days = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'];
    return Array.from({ length: Math.min(count, days.length) }).map((_, i) => ({
        day: days[i],
        workTime: Math.floor(Math.random() * 8) + 2, // 2-10 hrs
        sdnn: Math.floor(Math.random() * 40) + 20, // 20-60 ms
        isBad: Math.random() > 0.7,
    }));
};

export const generateHistogramData = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        value: 20 + Math.sin(i / 5) * 40 + Math.random() * 30,
        isHighlight: i === 30,
    }));
};

export const generateNormativeData = (count: number) => {
    return Array.from({ length: count }).map(() => Math.floor(Math.random() * 50) + 40);
};

export const generateLineData = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        timestamp: `${10 + i}:00`,
        date: 'Nov',
        value: Math.floor(Math.random() * 70) + 15,
    }));
};

export const generateBarData = () => {
    return [
        { value: 5, label: '650' },
        { value: 15, label: '700' },
        { value: 75, label: '750' },
        { value: 45, label: '800' },
        { value: 10, label: '850' },
        { value: 2, label: '900' },
        { value: 0, label: '950' },
        { value: 0, label: '1000' },
    ].map(item => ({
        ...item,
        value: Math.floor(Math.random() * 80) * (item.value > 0 ? 1 : 0),
    }));
};

export const generateFullDayHRData = (count: number = 1000) => {
    return Array.from({ length: count }).map((_, i) => {
        // Simulate a full day (24 hours)
        const hour = (i / count) * 24;
        let baseHR = 60;

        // Simulate daily patterns: sleep (low), morning activity (medium), mid-day exercise (spike), evening rest
        if (hour < 6) baseHR = 50 + Math.random() * 10; // Sleep
        else if (hour < 9) baseHR = 70 + Math.random() * 20; // Waking up
        else if (hour < 11) baseHR = 130 + Math.random() * 40; // Workout spike
        else if (hour < 18) baseHR = 80 + Math.random() * 20; // Work/Day
        else if (hour < 22) baseHR = 70 + Math.random() * 15; // Evening
        else baseHR = 55 + Math.random() * 10; // Late night

        return {
            timestamp: i,
            hour,
            bpm: baseHR
        };
    });
};

export const generateSparklineData = (count: number = 10) => {
    return Array.from({ length: count }).map((_, i) => ({
        x: i,
        y: Math.random() * 50 + 20,
    }));
};

export const generateECGWaveform = (count: number = 100) => {
    return Array.from({ length: count }).map((_, i) => {
        // Create a noisy, oscillating heart rate pattern
        const base = 80;
        const oscillation = Math.sin(i * 0.5) * 20;
        const noise = Math.random() * 10 - 5;
        const spike = (i % 15 === 0) ? (Math.random() * 40 + 20) : 0;
        return {
            x: i,
            y: base + oscillation + noise + spike
        };
    });
};

export const generateBatteryDetailData = (count: number = 24) => {
    return Array.from({ length: count }).map((_, i) => {
        let value;
        if (i < 8) {
            // Sleep - battery recharging/high
            value = 60 + (i * 5) + Math.random() * 5;
        } else if (i < 18) {
            // Day - battery draining
            value = 100 - ((i - 8) * 8) + Math.random() * 10;
        } else {
            // Evening/Forecast
            value = 20 - ((i - 18) * 2) + Math.random() * 5;
        }
        return {
            hour: i,
            value: Math.max(Math.min(value, 100), 5),
            type: i < 8 ? 'charge' : i < 18 ? 'usage' : 'forecast'
        };
    });
};

export const generateHealthBarData = (count: number = 7) => {
    const labels = ['Sep', 'Oct', 'Nov', 'Dec'];
    return Array.from({ length: count }).map((_, i) => ({
        label: i < labels.length ? labels[i] : `Dec ${i - labels.length + 1}`,
        value: 70 + Math.random() * 25,
        color: Math.random() > 0.8 ? '#fbbf24' : '#10b981'
    }));
};
