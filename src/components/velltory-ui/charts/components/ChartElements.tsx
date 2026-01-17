import React from 'react';
import { Group, Circle, BlurMask, Line, vec, Text as SkiaText } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

interface InteractiveMarkerProps {
    touchX: SharedValue<number>;
    touchY: SharedValue<number>;
    touchActive: SharedValue<number>;
    color?: string;
    size?: number;
    showGlow?: boolean;
}

/**
 * Reusable interactive marker component
 */
export const InteractiveMarker: React.FC<InteractiveMarkerProps> = ({
    touchX,
    touchY,
    touchActive,
    color = '#ffffff',
    size = 6,
    showGlow = true,
}) => {
    return (
        <Group opacity={touchActive}>
            {showGlow && (
                <Circle cx={touchX} cy={touchY} r={size} color={color}>
                    <BlurMask blur={8} style="normal" />
                </Circle>
            )}
            <Circle cx={touchX} cy={touchY} r={size / 2} color={color} />
        </Group>
    );
};

interface TooltipProps {
    touchX: SharedValue<number>;
    touchY: SharedValue<number>;
    touchActive: SharedValue<number>;
    text: SharedValue<string>;
    font: any;
    backgroundColor?: string;
    textColor?: string;
    offset?: { x: number; y: number };
}

/**
 * Reusable tooltip component
 */
export const Tooltip: React.FC<TooltipProps> = ({
    touchX,
    touchY,
    touchActive,
    text,
    font,
    textColor = '#ffffff',
    offset = { x: 10, y: -40 },
}) => {
    if (!font) return null;

    return (
        <Group opacity={touchActive}>
            <Group
                transform={[
                    { translateX: touchX.value + offset.x },
                    { translateY: touchY.value + offset.y }
                ]}
            >
                <SkiaText
                    x={0}
                    y={0}
                    text={text}
                    font={font}
                    color={textColor}
                />
            </Group>
        </Group>
    );
};

interface VerticalLineProps {
    x: SharedValue<number>;
    y1: number;
    y2: number;
    opacity: SharedValue<number>;
    color?: string;
    strokeWidth?: number;
}

/**
 * Reusable vertical guide line
 */
export const VerticalGuideLine: React.FC<VerticalLineProps> = ({
    x,
    y1,
    y2,
    opacity,
    color = '#ffffff30',
    strokeWidth = 1,
}) => {
    return (
        <Group opacity={opacity}>
            <Line
                p1={vec(x.value, y1)}
                p2={vec(x.value, y2)}
                color={color}
                strokeWidth={strokeWidth}
            />
        </Group>
    );
};

interface GridLinesProps {
    width: number;
    height: number;
    yValues: number[];
    color?: string;
    strokeWidth?: number;
    dashed?: boolean;
}

/**
 * Reusable grid lines component
 */
export const GridLines: React.FC<GridLinesProps> = ({
    width,
    height,
    yValues,
    color = '#ffffff08',
    strokeWidth = 1,
}) => {
    return (
        <Group>
            {yValues.map((y, i) => (
                <Line
                    key={i}
                    p1={vec(0, y)}
                    p2={vec(width, y)}
                    color={color}
                    strokeWidth={strokeWidth}
                />
            ))}
        </Group>
    );
};
