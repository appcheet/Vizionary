import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChartData } from '../../types/chart';
import { lineChartData } from '../../utils/chartData';

interface LineChartProps {
  data?: ChartData;
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const chart = data || lineChartData[0];
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{chart.title}</Text>
      {chart.data.map((point, idx) => (
        <View key={idx} style={styles.row}>
          <Text style={styles.label}>{point.label}</Text>
          <Text style={styles.value}>{point.value}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8, backgroundColor: '#fff', borderRadius: 8, minWidth: 160 },
  title: { fontWeight: 'bold', marginBottom: 4, fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  label: { color: '#666' },
  value: { fontWeight: '600' },
});

export default LineChart; 