// Type definitions for VictoryBarChart
import { StyleProp, ViewStyle } from 'react-native';

export interface ChartDimensions {
  width?: number;
  height?: number;
}

export interface DomainPadding {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

export interface ChartPadding {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

export interface TickCount {
  x?: number;
  y?: number;
}

export interface LabelOffset {
  x?: number;
  y?: number;
}

export interface AxisSide {
  x?: 'top' | 'bottom';
  y?: 'left' | 'right';
}

export interface AxisOptions {
  lineColor?: string;
  lineWidth?: number;
  tickCount?: TickCount;
  labelOffset?: LabelOffset;
  labelColor?: string;
  axisSide?: AxisSide;
  showGrid?: boolean;
  showAxes?: boolean;
  formatYLabel?: (value: number) => string;
  formatXLabel?: (value: string | number) => string;
  font?: any;
}

export interface BarStyle {
  width?: number;
  colors?: string[];
  roundedCorners?: {
    topLeft?: number;
    topRight?: number;
    bottomLeft?: number;
    bottomRight?: number;
  };
  opacity?: number;
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
}

export interface LineStyle {
  strokeWidth?: number;
  colors?: string[];
  opacity?: number;
  strokeCap?: 'butt' | 'round' | 'square';
  strokeJoin?: 'bevel' | 'miter' | 'round';
  curveType?: 'linear' | 'natural' | 'cardinal' | 'monotone' | 'bumpX' | 'bumpY' | 'cardinal50' | 'catmullRom' | 'catmullRom0' | 'catmullRom100' | 'monotoneX' | 'step' | 'basis';
  connectMissingData?: boolean;
  showPoints?: boolean;
  pointStyle?: {
    radius?: number;
    color?: string;
    strokeColor?: string;
    strokeWidth?: number;
  };
}

export interface CircleConfig {
  radius?: number;
  color?: string;
  opacity?: number;
}

export interface ActiveIndicatorStyle {
  show?: boolean;
  circle?: {
    outer?: CircleConfig;
    middle?: CircleConfig;
    inner?: CircleConfig;
  };
  line?: {
    color?: string;
    opacity?: number;
    strokeWidth?: number;
  };
  text?: {
    color?: string;
    fontSize?: number;
    fontPath?: any;
  };
  position?: {
    topOffset?: number;
    rightMargin?: number;
    rightAdjustment?: number;
  };
}

export interface TooltipStyle {
  show?: boolean;
  position?: 'inline' | 'overlay';
  container?: {
    backgroundColor?: string;
    borderRadius?: number;
    padding?: {
      horizontal?: number;
      vertical?: number;
    };
    margin?: {
      horizontal?: number;
      vertical?: number;
    };
    borderColor?: string;
    borderWidth?: number;
  };
  title?: {
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    fontFamily?: string;
  };
  subtitle?: {
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    fontFamily?: string;
  };
  separator?: {
    show?: boolean;
    color?: string;
    height?: number;
    marginVertical?: number;
  };
  valueFormatter?: (value: number, unit?: string) => string;
  dateFormatter?: (date: string | number) => string;
  animated?: boolean;
}

export interface AnimationConfig {
  enabled?: boolean;
  type?: 'timing' | 'spring';
  duration?: number;
  delay?: number;
}

export interface InteractionConfig {
  enabled?: boolean;
  pan?: {
    enabled?: boolean;
    dimensions?: 'x' | 'y' | 'xy';
  };
  pinch?: {
    enabled?: boolean;
    dimensions?: 'x' | 'y' | 'xy';
  };
  press?: {
    enabled?: boolean;
  };
}

export interface ResponsiveConfig {
  enabled?: boolean;
  breakpoints?: {
    small?: number;
    large?: number;
  };
}

export interface ChartData {
  [key: string]: any;
}

export interface ChartKeys {
  x: string;
  y: string | string[];
}

export interface CustomizableChartProps {
  data: ChartData[];
  keys: ChartKeys;
  chartType?: 'bar' | 'line';
  containerStyle?: StyleProp<ViewStyle>;
  dimensions?: ChartDimensions;
  domainPadding?: DomainPadding;
  chartPadding?: ChartPadding;
  axisOptions?: AxisOptions;
  domain?: { x?: [number, number]; y?: [number, number] };
  barStyle?: BarStyle;
  lineStyle?: LineStyle;
  activeIndicator?: ActiveIndicatorStyle;
  tooltip?: TooltipStyle;
  animation?: AnimationConfig;
  interaction?: InteractionConfig;
  unit?: string;
  responsive?: ResponsiveConfig;
  renderCustomIndicator?: (props: any) => React.ReactNode;
  renderCustomBar?: (props: any) => React.ReactNode;
  renderCustomLine?: (props: any) => React.ReactNode;
  onDataPointPress?: (data: any) => void;
  onChartPress?: (data: any) => void;
} 