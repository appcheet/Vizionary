import { StyleProp, ViewStyle } from 'react-native';

export interface LineChartDimensions {
  width?: number;
  height?: number;
}

export interface LineChartKeys {
  x: string;
  y: string | string[];
}

export interface CustomVictoryLineChartProps {
  data: { [key: string]: any }[];
  keys: LineChartKeys;
  containerStyle?: StyleProp<ViewStyle>;
  dimensions?: LineChartDimensions;
  domainPadding?: { left?: number; right?: number; top?: number; bottom?: number };
  chartPadding?: { left?: number; right?: number; top?: number; bottom?: number };
  axisOptions?: any;
  domain?: { x?: [number, number]; y?: [number, number] };
  lineStyle?: any;
  activeIndicator?: any;
  tooltip?: any;
  animation?: any;
  interaction?: any;
  unit?: string;
  responsive?: any;
  renderCustomIndicator?: (props: any) => React.ReactNode;
  renderCustomLine?: (props: any) => React.ReactNode;
  onDataPointPress?: (data: any) => void;
  onChartPress?: (data: any) => void;
}
