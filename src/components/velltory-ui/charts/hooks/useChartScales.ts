import * as d3 from 'd3';
import { useMemo } from 'react';
import { Skia } from '@shopify/react-native-skia';

export interface ScaleConfig {
    domain: [number, number] | string[];
    range: [number, number];
}

/**
 * Reusable hook for creating D3 scales
 */
export const useScale = (type: 'linear' | 'band' | 'point', config: ScaleConfig) => {
    return useMemo(() => {
        switch (type) {
            case 'linear':
                return d3.scaleLinear()
                    .domain(config.domain as [number, number])
                    .range(config.range);
            case 'band':
                return d3.scaleBand()
                    .domain(config.domain as string[])
                    .range(config.range)
                    .padding(0.2);
            case 'point':
                return d3.scalePoint()
                    .domain(config.domain as string[])
                    .range(config.range);
            default:
                return d3.scaleLinear()
                    .domain(config.domain as [number, number])
                    .range(config.range);
        }
    }, [type, JSON.stringify(config)]);
};

/**
 * Hook for creating Skia paths from data
 */
export const useLinePath = <T,>(
    data: T[],
    xAccessor: (d: T, i: number) => number,
    yAccessor: (d: T) => number,
    curve: any = d3.curveMonotoneX
) => {
    return useMemo(() => {
        const lineGenerator = d3.line<T>()
            .x(xAccessor)
            .y(yAccessor)
            .curve(curve);

        const pathString = lineGenerator(data) || '';
        return Skia.Path.MakeFromSVGString(pathString) || Skia.Path.Make();
    }, [data, xAccessor, yAccessor, curve]);
};

/**
 * Hook for creating area paths
 */
export const useAreaPath = <T,>(
    data: T[],
    xAccessor: (d: T, i: number) => number,
    y0Accessor: (d: T) => number,
    y1Accessor: (d: T) => number,
    curve: any = d3.curveMonotoneX
) => {
    return useMemo(() => {
        const areaGenerator = d3.area<T>()
            .x(xAccessor)
            .y0(y0Accessor)
            .y1(y1Accessor)
            .curve(curve);

        const pathString = areaGenerator(data) || '';
        return Skia.Path.MakeFromSVGString(pathString) || Skia.Path.Make();
    }, [data, xAccessor, y0Accessor, y1Accessor, curve]);
};

/**
 * Hook for calculating data points positions
 */
export const useDataPoints = <T,>(
    data: T[],
    xScale: any,
    yScale: any,
    xKey: keyof T | ((d: T, i: number) => any),
    yKey: keyof T | ((d: T) => any)
) => {
    const xAccessor = typeof xKey === 'function' ? xKey : (_: T, i: number) => i;
    const yAccessor = typeof yKey === 'function' ? yKey : (d: T) => d[yKey];

    const xPoints = useMemo(() =>
        data.map((d, i) => xScale(xAccessor(d, i))),
        [data, xScale, xAccessor]);

    const yPoints = useMemo(() =>
        data.map((d) => yScale(yAccessor(d))),
        [data, yScale, yAccessor]);

    return { xPoints, yPoints };
};

/**
 * Hook for responsive chart dimensions
 */
export const useChartDimensions = (
    screenWidth: number,
    aspectRatio: number = 1.5,
    padding = { top: 20, right: 20, bottom: 40, left: 20 }
) => {
    return useMemo(() => {
        const chartWidth = screenWidth - 64; // Standard padding
        const chartHeight = chartWidth / aspectRatio;

        return {
            width: chartWidth,
            height: chartHeight,
            padding,
            innerWidth: chartWidth - padding.left - padding.right,
            innerHeight: chartHeight - padding.top - padding.bottom,
        };
    }, [screenWidth, aspectRatio, padding]);
};
