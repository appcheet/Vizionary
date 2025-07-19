// VictoryStackedBarChart.tsx

import React, { memo } from 'react';
import { View, Dimensions, StyleProp, ViewStyle } from 'react-native';
import {
    CartesianChart,
    StackedBar,
    useChartPressState,
} from 'victory-native';
import {
    useFont,
    Text as SkiaText,
    vec,
    Line as SkiaLine,
    Circle,
} from '@shopify/react-native-skia';
import Animated, { useDerivedValue } from 'react-native-reanimated';
import { formatXLabel } from '../../../utils/chartData';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FONT_SIZE = 16;
const RIGHT_MARGIN = 80;
const RIGHT_ADJUSTMENT = 10;

const domainPadding = {
    left: SCREEN_WIDTH < 360 ? 5 : 15,
    right: SCREEN_WIDTH < 360 ? 5 : 15,
    top: 20,
    bottom: 0,
};

const chartPadding = {
    left: 4,
    right: 4,
    top: 25,
    bottom: 0,
};

interface ChartData {
    label: string;
    [key: string]: number | string;
}

interface VictoryStackedBarChartProps {
    data: ChartData[];
    valueKeys: string[];
    colors: string[];
    customStyles?: StyleProp<ViewStyle>;
    barWidth?: number;
    labelColor?: string;
    unit?: string;
}

const ActiveStackedIndicator = ({
    xPosition,
    yPositions,
    top,
    bottom,
    values,
    colors,
    fontSize = 10,
    unit = '',
}: {
    xPosition: Animated.SharedValue<number>;
    yPositions: Animated.SharedValue<number>[];
    top: number;
    bottom: number;
    values: Animated.SharedValue<number | string>[];
    colors: string[];
    fontSize?: number;
    unit?: string;
}) => {
    const font = useFont(require('@assets/fonts/SFProDisplayRegular.ttf'), fontSize);

    const start = useDerivedValue(() => vec(xPosition.value, bottom));
    const end = useDerivedValue(() => vec(xPosition.value, top));

    const sharedVal = useDerivedValue(() => {
        return values
            .map((v) => `${Math.round(parseFloat(String(v.value)))}`)
            .join(', ');
    });

    const textWidth = useDerivedValue(() => font?.measureText(sharedVal.value)?.width || 0);

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
            <SkiaLine p1={start} p2={end} color="#999" strokeWidth={0.4} />
            {yPositions.map((y, idx) => (
                <Circle key={idx} cx={xPosition} cy={y} r={6} color={colors[idx]} />
            ))}
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

const VictoryStackedBarChart: React.FC<VictoryStackedBarChartProps> = ({
    data,
    valueKeys,
    colors,
    customStyles,
    barWidth = 6,
    labelColor = '#888',
    unit = '',
}) => {
    const font = useFont(require('@assets/fonts/SFProDisplayRegular.ttf'), 10);

    const { state, isActive } = useChartPressState({
        x: { label: '' },
        y: Object.fromEntries(valueKeys.map((key) => [key, 0])),
    });


    const getMaxMinValues = (data) => {
        // Find the max and min values for y-axis
        const allValues = data.reduce((acc, { protein, fat, carbs }) => {
          acc.push(protein, fat, carbs);
          return acc;
        }, []);
        
        const maxValue = Math.max(...allValues);
        const minValue = Math.min(...allValues);
      
        return { min: minValue, max: maxValue };
      };
      
      const { min, max } = getMaxMinValues(data);

    return (
        <View style={customStyles}>
            <CartesianChart
            frame={{ lineColor: 'rgba(128,128,128,0.09)' }}
                data={data}
                xKey="label"
                domain={{ y: [min - 10, max + 100] }}
                yKeys={valueKeys}
                chartPressState={state}
                axisOptions={{
                    font,
                    lineColor: 'rgba(128,128,128,0.07)',
                    lineWidth: 0.4,
                    tickCount: { x: 10, y: 5 },
                    labelOffset: { x: 2, y: 8 },
                    labelColor,
                    formatXLabel: (val: any) => formatXLabel(val as number),
                    formatYLabel: (val) => `${val}`,
                    axisSide: { x: 'bottom', y: 'right' },
                }}
                domainPadding={domainPadding}
                padding={chartPadding}
                renderOutside={({ chartBounds }) =>
                    isActive && (
                        <ActiveStackedIndicator
                            xPosition={state.x.position}
                            yPositions={valueKeys.map((k) => state.y[k].position)}
                            top={chartBounds.top}
                            bottom={chartBounds.bottom}
                            values={valueKeys.map((k) => state.y[k].value)}
                            colors={colors}
                            unit={unit}
                        />
                    )
                }
            >
                {({ points, chartBounds }) => (
                    <StackedBar
                        barWidth={barWidth}
                        chartBounds={chartBounds}
                        points={valueKeys.map((key) => points[key])}
                        colors={colors}
                        barOptions={({ isBottom, isTop }) =>
                            isTop
                                ? { roundedCorners: { topLeft: 6, topRight: 6 } }
                                : isBottom
                                    ? { roundedCorners: { bottomLeft: 6, bottomRight: 6 } }
                                    : {}
                        }
                    />
                )}
            </CartesianChart>
        </View>
    );
};

export default memo(VictoryStackedBarChart);