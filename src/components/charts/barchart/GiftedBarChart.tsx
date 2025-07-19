import React, { FC, memo } from 'react';
import {
    StyleProp,
    View,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { BarChart, BarChartPropsType } from 'react-native-gifted-charts';

type BarData = {
    label?: string;
    value?: number;
    frontColor?: string;
    sideColor?: string;
    topLabelComponent?: (() => React.ReactNode) | undefined;
    gradientColor?:string;
    spacing?:number;
};

interface GiftedBarChartProps extends Partial<BarChartPropsType> {
    data?: BarData[];
    customStyles?: StyleProp<ViewStyle>;
    barWidth?: number;
    barColor?: string;
    labelColor?: string;
    showXAxisLabels?: boolean;
    yAxisTextStyle?: StyleProp<TextStyle>;
    xAxisLabelTextStyle?: StyleProp<TextStyle>;
    showLine?: boolean;
    lineConfig?: BarChartPropsType['lineConfig'];
    roundedTop?: boolean;
}

const GiftedBarChart: FC<GiftedBarChartProps> = ({
    data = [],
    customStyles,
    barWidth = 16,
    barColor = '#177AD5',
    labelColor = '#6e6e6e',
    showXAxisLabels = true,
    yAxisTextStyle,
    xAxisLabelTextStyle,
    showLine = false,
    lineConfig,
    roundedTop = true,
    ...restProps
}) => {
    const chartData = data.map(bar => ({
        ...bar,
        frontColor: bar.frontColor || barColor,
    }));

    return (
        <View style={customStyles}>
            <BarChart
                data={chartData}
                barWidth={barWidth}
                showXAxisIndices={false}
                showYAxisIndices={false}
                xAxisLabelTextStyle={[{ color: labelColor }, xAxisLabelTextStyle]}
                yAxisTextStyle={yAxisTextStyle}
                isAnimated
                roundedTop={roundedTop}
                showLine={showLine}
                lineConfig={lineConfig}
                hideRules
                noOfSections={4}
                {...restProps}
            />
        </View>
    );
};

export default memo(GiftedBarChart);