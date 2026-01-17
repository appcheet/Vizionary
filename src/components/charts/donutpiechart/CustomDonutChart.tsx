import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { SharedValue, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { Canvas, Path, SkFont, Skia, Text as SkiaText, useFont } from '@shopify/react-native-skia';

// constants
const RADIUS = 160;
const STROKE_WIDTH = 30;
const OUTER_STROKE_WIDTH = 46;
const GAP = 0.04;
// constants 



// Types ===============================
type DonutChartProps = {
    n: number;
    gap: number;
    radius: number;
    strokeWidth: number;
    outerStrokeWidth: number;
    decimals: SharedValue<number[]>;
    colors: string[];
    totalValue: SharedValue<number>;
    font: SkFont;
    smallFont: SkFont;
};

type DonutPathProps = {
    strokeWidth: number;
    outerStrokeWidth: number;
    gap: number;
    radius: number;
    color: string;
    decimals: SharedValue<number[]>;
    index: number;
};



interface Data {
    value: number;
    percentage: number;
    color: string;
}

// Types ===============================


// components ===================
const DonutPath = ({
    radius,
    gap,
    strokeWidth,
    outerStrokeWidth,
    color,
    decimals,
    index,
}: DonutPathProps) => {
    const innerRadius = radius - outerStrokeWidth / 2;

    const path = Skia.Path.Make();
    path.addCircle(radius, radius, innerRadius);

    const start = useDerivedValue(() => {
        if (index === 0) {
            return gap;
        }
        const decimal = decimals.value.slice(0, index);

        const sum = decimal.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        );

        return withTiming(sum + gap, {
            duration: 1000,
        });
    }, []);

    const end = useDerivedValue(() => {
        if (index === decimals.value.length - 1) {
            return withTiming(1, { duration: 1000 });
        }

        const decimal = decimals.value.slice(0, index + 1);

        const sum = decimal.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        );

        return withTiming(sum, {
            duration: 1000,
        });
    }, []);

    return (
        <Path
            path={path}
            color={color}
            style="stroke"
            strokeJoin="round"
            strokeWidth={strokeWidth}
            strokeCap="round"
            start={start}
            end={end}
        />
    );
};

const DonutChart = ({
    n,
    gap,
    decimals,
    colors,
    totalValue,
    strokeWidth,
    outerStrokeWidth,
    radius,
    font,
    smallFont,
}: DonutChartProps) => {
    const array = Array.from({ length: n });
    const innerRadius = radius - outerStrokeWidth / 2;

    const path = Skia.Path.Make();
    path.addCircle(radius, radius, innerRadius);

    const targetText = useDerivedValue(
        () => `$${Math.round(totalValue.value)}`,
        [],
    );

    const fontSize = font.measureText('$00');
    const smallFontSize = smallFont.measureText('Total Spent');

    const textX = useDerivedValue(() => {
        const _fontSize = font.measureText(targetText.value);
        return radius - _fontSize.width / 2;
    }, []);

    return (
        <View style={styles.container}>
            <Canvas style={styles.container}>
                <Path
                    path={path}
                    color="#f4f7fc"
                    style="stroke"
                    strokeJoin="round"
                    strokeWidth={outerStrokeWidth}
                    strokeCap="round"
                    start={0}
                    end={1}
                />
                {array.map((_, index) => {
                    return (
                        <DonutPath
                            key={index}
                            radius={radius}
                            strokeWidth={strokeWidth}
                            outerStrokeWidth={outerStrokeWidth}
                            color={colors[index]}
                            decimals={decimals}
                            index={index}
                            gap={gap}
                        />
                    );
                })}
                <SkiaText
                    x={radius - smallFontSize.width / 2}
                    y={radius + smallFontSize.height / 2 - fontSize.height / 1.2}
                    text={'Total Spent'}
                    font={smallFont}
                    color="black"
                />
                <SkiaText
                    x={textX}
                    y={radius + fontSize.height / 2}
                    text={targetText}
                    font={font}
                    color="black"
                />
            </Canvas>
        </View>
    );
};



// components ===================

// utils =========
function calculatePercentage(
    numbers: number[],
    total: number,
): number[] {
    const percentageArray: number[] = [];

    numbers.forEach(number => {
        const percentage = Math.round((number / total) * 100);

        percentageArray.push(percentage);
    });

    return percentageArray;
}


function generateRandomNumbers(n: number): number[] {
    const min = 100;
    const max = 500;
    const result: number[] = [];

    for (let i = 0; i < n; i++) {
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        result.push(randomNumber);
    }

    return result;
}
// utils =================




//  Main Container ==========
const CustomDonutChart = () => {

    const n = 5;
    const [data, setData] = useState<Data[]>([]);
    const totalValue = useSharedValue(0);
    const decimals = useSharedValue<number[]>([]);
    const colors = ['#fe769c', '#46a0f8', '#c3f439', '#88dabc', '#e43433'];

    const generateData = () => {
        const generateNumbers = generateRandomNumbers(n);
        const total = generateNumbers.reduce(
            (acc, currentValue) => acc + currentValue,
            0,
        );
        const generatePercentages = calculatePercentage(generateNumbers, total);
        const generateDecimals = generatePercentages.map(
            number => Number(number.toFixed(0)) / 100,
        );
        totalValue.value = withTiming(total, { duration: 1000 });
        decimals.value = [...generateDecimals];

        const arrayOfObjects = generateNumbers.map((value, index) => ({
            value,
            percentage: generatePercentages[index],
            color: colors[index],
        }));

        setData(arrayOfObjects);
    };


    const font = useFont(require('../../../assets/fonts/SFProDisplayRegular.ttf'), 60);
    const smallFont = useFont(require('../../../assets/fonts/SFProDisplayRegular.ttf'), 25);

    if (!font || !smallFont) {
        return <View />;
    }

    return (
        <View style={[styles.container, { maxHeight: 300, marginTop: 20, marginBottom: 40 }]}>
            <View style={styles.chartContainer}>
                <DonutChart
                    radius={RADIUS}
                    gap={GAP}
                    strokeWidth={STROKE_WIDTH}
                    outerStrokeWidth={OUTER_STROKE_WIDTH}
                    font={font}
                    smallFont={smallFont}
                    totalValue={totalValue}
                    n={n}
                    decimals={decimals}
                    colors={colors}
                />

                <TouchableOpacity onPress={generateData} style={styles.button}>
                    <Text style={styles.buttonText}>Generate</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default CustomDonutChart

const styles = StyleSheet.create({
    container: { flex: 1 },
    chartContainer: {
        width: RADIUS * 2,
        height: RADIUS * 2,
        marginTop: 10,
    },
    button: {
        borderRadius: 10,
        position:'absolute',
        right:10,
        top:-12,
        height:48,
    },
    buttonText: {
        color: 'blue',
        fontSize: 14,
        fontWeight:'700'
    },
})