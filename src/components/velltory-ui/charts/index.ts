// Modern Chart Components
export { ModernLineChart } from './components/ModernLineChart';
export { ModernBarChart } from './components/ModernBarChart';

// Reusable Chart Elements
export {
    InteractiveMarker,
    Tooltip,
    VerticalGuideLine,
    GridLines,
} from './components/ChartElements';

// Hooks
export {
    useInteractiveChart,
    useTapInteraction,
    useChartAnimation,
    useTooltip,
} from './hooks/useChartInteraction';

export {
    useScale,
    useLinePath,
    useAreaPath,
    useDataPoints,
    useChartDimensions,
} from './hooks/useChartScales';

// Types
export type { UseInteractiveChartConfig } from './hooks/useChartInteraction';
export type { ScaleConfig } from './hooks/useChartScales';
export type { ModernLineChartProps } from './components/ModernLineChart';
export type { ModernBarChartProps } from './components/ModernBarChart';
