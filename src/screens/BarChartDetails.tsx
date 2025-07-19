import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
// import BarChart from '../components/charts/BarChart';
import { barChartData } from '../utils/chartData';

const BarChartDetails = () => (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Bar Chart Details</Text>
    <Text style={styles.desc}>Bar charts are useful for comparing values across categories. Here are some examples:</Text>
    {barChartData.map((data, idx) => (
      <View style={styles.chartPreview} key={idx}>
        {/* <BarChart data={data} /> */}
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

export default BarChartDetails; 