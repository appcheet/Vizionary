import React from 'react';
import {  Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useNavigation } from '@react-navigation/native';
import VictoryBarChart from '../components/charts/barchart/VictoryBarChart';
import CustomCardView from '../components/global/CustomCardView';
import { fitnessBarGroupData, victoryBarData } from '../utils/chartData';
import { chartContainerWidth } from '../utils/constants';
import VictoryBarGroupChart from '../components/charts/groupbar/VictoryBarGroupChart';
import CustomVictoryLineChart, { createSeriesConfig } from '../components/charts/linechart/CustomVictoryLineChart';
import { lineChartData } from '../utils/chartData';


const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();

  const handleNavigationPress = (type: string) => {
    switch (type) {
      case 'barchart':
        navigation.navigate('BarChart');
        break;

      case 'linechart':
        navigation.navigate('LineChart');
        break;

      case 'heart':
        navigation.navigate('StackBarChart');
        break;
      default:
        console.warn(`Unknown type: ${type}`);
        break;
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Vizionary Dashboard</Text>
      <CustomCardView description='Compare values across categories at a glance.' containerStyle={[styles.chartSection, { width: chartContainerWidth }]} type='barchart' title='Bar Charts' onPress={handleNavigationPress}>
        <VictoryBarChart
          data={victoryBarData}
          keys={{ x: 'label', y: 'value' }}
          tooltip={{ show: true, position: 'inline' ,animated:true}}
          unit="$"
          barStyle={{
            width: 18,
            colors: ['#43C6AC', '#DCE35B'],
            roundedCorners: { topLeft: 4, topRight: 4 },
          }}
          axisOptions={{
            labelColor: '#222',
          }}
          containerStyle={{ width: chartContainerWidth, height: 300 }}
        />
      </CustomCardView>

      <CustomCardView description="Compare two values per category with grouped bars." containerStyle={[styles.chartSection, { width: chartContainerWidth }]} type='barchart' title='Group Bar Charts' onPress={handleNavigationPress}>
        <VictoryBarGroupChart
          data={fitnessBarGroupData}
          customStyles={{ width: chartContainerWidth, height: 220 }}
          barWidth={13}
          labelColor="#333"
          colors={['#4A90E2', '#F5A623']}
        />
      </CustomCardView>

      <CustomCardView description="Track trends over time with an interactive line chart." containerStyle={[styles.chartSection, { width: chartContainerWidth }]} type="linechart" title="Line Chart" onPress={handleNavigationPress}>
        <CustomVictoryLineChart
          data={lineChartData[0].data}
          series={[createSeriesConfig('value', '#1877F2', { unit: 'kg', label: 'Value' })]}
          xKey="label"
          width={chartContainerWidth}
          height={230}
          axisOptions={{lineColor:'rgba(0,0,0,0,0.001)'}}
        />
      </CustomCardView>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 32, paddingTop: 32 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'left', marginBottom: 24,marginLeft:12 },
  chartSection: { marginTop: 32, alignItems: 'center', alignSelf: 'center' },
  chartTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 8, textAlign: 'center' },
});

export default HomeScreen; 