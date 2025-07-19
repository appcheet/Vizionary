import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import StackBarChart from '../components/charts/StackBarChart';
import { stackBarChartData } from '../utils/chartData';

const StackBarChartDetails = () => (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Stack Bar Chart Details</Text>
    <Text style={styles.desc}>Stack bar charts are ideal for showing part-to-whole relationships. Here are some examples:</Text>
    {stackBarChartData.map((data, idx) => (
      <View style={styles.chartPreview} key={idx}>
        <StackBarChart data={data} />
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

export default StackBarChartDetails; 