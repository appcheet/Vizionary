import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import CustomCardView from '../components/global/CustomCardView';
import CustomVictoryLineChart, { createSeriesConfig } from '../components/charts/linechart/CustomVictoryLineChart';
import CustomGiftedLineChart from '../components/charts/linechart/CustomGiftedLineChart';
import { lineChartData } from '../utils/chartData';
import { chartContainerWidth } from '../utils/constants';
import { View as RNView, Text as RNText } from 'react-native';


const LegendItem = ({ color, label }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{label}</Text>
  </View>
);


// Helper to generate N days of line chart data
const generateDailyLineData = (days: number) => {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    return { label, value: Math.floor(1000 + Math.random() * 2000) };
  });
};



// Example data for each use case
const weeklyActiveUsers = [
  { label: 'Mon', value: 489 },
  { label: 'Tue', value: 520 },
  { label: 'Wed', value: 410 },
  { label: 'Thu', value: 600 },
  { label: 'Fri', value: 350 },
  { label: 'Sat', value: 220 },
  { label: 'Sun', value: 180 },
];
const monthlyRevenue = [
  { label: 'Jan', value: 1200 },
  { label: 'Feb', value: 1350 },
  { label: 'Mar', value: 1100 },
  { label: 'Apr', value: 1600 },
  { label: 'May', value: 1400 },
  { label: 'Jun', value: 900 },
];
const websiteTraffic = [
  { label: 'Mon', value: 176 },
  { label: 'Tue', value: 210 },
  { label: 'Wed', value: 190 },
  { label: 'Thu', value: 250 },
  { label: 'Fri', value: 300 },
  { label: 'Sat', value: 220 },
  { label: 'Sun', value: 180 },
];
const fitnessProgress = [
  { label: 'W1', value: 80 },
  { label: 'W2', value: 120 },
  { label: 'W3', value: 150 },
  { label: 'W4', value: 200 },
];
const caloriesBurned = [
  { label: 'Mon', value: 320 },
  { label: 'Tue', value: 400 },
  { label: 'Wed', value: 350 },
  { label: 'Thu', value: 500 },
  { label: 'Fri', value: 420 },
  { label: 'Sat', value: 300 },
  { label: 'Sun', value: 250 },
];
const salesVsReturns = [
  { label: 'Jan', value: 800 },
  { label: 'Feb', value: 950 },
  { label: 'Mar', value: 700 },
  { label: 'Apr', value: 1200 },
  { label: 'May', value: 1100 },
  { label: 'Jun', value: 900 },
];
const returns = [
  { label: 'Jan', value: 120 },
  { label: 'Feb', value: 100 },
  { label: 'Mar', value: 90 },
  { label: 'Apr', value: 150 },
  { label: 'May', value: 130 },
  { label: 'Jun', value: 110 },
];
const sleepQuality = [
  { label: 'Mon', value: 7.2 },
  { label: 'Tue', value: 6.8 },
  { label: 'Wed', value: 7.5 },
  { label: 'Thu', value: 8.0 },
  { label: 'Fri', value: 6.5 },
  { label: 'Sat', value: 7.8 },
  { label: 'Sun', value: 8.1 },
];
const temperature = [
  { label: 'Mon', value: 22 },
  { label: 'Tue', value: 24 },
  { label: 'Wed', value: 23 },
  { label: 'Thu', value: 25 },
  { label: 'Fri', value: 27 },
  { label: 'Sat', value: 28 },
  { label: 'Sun', value: 26 },
];
const humidity = [
  { label: 'Mon', value: 60 },
  { label: 'Tue', value: 62 },
  { label: 'Wed', value: 58 },
  { label: 'Thu', value: 65 },
  { label: 'Fri', value: 70 },
  { label: 'Sat', value: 68 },
  { label: 'Sun', value: 66 },
];
const stockA = [
  { label: 'Jan', value: 120 },
  { label: 'Feb', value: 140 },
  { label: 'Mar', value: 135 },
  { label: 'Apr', value: 150 },
  { label: 'May', value: 160 },
  { label: 'Jun', value: 170 },
];
const stockB = [
  { label: 'Jan', value: 100 },
  { label: 'Feb', value: 110 },
  { label: 'Mar', value: 120 },
  { label: 'Apr', value: 130 },
  { label: 'May', value: 140 },
  { label: 'Jun', value: 150 },
];

