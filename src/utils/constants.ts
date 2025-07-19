import { Dimensions, Platform } from "react-native";

export const ISIOS = Platform.OS === 'ios';
export const ISANDROID = Platform.OS === 'android';
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

export const chartContainerWidth = SCREEN_WIDTH - 32;