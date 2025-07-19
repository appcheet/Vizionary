import { StyleProp, ViewStyle } from "react-native";

// Types
export interface ChartDimensions {
    width?: number;
    height?: number;
  }
  
 export  interface DomainPadding {
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
  
  export interface AxisOptions {
    font?: any;
    lineColor?: string;
    lineWidth?: number;
    tickCount?: { x?: number; y?: number };
    labelOffset?: { x?: number; y?: number };
    labelColor?: string;
    formatYLabel?: (val: number) => string;
    formatXLabel?: (val: string | number) => string;
    axisSide?: { x?: 'top' | 'bottom'; y?: 'left' | 'right' };
    showGrid?: boolean;
    showAxes?: boolean;
  }
  
  export interface BarStyle {
    width?: number;
    colors?: string[];
    gradientStart?: { x: number; y: number };
    gradientEnd?: { x: number; y: number };
    roundedCorners?: {
      topLeft?: number;
      topRight?: number;
      bottomLeft?: number;
      bottomRight?: number;
    };
    opacity?: number;
  }
  
  export interface ActiveIndicatorStyle {
    show?: boolean;
    circle?: {
      outer?: { radius?: number; color?: string; opacity?: number };
      middle?: { radius?: number; color?: string; opacity?: number };
      inner?: { radius?: number; color?: string; opacity?: number };
    };
    line?: {
      color?: string;
      opacity?: number;
      strokeWidth?: number;
    };
    text?: {
      color?: string;
      fontSize?: number;
      fontPath?: string;
      backgroundColor?: string;
      padding?: number;
      borderRadius?: number;
    };
    position?: {
      topOffset?: number;
      rightMargin?: number;
      rightAdjustment?: number;
    };
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
  
  export interface DataKeys {
    x: string;
    y: string | string[];
  }
  
  export interface CustomizableBarChartProps {
    data: Record<string, any>[];
    keys: DataKeys;
    
    // Styling
    containerStyle?: StyleProp<ViewStyle>;
    dimensions?: ChartDimensions;
    domainPadding?: DomainPadding;
    chartPadding?: ChartPadding;
    
    // Axes
    axisOptions?: AxisOptions;
    domain?: { x?: [number, number]; y?: [number, number] };
    
    // Bars
    barStyle?: BarStyle;
    
    // Active indicator
    activeIndicator?: ActiveIndicatorStyle;
    
    // Animation
    animation?: AnimationConfig;
    
    // Interaction
    interaction?: InteractionConfig;
    
    // Data formatting
    valueFormatter?: (value: number, unit?: string) => string;
    unit?: string;
    
    // Responsive
    responsive?: {
      enabled?: boolean;
      breakpoints?: {
        small?: number;
        large?: number;
      };
    };
    
    // Custom rendering
    renderCustomIndicator?: (props: any) => React.ReactNode;
    renderCustomBar?: (props: any) => React.ReactNode;
  }

// --- GiftedBarChart Types ---
export interface ChartDimensions {
    width?: number;
    height?: number;
}

export interface BarStyleConfig {
    width?: number;
    spacing?: number;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    showGradient?: boolean;
    gradientDirection?: 'vertical' | 'horizontal';
    roundedTop?: boolean;
    roundedBottom?: boolean;
    shadowConfig?: {
        shadowColor?: string;
        shadowOffset?: { width: number; height: number };
        shadowOpacity?: number;
        shadowRadius?: number;
        elevation?: number;
    };
}

export interface AxisConfig {
    x?: {
        show?: boolean;
        showLabels?: boolean;
        showIndices?: boolean;
        labelTextStyle?: import('react-native').StyleProp<import('react-native').TextStyle>;
        labelRotation?: number;
        labelOffset?: number;
        axisThickness?: number;
        axisColor?: string;
        formatLabel?: (label: string | number, index: number) => string;
        customLabelComponent?: (label: string | number, index: number) => React.ReactNode;
    };
    y?: {
        show?: boolean;
        showLabels?: boolean;
        showIndices?: boolean;
        labelTextStyle?: import('react-native').StyleProp<import('react-native').TextStyle>;
        labelWidth?: number;
        labelOffset?: number;
        axisThickness?: number;
        axisColor?: string;
        formatLabel?: (value: number) => string;
        customLabelComponent?: (value: number) => React.ReactNode;
        precision?: number;
        suffix?: string;
        prefix?: string;
    };
}

export interface GridConfig {
    show?: boolean;
    horizontal?: {
        show?: boolean;
        color?: string;
        thickness?: number;
        dashGap?: number;
        dashWidth?: number;
    };
    vertical?: {
        show?: boolean;
        color?: string;
        thickness?: number;
        dashGap?: number;
        dashWidth?: number;
    };
    sections?: number;
}

export interface LegendConfig {
    show?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
    containerStyle?: import('react-native').StyleProp<import('react-native').ViewStyle>;
    itemStyle?: import('react-native').StyleProp<import('react-native').ViewStyle>;
    textStyle?: import('react-native').StyleProp<import('react-native').TextStyle>;
    iconSize?: number;
    iconStyle?: 'square' | 'circle' | 'line';
    spacing?: number;
    alignment?: 'start' | 'center' | 'end';
}

export interface TooltipConfig {
    enabled?: boolean;
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    padding?: number;
    fontSize?: number;
    formatValue?: (value: number, label?: string) => string;
    customComponent?: (value: number, label?: string) => React.ReactNode;
}

export interface InteractionConfig {
    pressEnabled?: boolean;
    longPressEnabled?: boolean;
    onPress?: (item: any, index: number) => void;
    onLongPress?: (item: any, index: number) => void;
    pressHighlightColor?: string;
}

export interface LineConfig {
    show?: boolean;
    color?: string;
    thickness?: number;
    type?: 'solid' | 'dashed' | 'dotted';
    dashGap?: number;
    dashWidth?: number;
    startIndex?: number;
    endIndex?: number;
    isSecondary?: boolean;
    dataPointsColor?: string;
    dataPointsRadius?: number;
    focusEnabled?: boolean;
    showDataPoint?: boolean;
    customDataPoint?: () => React.ReactNode;
    animationDuration?: number;
    curved?: boolean;
    curvature?: number;
    areaChart?: boolean;
    gradientFillColors?: string[];
}

export interface ResponsiveConfig {
    enabled?: boolean;
    breakpoints?: {
        small?: number;
        medium?: number;
        large?: number;
    };
    adaptiveBarWidth?: boolean;
    adaptiveSpacing?: boolean;
    adaptiveFontSize?: boolean;
}

export interface DataKeys {
    label?: string;
    value?: string;
    color?: string;
    gradientColor?: string;
    spacing?: string;
    topLabel?: string;
    bottomLabel?: string;
}

export interface CustomBarData {
    [key: string]: any;
}

export interface GiftedAnimationConfig {
    enabled?: boolean;
    duration?: number;
    delay?: number;
    type?: 'linear' | 'ease' | 'bounce';
}

export interface CustomizableGiftedBarChartProps extends Partial<import('react-native-gifted-charts').BarChartPropsType> {
    data?: CustomBarData[];
    keys?: DataKeys;
    containerStyle?: import('react-native').StyleProp<import('react-native').ViewStyle>;
    dimensions?: ChartDimensions;
    backgroundColor?: string;
    barStyle?: BarStyleConfig;
    defaultBarColor?: string;
    colorPalette?: string[];
    axisConfig?: AxisConfig;
    gridConfig?: GridConfig;
    legendConfig?: LegendConfig;
    animationConfig?: GiftedAnimationConfig;
    tooltipConfig?: TooltipConfig;
    interactionConfig?: InteractionConfig;
    lineConfig?: LineConfig;
    responsiveConfig?: ResponsiveConfig;
    renderCustomBar?: (item: any, index: number) => React.ReactNode;
    renderCustomLabel?: (item: any, index: number, type: 'top' | 'bottom' | 'side') => React.ReactNode;
    renderCustomTooltip?: (item: any, index: number) => React.ReactNode;
    dataProcessor?: (data: CustomBarData[]) => CustomBarData[];
    valueFormatter?: (value: number) => string;
    theme?: 'light' | 'dark' | 'custom';
    customTheme?: {
        backgroundColor?: string;
        textColor?: string;
        gridColor?: string;
        barColor?: string;
        axisColor?: string;
    };
    accessibilityConfig?: {
        enabled?: boolean;
        labelFormat?: (value: number, label?: string) => string;
        announceDataChanges?: boolean;
    };
}