// Modern colorful monthly and 3-months data
const monthlyData = Array.from({ length: 30 }, (_, i) => ({
  label: `${i + 1}`,
  value: Math.floor(100 + Math.random() * 400),
}));
const threeMonthsData = Array.from({ length: 90 }, (_, i) => ({
  label: `${i + 1}`,
  value: Math.floor(200 + Math.random() * 600),
}));

const LineChartScreen = () => {
  // Multi-series example
  const multiSeries = [
    createSeriesConfig('value', '#1877F2', { unit: 'kg', label: 'Value', showArea: true }),
    createSeriesConfig('value2', '#FF6B6B', { unit: 'kg', label: 'Value 2', showArea: false, showScatter: true }),
  ];
  // Add a value2 field to the data for multi-series
  const multiSeriesData = lineChartData[0].data.map((d, i) => ({ ...d, value2: d.value + (i % 2 === 0 ? 200 : -200) }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <CustomCardView description="Simple monthly line chart with active indicator and scatter." type="linechart" title="Line Chart (Monthly)">
        <CustomVictoryLineChart
          data={lineChartData[0].data}
          series={[createSeriesConfig('value', '#1877F2', { unit: 'kg', label: 'Value' })]}
          xKey="label"
          width={chartContainerWidth}
          height={230}
        />
      </CustomCardView>

      <CustomCardView description="Weekly line chart with area under the curve." type="linechart" title="Line Chart (Weekly, With Area)">
        <CustomVictoryLineChart
          data={lineChartData[1].data}
          series={[createSeriesConfig('value', '#43C6AC', { unit: 'visits', label: 'Visits', showArea: true })]}
          xKey="label"
          width={chartContainerWidth}
          height={230}
          showArea
        />
      </CustomCardView>

      <CustomCardView description="14-day line chart with scatter points only (no area)." type="linechart" title="Line Chart (14 Days, With Scatter)">
        <CustomVictoryLineChart
          data={generateDailyLineData(14)}
          series={[createSeriesConfig('value', '#FF6B6B', { unit: 'steps', label: 'Steps', showArea: false, showScatter: true })]}
          xKey="label"
          width={chartContainerWidth}
          height={230}
          showScatter
        />
      </CustomCardView>

      <CustomCardView description="30-day multi-series line chart (two lines, two colors)." type="linechart" title="Line Chart (30 Days, Multi-Series)">
        <CustomVictoryLineChart
          data={generateDailyLineData(30).map((d, i) => ({ ...d, value2: d.value + (i % 2 === 0 ? 200 : -200) }))}
          series={multiSeries}
          xKey="label"
          width={chartContainerWidth}
          height={230}
        />
      </CustomCardView>

      <CustomCardView description="Line chart with no active indicator (just line)." type="linechart" title="Line Chart (No Indicator)">
        <CustomVictoryLineChart
          data={lineChartData[0].data}
          series={[createSeriesConfig('value', '#FFA500', { unit: 'kg', label: 'Value' })]}
          xKey="label"
          width={chartContainerWidth}
          height={230}
          showActiveIndicator={false}
          unit='kg'
        />
      </CustomCardView>

      <CustomCardView description="Custom styled line chart (thick line, no area, custom color)." type="linechart" title="Line Chart (Custom Style)">
        <CustomVictoryLineChart
          data={generateDailyLineData(10)}
          series={[createSeriesConfig('value', '#00BFFF', { unit: 'kg', label: 'Value', showArea: false, strokeWidth: 4 })]}
          xKey="label"
          width={chartContainerWidth}
          height={230}
        />
      </CustomCardView>

      {/* Inline tooltip with no indicator */}
      <CustomCardView description="Line chart with inline tooltip at top, no active indicator dot/line." type="linechart" title="Line Chart (Inline Tooltip Only)">
        <CustomVictoryLineChart
          data={generateDailyLineData(10)}
          series={[createSeriesConfig('value', '#FF6200', { unit: 'kg', label: 'Value' })]}
          xKey="label"
          width={chartContainerWidth}
          height={300}
          showActiveIndicator={false}
          tooltip={{ show: true, position: 'inline'}}
        />
      </CustomCardView>

      {/* Area gradient example */}
      <CustomCardView description="Line chart with area gradient under the curve." type="linechart" title="Line Chart (Area Gradient)">
        <CustomVictoryLineChart
          data={generateDailyLineData(14)}
          series={[createSeriesConfig('value', '#43C6AC', { unit: 'kg', label: 'Value', showArea: true })]}
          xKey="label"
          width={chartContainerWidth}
          height={230}
          showArea
          areaGradient={{ from: '#43C6AC', to: '#DCE35B' }}
        />
      </CustomCardView>

      {/* Custom multi-layered scatter overlays */}
      <CustomCardView description="Line chart with custom multi-layered scatter overlays (dot styles)." type="linechart" title="Line Chart (Custom Scatter)">
        <CustomVictoryLineChart
          data={generateDailyLineData(10)}
          series={[createSeriesConfig('value', '#FF6200', { unit: 'kg', label: 'Value', showArea: false })]}
          xKey="label"
          width={chartContainerWidth}
          height={230}
          showScatter
          scatterConfig={[
            { color: '#F57F17', radius: 6 },
            { color: '#FFF', radius: 3.5, style: 'fill' },
          ]}
        />
      </CustomCardView>

      {/* Activity indicator with animated value label (no inline tooltip) */}
      <CustomCardView description="Line chart with animated activity indicator value label (no inline tooltip, value animates above indicator)." type="linechart" title="Line Chart (Activity Indicator Value)">
        <CustomVictoryLineChart
          data={generateDailyLineData(10)}
          series={[createSeriesConfig('value', '#00C853', { unit: 'pts', label: 'Points' })]}
          xKey="label"
          width={chartContainerWidth}
          height={230}
          showActiveIndicator={true}
          tooltip={{ show: false }}
        />
      </CustomCardView>

      {/* Gifted Line Chart Example */}
      <CustomCardView description="Line chart using react-native-gifted-charts (CustomGiftedLineChart)." type="linechart" title="Gifted Line Chart">
        <CustomGiftedLineChart
          data={generateDailyLineData(10).map(d => ({ value: d.value, label: d.label }))}
          width={chartContainerWidth-40}
          height={220}
          color="#43C6AC"
          areaChart
        />
      </CustomCardView>

      <CustomCardView type="linechart" title="Weekly Active Users" description="15 April - 21 April">
        <CustomGiftedLineChart
          data={weeklyActiveUsers}
          color="#1877F2"
          gradientColor="#43C6AC"
          areaChart
          curved
          renderTooltip={(item) => (
            <View style={styles.modernTooltip}>
              <Text style={styles.tooltipValue}>{item.value}</Text>
              <Text style={styles.tooltipLabel}>users</Text>
            </View>
          )}
        />
        <View style={styles.legend}>
          <LegendItem color="#1877F2" label="Active Users" />
        </View>
      </CustomCardView>

      {/* 2. Red gradient with area fill */}
      <CustomCardView type="linechart" title="Monthly Revenue" description="15 April - 21 April">
        <CustomGiftedLineChart
          data={monthlyRevenue}
          color="#FF6B6B"
          gradientColor="#FFD6E0"
          areaChart
          curved
          renderTooltip={(item) => (
            <View style={styles.modernTooltip}>
              <Text style={[styles.tooltipValue, { color: '#FF6B6B' }]}>{item.value}</Text>
              <Text style={styles.tooltipLabel}>revenue</Text>
            </View>
          )}
        />
        <View style={styles.legend}>
          <LegendItem color="#FF6B6B" label="Revenue" />
        </View>
      </CustomCardView>

      {/* 3. Cyan gradient with area fill */}
      <CustomCardView type="linechart" title="Website Traffic" description="15 April - 21 April">
        <CustomGiftedLineChart
          data={websiteTraffic}
          color="#43C6AC"
          gradientColor="#1877F2"
          areaChart
          curved
          renderTooltip={(item) => (
            <View style={styles.modernTooltip}>
              <Text style={[styles.tooltipValue, { color: '#43C6AC' }]}>{item.value}</Text>
              <Text style={styles.tooltipLabel}>visits</Text>
            </View>
          )}
        />
        <View style={styles.legend}>
          <LegendItem color="#43C6AC" label="Traffic" />
        </View>
      </CustomCardView>

      {/* 4. Line with vertical grid lines */}
      <CustomCardView type="linechart" title="Fitness Progress" description="15 April - 21 April">
        <CustomGiftedLineChart
          data={stockA}
          color="#1877F2"
          areaChart={false}
          curved
          showVerticalLines
          showDots
          renderTooltip={(item) => (
            <View style={styles.modernTooltip}>
              <Text style={[styles.tooltipValue, { color: '#1877F2' }]}>{item.value}</Text>
              <Text style={styles.tooltipLabel}>progress</Text>
            </View>
          )}
        />
        <View style={styles.legend}>
          <LegendItem color="#1877F2" label="Progress" />
        </View>
      </CustomCardView>

      {/* 5. Simple line without fill */}
      <CustomCardView type="linechart" title="Calories Burned" description="15 April - 21 April">
        <CustomGiftedLineChart
          data={monthlyRevenue}
          color="#FF6B6B"
          areaChart={false}
          curved
          showDots
          renderTooltip={(item) => (
            <View style={styles.modernTooltip}>
              <Text style={[styles.tooltipValue, { color: '#FF6B6B' }]}>{item.value}</Text>
              <Text style={styles.tooltipLabel}>calories</Text>
            </View>
          )}
        />
        <View style={styles.legend}>
          <LegendItem color="#FF6B6B" label="Calories" />
        </View>
      </CustomCardView>

      {/* 6. Two lines with gradient areas */}
      <CustomCardView type="linechart" title="Sales vs Returns" description="15 April - 21 April">
        <CustomGiftedLineChart
          data={stockA}
          data2={stockB}
          color="#1877F2"
          color2="#FF6B6B"
          gradientColor="#43C6AC"
          gradientColor2="#FFD6E0"
          areaChart
          curved
          renderTooltip={(item) => (
            <View style={styles.modernTooltip}>
              <Text style={[styles.tooltipValue, { color: '#1877F2' }]}>{item.value}</Text>
              <Text style={styles.tooltipLabel}>sales</Text>
            </View>
          )}
        />
        <View style={styles.legend}>
          <LegendItem color="#1877F2" label="Sales" />
          <LegendItem color="#FF6B6B" label="Returns" />
        </View>
      </CustomCardView>

      {/* 7. Overlapping gradient areas */}
      <CustomCardView type="linechart" title="Sleep Quality" description="15 April - 21 April">
        <CustomGiftedLineChart
          data={websiteTraffic}
          color="#43C6AC"
          gradientColor="#1877F2"
          areaChart
          curved
          renderTooltip={(item) => (
            <View style={styles.modernTooltip}>
              <Text style={[styles.tooltipValue, { color: '#43C6AC' }]}>{item.value}</Text>
              <Text style={styles.tooltipLabel}>quality</Text>
            </View>
          )}
        />
        <View style={styles.legend}>
          <LegendItem color="#43C6AC" label="Sleep Quality" />
        </View>
      </CustomCardView>

      {/* 8. Stacked area chart */}
      <CustomCardView type="linechart" title="Temperature" description="15 April - 21 April">
        <CustomGiftedLineChart
          data={stockA}
          data2={stockB}
          color="#1877F2"
          color2="#FF6B6B"
          gradientColor="#43C6AC"
          gradientColor2="#FFD6E0"
          areaChart
          curved={false}
          renderTooltip={(item) => (
            <View style={styles.modernTooltip}>
              <Text style={[styles.tooltipValue, { color: '#1877F2' }]}>{item.value}°</Text>
              <Text style={styles.tooltipLabel}>temp</Text>
            </View>
          )}
        />
        <View style={styles.legend}>
          <LegendItem color="#1877F2" label="High" />
          <LegendItem color="#FF6B6B" label="Low" />
        </View>
      </CustomCardView>

      {/* 9. Two lines without fill */}
      <CustomCardView type="linechart" title="Humidity" description="15 April - 21 April">
        <CustomGiftedLineChart
          data={stockA}
          data2={stockB}
          color="#1877F2"
          color2="#FF6B6B"
          areaChart={false}
          curved
          showDots
          renderTooltip={(item) => (
            <View style={styles.modernTooltip}>
              <Text style={[styles.tooltipValue, { color: '#1877F2' }]}>{item.value}%</Text>
              <Text style={styles.tooltipLabel}>humidity</Text>
            </View>
          )}
        />
        <View style={styles.legend}>
          <LegendItem color="#1877F2" label="Indoor" />
          <LegendItem color="#FF6B6B" label="Outdoor" />
        </View>
      </CustomCardView>

      {/* 10. Dots only chart */}
      <CustomCardView type="linechart" title="Stock A vs Stock B" description="15 April - 21 April">
        <CustomGiftedLineChart
          data={stockA}
          data2={stockB}
          color="#1877F2"
          color2="#FF6B6B"
          areaChart={false}
          curved={false}
          showDataPoint
          thickness={2}
          renderTooltip={(item) => (
            <View style={styles.modernTooltip}>
              <Text style={[styles.tooltipValue, { color: '#1877F2' }]}>${item.value}</Text>
              <Text style={styles.tooltipLabel}>stock</Text>
            </View>
          )}
        />
        <View style={styles.legend}>
          <LegendItem color="#1877F2" label="Stock A" />
          <LegendItem color="#FF6B6B" label="Stock B" />
        </View>
      </CustomCardView>

      {/* 11. Modern Monthly Chart */}
      <CustomCardView type="linechart" title="Daily Sales (Last 30 Days)" description="1 May - 30 May">
        <CustomGiftedLineChart
          data={monthlyData.slice(0, 30)}
          color="#8e54e9"
          gradientColor="#ff6a88"
          areaChart
          curved
          showXAxisIndices={false}
          renderTooltip={(item) => (
            <View style={styles.modernTooltip}>
              <Text style={[styles.tooltipValue, { color: '#8e54e9' }]}>${item.value}</Text>
              <Text style={styles.tooltipLabel}>sales</Text>
            </View>
          )}
        />
      </CustomCardView>

      {/* 12. Purple-Pink Gradient */}
      <CustomCardView type="linechart" title="User Signups (Last 3 Months)" description="1 March - 31 May">
        <CustomGiftedLineChart
          data={stockA}
          color="#8e54e9"
          gradientColor="#ff6a88"
          areaChart
          curved
          renderTooltip={(item) => (
            <View style={styles.modernTooltip}>
              <Text style={[styles.tooltipValue, { color: '#8e54e9' }]}>{item.value}</Text>
              <Text style={styles.tooltipLabel}>signups</Text>
            </View>
          )}
        />
      </CustomCardView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', backgroundColor: '#f5f5f5', margin: 5, paddingBottom: 30 },
  legend: {
    flexDirection: 'row',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  modernTooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
});

export default LineChartScreen; 