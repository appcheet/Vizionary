import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import StackBarChart from '../components/charts/StackBarChart';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'StackBarChart'>;

const StackBarChartScreen = () => {
  const navigation = useNavigation<Nav>();
  return (
    <View style={styles.container}>
      <StackBarChart />
      <Button title="See more related charts" onPress={() => navigation.navigate('StackBarChartDetails')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
});

export default StackBarChartScreen; 