import { ChartDimensions, BarStyleConfig, AxisConfig, GridConfig, GiftedAnimationConfig, TooltipConfig, InteractionConfig, ResponsiveConfig, DataKeys } from '../types/barchart';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const defaultDimensions: ChartDimensions = {
    width: SCREEN_WIDTH - 40,
    height: 300,
};

export const defaultBarStyle: BarStyleConfig = {
    width: 16,
    spacing: 20,
    borderRadius: 4,
    roundedTop: true,
    roundedBottom: false,
    showGradient: false,
    gradientDirection: 'vertical',
};

export const defaultAxisConfig: AxisConfig = {
    x: {
        show: true,
        showLabels: true,
        showIndices: false,
        labelRotation: 0,
        labelOffset: 0,
        axisThickness: 1,
        axisColor: '#D3D3D3',
    },
    y: {
        show: true,
        showLabels: true,
        showIndices: false,
        labelWidth: 50,
        labelOffset: 10,
        axisThickness: 1,
        axisColor: '#D3D3D3',
        precision: 0,
        suffix: '',
        prefix: '',
    },
};

export const defaultGridConfig: GridConfig = {
    show: false,
    horizontal: {
        show: true,
        color: '#E5E5E5',
        thickness: 1,
        dashGap: 0,
        dashWidth: 0,
    },
    vertical: {
        show: false,
        color: '#E5E5E5',
        thickness: 1,
        dashGap: 0,
        dashWidth: 0,
    },
    sections: 4,
};

export const defaultAnimationConfig: GiftedAnimationConfig = {
    enabled: true,
    duration: 1000,
    delay: 0,
    type: 'ease',
};

export const defaultTooltipConfig: TooltipConfig = {
    enabled: false,
    backgroundColor: '#000',
    textColor: '#fff',
    borderRadius: 6,
    padding: 8,
    fontSize: 12,
};

export const defaultInteractionConfig: InteractionConfig = {
    pressEnabled: false,
    longPressEnabled: false,
    pressHighlightColor: 'rgba(0,0,0,0.1)',
};

export const defaultResponsiveConfig: ResponsiveConfig = {
    enabled: true,
    breakpoints: {
        small: 360,
        medium: 768,
        large: 1024,
    },
    adaptiveBarWidth: true,
    adaptiveSpacing: true,
    adaptiveFontSize: true,
};

export const defaultKeys: DataKeys = {
  x: 'label',
  y: 'value',
  label: 'label',
  value: 'value',
  color: 'frontColor',
  gradientColor: 'gradientColor',
  spacing: 'spacing',
  topLabel: 'topLabelComponent',
  bottomLabel: 'bottomLabelComponent',
}; 