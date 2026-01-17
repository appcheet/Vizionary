import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import BarChartWelltory from '../components/velltory-ui/charts/BarChartWelltory'
import WelltoryChartsMain from '../components/velltory-ui/charts/WelltoryChartsMain'

const WelltoryAppUiScreen = () => {
  return (
    <View style={{ flex: 1 }}>
     <WelltoryChartsMain/>
    </View>
  )
}

export default WelltoryAppUiScreen

const styles = StyleSheet.create({})