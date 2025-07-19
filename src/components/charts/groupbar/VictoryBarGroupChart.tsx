import React, { memo } from 'react';
import { View, Dimensions, StyleProp, ViewStyle } from 'react-native';
import {
    CartesianChart,
    BarGroup,
    useChartPressState,
} from 'victory-native';
import { useFont, Text as SkiaText, vec, Line as SkiaLine, Circle } from '@shopify/react-native-skia';
import Animated, { useDerivedValue } from 'react-native-reanimated';
import { formatXLabel } from '../../../utils/chartData';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FONT_SIZE = 16;
const RIGHT_MARGIN = 80;
const RIGHT_ADJUSTMENT = 10;

const isSmall = SCREEN_WIDTH < 360;
const isLarge = SCREEN_WIDTH > 600;

const domainPadding = {
    left: isSmall ? 5 : isLarge ? 25 : 15,
    right: isSmall ? 5 : isLarge ? 25 : 15,
    top: 10,
    bottom: 0,
};

const chartPadding = {
    left: 20,
    right: 20,
    top: 10,
    bottom: 0,
};

type BarGroupData = {
    label: string;
    value1: number;
    value2: number;
};

interface VictoryBarGroupChartProps {
    data: BarGroupData[];
    customStyles?: StyleProp<ViewStyle>;
    barWidth?: number;
    labelColor?: string;
    colors?: [string, string]; // colors for value1 and value2
}


interface ActiveGroupIndicatorProps {
    xPosition: Animated.SharedValue<number>;
    y1Position: Animated.SharedValue<number>;
    y2Position: Animated.SharedValue<number>;
    top: number;
    bottom: number;
    value1: Animated.SharedValue<number>;
    value2: Animated.SharedValue<number>;
    colors: [string, string];
    unit?: string;
    fontSize?: number;
}



const ActiveGroupIndicator: React.FC<ActiveGroupIndicatorProps> = ({
    xPosition,
    y1Position,
    y2Position,
    top,
    bottom,
    value1,
    value2,
    colors,
    unit = '',
    fontSize = 10,
}) => {
    const font = useFont(require('../../../assets/fonts/SFProDisplayRegular.ttf'), 10);

    const start = useDerivedValue(() => vec(xPosition.value, bottom));
    const end = useDerivedValue(() => vec(xPosition.value, top));

    const sharedVal = useDerivedValue(() => {
        const val1 = value1.value;
        const val2 = value2.value;
        const finalVal = `${Math.round(val1)}, ${Math.round(val2)}`;
        return String(finalVal);
    });


    const textWidth = useDerivedValue(() => font?.measureText(sharedVal.value).width || 0);

    const activeValueX = useDerivedValue(() => {
        const half = textWidth.value / 2;
        let pos = xPosition.value - half;
        if (pos < 0) return 0;
        if (pos + textWidth.value > SCREEN_WIDTH - RIGHT_MARGIN) {
            return SCREEN_WIDTH - textWidth.value - RIGHT_MARGIN - RIGHT_ADJUSTMENT;
        }
        return pos;
    });

    return (
        <>
            <SkiaLine p1={start} p2={end} color={'#999'} strokeWidth={0.4} />
            <Circle cx={xPosition} cy={y1Position} r={6} color={colors[0]} />
            <Circle cx={xPosition} cy={y2Position} r={6} color={colors[1]} />

            {font && (
                <SkiaText
                    x={activeValueX}
                    y={top + FONT_SIZE}
                    text={sharedVal}
                    color="black"
                    font={font}
                />
            )}

        </>
    );
};



const VictoryBarGroupChart: React.FC<VictoryBarGroupChartProps> = ({
    data,
    customStyles,
    barWidth = 6,
    labelColor = '#888',
    colors = ['#4A90E2', '#F5A623'],
}) => {
    const font = useFont(require('../../../assets/fonts/SFProDisplayRegular.ttf'), 10);
    const { state, isActive } = useChartPressState({
        x: '',
        y: {
            value1: 0,
            value2: 0,
        },
    });

    return (
        <View style={customStyles}>
            <CartesianChart
                data={data}
                xKey="label"
                yKeys={['value1', 'value2']}
                chartPressState={state}
                frame={{ lineColor: 'rgba(128,128,128,0.09)' }}
                axisOptions={{
                    font,
                    lineColor: 'rgba(128,128,128,0.07)',
                    lineWidth: 0.4,
                    tickCount: { x: 10, y: 5 },
                    labelOffset: { x: 2, y: 8 },
                    labelColor,
                    formatXLabel: val => formatXLabel(val as string),
                    formatYLabel: val => `${val}`,
                    axisSide: { x: 'bottom', y: 'right' },
                }}
                domainPadding={domainPadding}
                padding={chartPadding}
                renderOutside={({ chartBounds }) =>
                    isActive && (
                        <ActiveGroupIndicator
                            xPosition={state.x.position}
                            y1Position={state.y.value1.position}
                            y2Position={state.y.value2.position}
                            top={chartBounds.top}
                            bottom={chartBounds.bottom}
                            value1={state.y.value1.value}
                            value2={state.y.value2.value}
                            colors={colors}
                            unit="kg"
                        />
                    )
                }

            >
                {({ points, chartBounds }) => (
                    <BarGroup
                        chartBounds={chartBounds}
                        barWidth={barWidth}
                        betweenGroupPadding={0.3}
                        withinGroupPadding={0.12}
                    >
                        <BarGroup.Bar points={points.value1} color={colors[0]} />
                        <BarGroup.Bar points={points.value2} color={colors[1]} />
                    </BarGroup>
                )}
            </CartesianChart>
        </View>
    );
};

export default memo(VictoryBarGroupChart);