import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LineChartDetails from '../screens/LineChartDetails';
import BarChartDetails from '../screens/BarChartDetails';
import StackBarChartDetails from '../screens/StackBarChartDetails';
import StackBarChartScreen from '../screens/StackBarChartScreen';
import BarChartScreen from '../screens/BarChartScreen';
import LineChartScreen from '../screens/LineChartScreen';
import HomeScreen from '../screens/HomeScreen';
import DonutPieChartScreen from '../screens/DonutPieChartScreen';
import WelltoryAppUiScreen from '../screens/WelltoryAppUiScreen';


export type RootStackParamList = {
  Home: undefined;
  LineChart: undefined;
  BarChart: undefined;
  StackBarChart: undefined;
  LineChartDetails: undefined;
  BarChartDetails: undefined;
  StackBarChartDetails: undefined;
  DonutPieChartDetails: undefined;
  WelltoryAppUi:undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => (
  <Stack.Navigator initialRouteName="Home">
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="LineChart" component={LineChartScreen} />
    <Stack.Screen name="BarChart" component={BarChartScreen} />
    <Stack.Screen name="StackBarChart" component={StackBarChartScreen} />
    <Stack.Screen name="LineChartDetails" component={LineChartDetails} options={{ title: 'Line Chart Details' }} />
    <Stack.Screen name="BarChartDetails" component={BarChartDetails} options={{ title: 'Bar Chart Details' }} />
    <Stack.Screen name="StackBarChartDetails" component={StackBarChartDetails} options={{ title: 'Stack Bar Chart Details' }} />

    <Stack.Screen name="DonutPieChartDetails" component={DonutPieChartScreen} options={{ title: 'Donut Pie Charts' }} />

        <Stack.Screen name="WelltoryAppUi" component={WelltoryAppUiScreen} options={{ title: 'Donut Pie Charts' }} />

  </Stack.Navigator>
);

export default RootNavigator; 