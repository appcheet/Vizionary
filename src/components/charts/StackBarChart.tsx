import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChartData } from '../../types/chart';
import { stackBarChartData } from '../../utils/chartData';

interface StackBarChartProps {
  data?: ChartData;
}

const StackBarChart: React.FC<StackBarChartProps> = ({ data }) => {
  const chart = data || stackBarChartData[0];
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{chart.title}</Text>
      {chart.data.map((point, idx) => (
        <View key={idx} style={styles.row}>
          <Text style={styles.label}>{point.label} ({point.region})</Text>
          <Text style={styles.value}>{point.value}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8, backgroundColor: '#fff', borderRadius: 8, minWidth: 180 },
  title: { fontWeight: 'bold', marginBottom: 4, fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  label: { color: '#666' },
  value: { fontWeight: '600' },
});

export default StackBarChart; 