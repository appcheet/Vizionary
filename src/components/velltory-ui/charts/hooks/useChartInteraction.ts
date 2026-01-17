import { useSharedValue, useDerivedValue, withTiming, withSpring, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { useMemo, useCallback } from 'react';

export interface UseInteractiveChartConfig {
    data: any[];
    xPoints: number[];
    onIndexChange?: (index: number) => void;
    snapThreshold?: number;
    animationDuration?: number;
}

/**
 * Reusable hook for interactive chart gestures
 * Provides pan gesture handling with automatic snapping to data points
 */
export const useInteractiveChart = ({
    data,
    xPoints,
    onIndexChange,
    snapThreshold = 30,
    animationDuration = 200,
}: UseInteractiveChartConfig) => {
    const touchX = useSharedValue(0);
    const touchActive = useSharedValue(0);
    const selectedIndex = useSharedValue(data.length - 1);

    const handleTouch = useCallback((x: number, isInitial = false) => {
        'worklet';
        let closestIndex = 0;
        let minDistance = Infinity;

        xPoints.forEach((px, i) => {
            const dist = Math.abs(px - x);
            if (dist < minDistance) {
                minDistance = dist;
                closestIndex = i;
            }
        });

        if (minDistance < snapThreshold || snapThreshold === Infinity) {
            if (isInitial) {
                touchX.value = withTiming(xPoints[closestIndex], { duration: animationDuration });
            } else {
                touchX.value = xPoints[closestIndex];
            }
            selectedIndex.value = closestIndex;

            if (onIndexChange) {
                runOnJS(onIndexChange)(closestIndex);
            }
        }
    }, [xPoints, snapThreshold, animationDuration, onIndexChange]);

    const gesture = useMemo(() => Gesture.Pan()
        .runOnJS(false)
        .onStart((e) => {
            'worklet';
            touchActive.value = withTiming(1, { duration: animationDuration });
            handleTouch(e.x, true);
        })
        .onUpdate((e) => {
            'worklet';
            handleTouch(e.x);
        })
        .onEnd(() => {
            'worklet';
            touchActive.value = withTiming(0, { duration: animationDuration });
        }), [handleTouch, animationDuration]);

    return {
        touchX,
        touchActive,
        selectedIndex,
        gesture,
        handleTouch,
    };
};

/**
 * Hook for tap-based interactions (e.g., buttons, gauges)
 */
export const useTapInteraction = (onTap?: () => void) => {
    const touchActive = useSharedValue(0);

    const gesture = useMemo(() => Gesture.Tap()
        .onStart(() => {
            'worklet';
            touchActive.value = withSpring(1, { damping: 10 });
            if (onTap) {
                runOnJS(onTap)();
            }
        })
        .onEnd(() => {
            'worklet';
            touchActive.value = withSpring(0, { damping: 10 });
        }), [onTap]);

    const scaleStyle = useDerivedValue(() => ({
        transform: [{ scale: 1 + touchActive.value * 0.05 }]
    }));

    return {
        touchActive,
        gesture,
        scaleStyle,
    };
};

/**
 * Hook for animated chart entry
 */
export const useChartAnimation = (duration = 1000) => {
    const progress = useSharedValue(0);

    const startAnimation = useCallback(() => {
        progress.value = withTiming(1, { duration });
    }, [duration]);

    return {
        progress,
        startAnimation,
    };
};

/**
 * Hook for tooltip positioning
 */
export const useTooltip = (touchX: any, touchY: any, offset = { x: 10, y: -40 }) => {
    const tooltipTransform = useDerivedValue(() => [
        { translateX: touchX.value + offset.x },
        { translateY: touchY.value + offset.y }
    ]);

    return { tooltipTransform };
};
