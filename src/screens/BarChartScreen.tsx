import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import VictoryBarChart from '../components/charts/barchart/VictoryBarChart';
import { chartContainerWidth, SCREEN_WIDTH } from '../utils/constants';
import { giftedBarData, sampleVictoryBarData, victoryBarData, victoryBarData14Days, victoryBarData30Days } from '../utils/chartData';
import CustomCardView from '../components/global/CustomCardView';
import { GiftedBarChartWithLegend } from '../components/charts/barchart/CustomizeGiftedBarChart';
import GiftedBarChart from '../components/charts/barchart/GiftedBarChart';

type Nav = NativeStackNavigationProp<RootStackParamList, 'BarChart'>;

const BarChartScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>

      <CustomCardView description="Shows animated active value indicator (dot/line) on press." type="barchart" title="Bar Chart (Active Indicator)">
        <VictoryBarChart
          data={victoryBarData}
          keys={{ x: 'label', y: 'value' }}
          unit="$"
          activeIndicator={{ show: true }}
          tooltip={{ show: false }}
          interaction={{ enabled: true, press: { enabled: true } }}
          barStyle={{
            width: 18,
            colors: ['#FF6B6B', '#4ECDC4'],
            roundedCorners: { topLeft: 4, topRight: 4 },
          }}
          axisOptions={{
            labelColor: '#222',
            axisSide: { 'x': 'bottom', 'y': 'left' }
          }}
          containerStyle={{ width: SCREEN_WIDTH - 35, height: 250 }}
        />
      </CustomCardView>

      <CustomCardView description="Shows inline tooltip at the top of the chart on press." type="barchart" title="Bar Chart (Inline Tooltip)">
        <VictoryBarChart
          data={victoryBarData}
          keys={{ x: 'label', y: 'value' }}
          unit="$"
          activeIndicator={{ show: false }}
          tooltip={{ show: true, position: 'inline' }}
          barStyle={{
            width: 18,
            colors: ['#177AD5'], // single color, no gradient
            roundedCorners: { topLeft: 4, topRight: 4 },
          }}
          axisOptions={{
            labelColor: '#222',
            axisSide: { 'x': 'bottom', 'y': 'left' }
          }}
          containerStyle={{ width: SCREEN_WIDTH - 35, height: 300 }}
        />
      </CustomCardView>

      <CustomCardView description='Compare values across categories at a glance.' type='barchart' title='Bar Charts'>
        <GiftedBarChartWithLegend
          data={giftedBarData}
          keys={{ x: 'month', y: 'revenue', label: 'month', value: 'revenue' }}
          containerStyle={{ width: chartContainerWidth, paddingTop: 10, margin: 0, borderRadius: 12 }}
          barStyle={{ width: 18, spacing: 25, roundedTop: false, borderRadius: 0, showGradient: true }}
          colorPalette={['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']}
          valueFormatter={(value: number) => `$${value.toLocaleString()}`}
          showLegend={true}
          legendStyle={{ marginBottom: 10 }}
          axisConfig={{
            x: { show: true, showLabels: true, labelTextStyle: { fontSize: 12, fontWeight: 'bold' } },
            y: { show: true, showLabels: false, prefix: '$', precision: 0, formatLabel: (value: number) => `$${value.toLocaleString()}` },
          }}


          gridConfig={{ show: true, horizontal: { show: true, color: '#E5E5E5' }, sections: 5 }}
          animationConfig={{ enabled: true, duration: 1500, type: 'ease' }}

          responsiveConfig={{ enabled: true, adaptiveBarWidth: true, adaptiveSpacing: true }}

          renderTooltip={(item: any, index: number) => (
            <View style={{ backgroundColor: '#333', padding: 8, borderRadius: 6 }}>
              <Text style={{ color: '#fff', fontSize: 12 }}>{item.month}: ${item.revenue}</Text>
            </View>
          )}
        />
      </CustomCardView>

      <CustomCardView description="Simple bar chart with 14 days of data and activity indicator (no inline tooltip)." type="barchart" title="Bar Chart (14 Days)">
        <VictoryBarChart
          data={victoryBarData14Days}
          keys={{ x: 'label', y: 'value' }}
          unit="$"
          activeIndicator={{ show: true }}
          tooltip={{ show: false }}
          interaction={{ enabled: true, press: { enabled: true } }}
          barStyle={{
            width: 12,
            colors: ['#43C6AC'],
            roundedCorners: { topLeft: 4, topRight: 4 },
          }}
          axisOptions={{
            labelColor: '#222',
            axisSide: { 'x': 'bottom', 'y': 'left' }
          }}
          containerStyle={{ width: SCREEN_WIDTH - 35, height: 220 }}
        />
      </CustomCardView>

      <CustomCardView description="Simple bar chart with 30 days of data and activity indicator (no inline tooltip)." type="barchart" title="Bar Chart (30 Days)">
        <VictoryBarChart
          data={victoryBarData30Days}
          keys={{ x: 'label', y: 'value' }}
          unit="$"
          activeIndicator={{ show: true }}
          tooltip={{ show: false }}
          interaction={{ enabled: true, press: { enabled: true } }}
          barStyle={{
            width: 8,
            colors: ['#26A2FB', '#43C6AC'],
            roundedCorners: { topLeft: 4, topRight: 4 },
          }}
          axisOptions={{
            labelColor: '#222',
            axisSide: { 'x': 'bottom', 'y': 'left' }
          }}
          containerStyle={{ width: SCREEN_WIDTH - 35, height: 220 }}
        />
      </CustomCardView>




      <CustomCardView description='Compare values across categories at a glance.' type='barchart' title='Bar Charts'>
        <GiftedBarChart
          data={sampleVictoryBarData}
          barWidth={20}
          // barColor="#FF6347"
          labelColor="#333"
          // show connected line
          // showLine
          lineConfig={{
            color: '#00dbde',
            thickness: 3,
            curved: true,
            hideDataPoints: true,
            shiftY: 20,
            initialSpacing: -30,
          }}
          roundedTop={false}
          customStyles={{ width: SCREEN_WIDTH * 0.9, height: 250,marginTop:20 }}
          initialSpacing={10}
          spacing={22}
          // stepHeight={50}
          rulesColor={'#333'}
          rulesType='dashed'
          hideRules
          noOfSections={5}
          showFractionalValues
          // dots on lines
          showYAxisIndices
          showXAxisIndices
          barBorderTopLeftRadius={6}
          barBorderTopRightRadius={6}
          // gradient color
          showGradient
          gradientColor={"#fc00ff"}

          // make bars looks 3d also change the side with 3d
          // isThreeD 
          // side ('left' or 'right', defaults to 'left' as in the 3d)
          // side='right'

          // style top capped
          // cappedBars
          // capColor={'rgba(78, 0, 142)'}
          // capThickness={4}

          //  hide y labels
          // hideYAxisText

          // thikness of y and x axis lines for 0 it will hide it
          yAxisThickness={1}
          xAxisThickness={1}
          xAxisColor={'#eee'}
          yAxisColor={'#eee'}
          xAxisType={'dashed'}

          renderTooltip={(item:any, index:number) => {
            return (
              <View
                style={{
                  marginBottom: -40,
                  marginLeft: -6,
                  backgroundColor: '#ffcefe',
                  paddingHorizontal: 6,
                  paddingVertical: 4,
                  borderRadius: 4,
                }}>
                <Text>{item.value}</Text>
              </View>
            );
          }}
        />
      </CustomCardView>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', backgroundColor: '#f5f5f5', margin: 5, paddingBottom: 30 },
});

export default BarChartScreen; 