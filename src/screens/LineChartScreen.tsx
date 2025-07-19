import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import LineChart from '../components/charts/LineChart';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'LineChart'>;

const LineChartScreen = () => {
  const navigation = useNavigation<Nav>();
  return (
    <View style={styles.container}>
      <LineChart />
      <Button title="See more related charts" onPress={() => navigation.navigate('LineChartDetails')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
});

export default LineChartScreen; 