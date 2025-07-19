import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import LineChart from '../components/charts/LineChart';
import { lineChartData } from '../utils/chartData';

const LineChartDetails = () => (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Line Chart Details</Text>
    <Text style={styles.desc}>Line charts are great for visualizing trends over time. Here are some examples:</Text>
    {lineChartData.map((data, idx) => (
      <View style={styles.chartPreview} key={idx}>
        <LineChart data={data} />
      </View>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  desc: { fontSize: 16, color: '#555', marginBottom: 16, textAlign: 'center' },
  chartPreview: { marginBottom: 16 },
});

export default LineChartDetails; 