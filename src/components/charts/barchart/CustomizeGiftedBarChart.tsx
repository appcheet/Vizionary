import React, { FC, memo, useMemo, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CustomBarData {
  label?: string;
  value?: number;
  month?: string;
  revenue?: number;
  frontColor?: string;
  [key: string]: any;
}

interface OptimizedChartProps {
  data: CustomBarData[];
  containerStyle?: object;
  colorPalette?: string[];
  showLegend?: boolean;
  legendStyle?: object;
  valueFormatter?: (value: number) => string;
  height?: number;
  [key: string]: any;
}

const OptimizedGiftedBarChart: FC<OptimizedChartProps> = ({
  data = [],
  containerStyle,
  colorPalette = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
  showLegend = true,
  legendStyle = {},
  valueFormatter = (value: number) => `$${value.toLocaleString()}`,
  height,
  ...props
}) => {
  const [activeTooltip, setActiveTooltip] = useState<{ index: number; data: any } | null>(null);

  // Calculate responsive dimensions
  const containerWidth = (containerStyle as any)?.width || SCREEN_WIDTH - 32;
  const chartHeight = height || Math.max(300, containerWidth * 0.65);
  
  // Fixed equal spacing calculation
  const dataLength = data.length || 1;
  const chartWidth = containerWidth - 70; // Account for y-axis and padding
  const barWidth = Math.min(25, Math.max(12, (chartWidth * 0.6) / dataLength)); // 60% for bars
  const totalBarsWidth = barWidth * dataLength;
  const totalSpacingWidth = chartWidth - totalBarsWidth;
  const spacing = Math.max(8, totalSpacingWidth / (dataLength + 1)); // Equal spaces including edges

  // Process data with equal spacing
  const processedData = useMemo(() => {
    return data.map((item, index) => ({
      label: item.month || item.label || `Item ${index + 1}`,
      value: item.revenue || item.value || 0,
      frontColor: item.frontColor || colorPalette[index % colorPalette.length],
      spacing: spacing, // Equal spacing for all bars
      
      // Custom press handler
      onPress: () => {
        if (activeTooltip?.index === index) {
          setActiveTooltip(null); // Hide if same bar tapped
        } else {
          setActiveTooltip({
            index,
            data: {
              label: item.month || item.label || `Item ${index + 1}`,
              value: item.revenue || item.value || 0
            }
          });
        }
      }
    }));
  }, [data, colorPalette, spacing, activeTooltip]);

  // Calculate tooltip position
  const getTooltipPosition = (index: number) => {
    const barPosition = spacing + (index * (barWidth + spacing)) + (barWidth / 2);
    const tooltipWidth = 100;
    const leftPosition = Math.max(10, Math.min(chartWidth - tooltipWidth, barPosition - tooltipWidth / 2));
    
    return {
      left: leftPosition,
      top: chartHeight * 0.15, // Position in upper portion of chart
    };
  };

  // Chart configuration
  const chartConfig = {
    data: processedData,
    width: chartWidth,
    height: chartHeight - 60, // Account for legend
    barWidth: barWidth,
    
    // Animation
    isAnimated: true,
    animationDuration: 1000,
    
    // Bar styling
    roundedTop: true,
    roundedBottom: false,
    borderRadius: 4,
    
    // Axes styling
    xAxisColor: '#E0E0E0',
    yAxisColor: '#E0E0E0',
    xAxisThickness: 1,
    yAxisThickness: 1,
    xAxisLabelTextStyle: { 
      color: '#666', 
      fontSize: 11,
      fontWeight: '500' as const
    },
    yAxisTextStyle: { 
      color: '#666', 
      fontSize: 10,
      fontWeight: '500' as const
    },
    yAxisLabelWidth: 50,
    
    // Grid
    noOfSections: 5,
    rulesColor: '#F8F8F8',
    rulesThickness: 0.8,
    hideRules: false,
    
    // Y-axis formatting
    formatYLabel: (label: string) => valueFormatter(Number(label)),
    
    // Disable any built-in tooltips
    showTooltip: false,
    hideTooltip: true,
    
    ...props,
  };

  return (
    <View style={[
      {
        width: containerWidth,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
      },
      containerStyle
    ]}>
      {/* Legend */}
      {showLegend && processedData.length > 0 && (
        <View style={[
          {
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 20,
          },
          legendStyle
        ]}>
          {processedData.map((item, index) => (
            <View 
              key={`legend-${index}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 8,
                marginBottom: 8,
              }}
            >
              <View style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: item.frontColor,
                marginRight: 6,
              }} />
              <Text style={{ 
                fontSize: 12, 
                color: '#666',
                fontWeight: '500' as const
              }}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Chart with Tooltip Overlay */}
      <View style={{ position: 'relative', alignItems: 'center' }}>
        <BarChart {...chartConfig} />
        
        {/* Single Custom Tooltip */}
        {activeTooltip && (
          <View
            style={[
              {
                position: 'absolute',
                backgroundColor: '#2D3748',
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 10,
                minWidth: 100,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
                zIndex: 1000,
              },
              getTooltipPosition(activeTooltip.index)
            ]}
          >
            {/* Tooltip Content */}
            <Text style={{ 
              color: '#fff', 
              fontSize: 13, 
              fontWeight: 'bold',
              marginBottom: 2
            }}>
              {activeTooltip.data.label}
            </Text>
            <Text style={{ 
              color: '#A0AEC0', 
              fontSize: 12,
            }}>
              {valueFormatter(activeTooltip.data.value)}
            </Text>
            
            {/* Tooltip Arrow pointing down */}
            <View style={{
              position: 'absolute',
              bottom: -8,
              left: '50%',
              marginLeft: -8,
              width: 0,
              height: 0,
              borderLeftWidth: 8,
              borderRightWidth: 8,
              borderTopWidth: 8,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderTopColor: '#2D3748',
            }} />
          </View>
        )}
      </View>
      
      {/* Instructions */}
      <Text style={{
        textAlign: 'center',
        fontSize: 11,
        color: '#A0AEC0',
        marginTop: 12,
        fontStyle: 'italic'
      }}>
        Tap bars to toggle tooltip
      </Text>
    </View>
  );
};

export default memo(OptimizedGiftedBarChart);
export const GiftedBarChartWithLegend = OptimizedGiftedBarChart;