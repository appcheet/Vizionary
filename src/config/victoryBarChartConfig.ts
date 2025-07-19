// Default config objects for VictoryBarChart
import { ChartDimensions, DomainPadding, ChartPadding, AxisOptions, BarStyle, LineStyle, ActiveIndicatorStyle, TooltipStyle, AnimationConfig, InteractionConfig, ResponsiveConfig } from '../types/victoryBarChart';

import { Dimensions } from 'react-native';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const defaultDimensions: ChartDimensions = {
  width: SCREEN_WIDTH,
  height: 300,
};

export const defaultDomainPadding: DomainPadding = {
  left: 20,
  right: 20,
  top: 10,
  bottom: 0,
};

export const defaultChartPadding: ChartPadding = {
  left: 5,
  right: 4,
  top: 20,
  bottom: 0,
};

export const defaultAxisOptions: AxisOptions = {
  lineColor: 'rgba(128, 128, 128, 0.069)',
  lineWidth: 0.4,
  tickCount: { x: 12, y: 6 },
  labelOffset: { x: 2, y: 8 },
  labelColor: '#666',
  axisSide: { x: 'bottom', y: 'right' },
  showGrid: true,
  showAxes: true,
};

export const defaultBarStyle: BarStyle = {
  width: 7,
  colors: ['#26A2FB', '#26A2FB'],
  roundedCorners: { topLeft: 2, topRight: 2 },
  opacity: 1,
};

export const defaultLineStyle: LineStyle = {
  strokeWidth: 2,
  colors: ['#26A2FB'],
  opacity: 1,
  strokeCap: 'round',
  strokeJoin: 'round',
  curveType: 'natural',
  connectMissingData: false,
  showPoints: true,
  pointStyle: {
    radius: 4,
    color: '#26A2FB',
    strokeColor: '#fff',
    strokeWidth: 2,
  },
};

export const defaultActiveIndicator: ActiveIndicatorStyle = {
  show: true,
  circle: {
    outer: { radius: 8, color: '#ffa9a9', opacity: 1 },
    middle: { radius: 5, color: '#e40000', opacity: 1 },
    inner: { radius: 3, color: '#fff', opacity: 1 },
  },
  line: {
    color: '#666',
    opacity: 0.3,
    strokeWidth: 0.5,
  },
  text: {
    color: '#666',
    fontSize: 10,
  },
  position: {
    topOffset: 0,
    rightMargin: 80,
    rightAdjustment: 10,
  },
};

export const defaultTooltip: TooltipStyle = {
  show: true,
  position: 'inline',
  container: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: { horizontal: 20, vertical: 12 },
    margin: { horizontal: 0, vertical: 0 },
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  separator: {
    show: true,
    color: '#e0e0e0',
    height: 1,
    marginVertical: 12,
  },
  animated: true,
};

export const defaultAnimation: AnimationConfig = {
  enabled: true,
  type: 'timing',
  duration: 1000,
};

export const defaultInteraction: InteractionConfig = {
  enabled: true,
  pan: { enabled: true, dimensions: 'x' },
  pinch: { enabled: true, dimensions: 'x' },
  press: { enabled: true },
};

export const defaultResponsive: ResponsiveConfig = {
  enabled: true,
  breakpoints: { small: 360, large: 600 },
}; 