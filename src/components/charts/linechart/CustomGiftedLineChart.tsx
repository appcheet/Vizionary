// // CustomGiftedLineChart.tsx
// import React from 'react';
// import { LineChart } from 'react-native-gifted-charts';
// import { View, StyleSheet, useWindowDimensions, Text } from 'react-native';

// /**
//  * Custom line chart using react-native-gifted-charts
//  * @param {Object} props
//  * @param {any[]} props.data - Array of data points
//  * @param {number} [props.width]
//  * @param {number} [props.height]
//  * @param {string} [props.color]
//  * @param {boolean} [props.areaChart]
//  * @param {boolean} [props.curved]
//  * @param {boolean} [props.showDots]
//  * @param {boolean} [props.showVerticalLines]
//  * @param {boolean} [props.showXAxisIndices]
//  * @param {boolean} [props.showYAxisIndices]
//  * @param {function} [props.renderTooltip]
//  */
// const CustomGiftedLineChart = ({
//   data,
//   width,
//   height = 220,
//   color = '#1877F2',
//   areaChart = false,
//   curved = true,
//   showDots = true,
//   showVerticalLines = false,
//   showXAxisIndices = false,
//   showYAxisIndices = false,
//   renderTooltip,
//   ...props
// }: {
//   data: any[];
//   width?: number;
//   height?: number;
//   color?: string;
//   areaChart?: boolean;
//   curved?: boolean;
//   showDots?: boolean;
//   showVerticalLines?: boolean;
//   showXAxisIndices?: boolean;
//   showYAxisIndices?: boolean;
//   renderTooltip?: (item: any, index: number) => React.ReactNode;
//   [key: string]: any;
// }) => {
//   const windowWidth = useWindowDimensions().width;
//   const chartWidth = width || windowWidth - 40;

//   // Default tooltip renderer
//   const defaultTooltip = (item: any, index: number) => (
//     <View style={{ backgroundColor: '#333', padding: 8, borderRadius: 6 }}>
//       <Text style={{ color: '#fff', fontSize: 12 }}>{item.label}: {item.value}</Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <LineChart
//         data={data}
//         width={chartWidth}
//         height={height}
//         color={color}
//         areaChart={areaChart}
//         curved={curved}
//         showDots={showDots}
//         showVerticalLines={showVerticalLines}
//         showXAxisIndices={showXAxisIndices}
//         showYAxisIndices={showYAxisIndices}
//         renderTooltip={renderTooltip || defaultTooltip}
//         {...props}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '100%',
//   },
// });

// export default CustomGiftedLineChart; 




// CustomGiftedLineChart.tsx
import React from 'react';
import { LineChart } from 'react-native-gifted-charts';
import { View, StyleSheet, useWindowDimensions, Text } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

interface CustomGiftedLineChartProps {
  data: any[];
  data2?: any[];
  width?: number;
  height?: number;
  color?: string;
  color2?: string;
  gradientColor?: string;
  gradientColor2?: string;
  areaChart?: boolean;
  curved?: boolean;
  showDots?: boolean;
  showDataPoint?: boolean;
  showVerticalLines?: boolean;
  showXAxisIndices?: boolean;
  showYAxisIndices?: boolean;
  renderTooltip?: (item: any, index: number) => React.ReactNode;
  [key: string]: any;
}

const CustomGiftedLineChart: React.FC<CustomGiftedLineChartProps> = ({
  data,
  data2,
  width,
  height = 220,
  color = '#1877F2',
  color2 = '#FF6B6B',
  gradientColor,
  gradientColor2,
  areaChart = false,
  curved = true,
  showDots = false,
  showDataPoint = false,
  showVerticalLines = false,
  showXAxisIndices = true,
  showYAxisIndices = true,
  renderTooltip,
  ...props
}) => {
  const windowWidth = useWindowDimensions().width;
  const chartWidth = width || windowWidth - 60;

  // Modern tooltip renderer with glassmorphism effect
  const modernTooltip = (item: any, index: number) => (
    <View style={styles.modernTooltip}>
      <View style={styles.tooltipGlass}>
        <Text style={styles.tooltipValue}>{item.value}</Text>
        <Text style={styles.tooltipLabel}>{item.label || 'Value'}</Text>
      </View>
    </View>
  );

  // Prepare chart configuration
  const chartConfig = {
    data: data,
    data2: data2,
    width: chartWidth,
    height: height,
    color: color,
    color2: color2,
    
    // Modern styling
    thickness: 3,
    thickness2: 3,
    curved: curved,
    areaChart: areaChart,
    
    // Dots configuration
    showDots: showDots,
    showDataPoint: showDataPoint,
    dataPointsColor: color,
    dataPointsColor2: color2,
    dataPointsRadius: 5,
    dataPointsWidth: 2,
    
    // Grid and axes
    showVerticalLines: showVerticalLines,
    verticalLinesColor: 'rgba(0,0,0,0.1)',
    verticalLinesThickness: 1,
    rulesColor: 'rgba(0,0,0,0.1)',
    rulesThickness: 1,
    
    // Axis labels
    showXAxisIndices: showXAxisIndices,
    showYAxisIndices: showYAxisIndices,
    xAxisColor: 'rgba(0,0,0,0.1)',
    yAxisColor: 'rgba(0,0,0,0.1)',
    xAxisThickness: 1,
    yAxisThickness: 1,
    xAxisLabelTextStyle: styles.axisLabel,
    yAxisLabelTextStyle: styles.axisLabel,
    
    // Gradient fills
    startFillColor: gradientColor || color,
    endFillColor: areaChart ? (gradientColor ? `${gradientColor}20` : `${color}20`) : 'transparent',
    startFillColor2: gradientColor2 || color2,
    endFillColor2: areaChart ? (gradientColor2 ? `${gradientColor2}20` : `${color2}20`) : 'transparent',
    startOpacity: areaChart ? 0.8 : 0,
    endOpacity: areaChart ? 0.1 : 0,
    startOpacity2: areaChart ? 0.8 : 0,
    endOpacity2: areaChart ? 0.1 : 0,
    
    // Tooltip
    showTooltip: true,
    renderTooltip: renderTooltip || modernTooltip,
    
    // Spacing and margins
    initialSpacing: 10,
    endSpacing: 10,
    spacing: chartWidth / Math.max(data.length - 1, 1),
    
    // Animation
    animateOnDataChange: true,
    animationDuration: 800,
    
    // Additional modern styling
    backgroundColor: 'transparent',
    hideDataPoints: !showDots && !showDataPoint,
    focusEnabled: true,
    showStripOnFocus: true,
    stripColor: 'rgba(0,0,0,0.1)',
    stripWidth: 2,
    stripOpacity: 0.5,
    
    ...props
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <LineChart {...chartConfig} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
  chartWrapper: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    paddingVertical: 10,
  },
  modernTooltip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: 12,
    padding: 12,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tooltipValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  tooltipLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'lowercase',
  },
  axisLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '500',
  },
});

export default CustomGiftedLineChart;