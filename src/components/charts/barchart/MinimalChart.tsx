import React from "react";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import LinearGradient from "react-native-linear-gradient";
// import { Icon } from "./ui/Icon";



// const tintColor = '#7c3aed';
// const textColor = '#09090b';
// const backgroundColor = '#fafafa';
// const borderColor = '#09090b20'
// const iconColor = '#a1a1aa'

// const Colors = {
//   text: textColor,
//   background: backgroundColor,
//   border: borderColor,
//   tint: tintColor,
//   icon: iconColor,
//   tabIconDefault: iconColor,
//   tabIconSelected: tintColor,
// };


export interface TimeSeriesData {
  value: number;
  label: string;
}

export const yearlyData: TimeSeriesData[] = [
  { value: 45, label: 'Jan' },
  { value: 52, label: 'Feb' },
  { value: 61, label: 'Mar' },
  { value: 58, label: 'Apr' },
  { value: 63, label: 'May' },
  { value: 72, label: 'Jun' },
  { value: 80, label: 'Jul' },
  { value: 85, label: 'Aug' },
  { value: 78, label: 'Sep' },
  { value: 71, label: 'Oct' },
  { value: 68, label: 'Nov' },
  { value: 75, label: 'Dec' },
];

export const weeklyData: TimeSeriesData[] = [
  { value: 30, label: 'Mon' },
  { value: 45, label: 'Tue' },
  { value: 55, label: 'Wed' },
  { value: 50, label: 'Thu' },
  { value: 60, label: 'Fri' },
  { value: 75, label: 'Sat' },
  { value: 65, label: 'Sun' },
];

export const generateMonthlyData = (year: number, month: number): TimeSeriesData[] => {
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, index) => ({
    value: Math.floor(Math.random() * 50) + 30, // Random value between 30 and 80
    label: `${index + 1}`,
  }));  
};


const currentDate = new Date();
export const monthlyData = generateMonthlyData(
  currentDate.getFullYear(),
  currentDate.getMonth() + 1
);


const Color = {
    grayscale: {
        50:  "#000000",
        100:  "#1A1A1A",
        200: "#333333",
        300: "#4D4D4D",
        400: "#666666",
        500: "#808080",
        600:  "#999999",
        700:  "#B3B3B3",
        800:  "#CCCCCC",
        900:  "#E6E6E6",
        950: "#FFFFFF",
      },
    slate: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
      950: "#020617",
    },
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
      950: "#030712",
    },
    zinc: {
      50: "#fafafa",
      100: "#f4f4f5",
      200: "#e4e4e7",
      300: "#d4d4d8",
      400: "#a1a1aa",
      500: "#71717a",
      600: "#52525b",
      700: "#3f3f46",
      800: "#27272a",
      900: "#18181b",
      950: "#09090b",
    },
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      950: "#0a0a0a",
    },
    stone: {
      50: "#fafaf9",
      100: "#f5f5f4",
      200: "#e7e5e4",
      300: "#d6d3d1",
      400: "#a8a29e",
      500: "#78716c",
      600: "#57534e",
      700: "#44403c",
      800: "#292524",
      900: "#1c1917",
      950: "#0c0a09",
    },
    red: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
      950: "#450a0a",
    },
    orange: {
      50: "#fff7ed",
      100: "#ffedd5",
      200: "#fed7aa",
      300: "#fdba74",
      400: "#fb923c",
      500: "#f97316",
      600: "#ea580c",
      700: "#c2410c",
      800: "#9a3412",
      900: "#7c2d12",
      950: "#431407",
    },
    amber: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
      950: "#451a03",
    },
    yellow: {
      50: "#fefce8",
      100: "#fef9c3",
      200: "#fef08a",
      300: "#fde047",
      400: "#facc15",
      500: "#eab308",
      600: "#ca8a04",
      700: "#a16207",
      800: "#854d0e",
      900: "#713f12",
      950: "#422006",
    },
    lime: {
      50: "#f7fee7",
      100: "#ecfccb",
      200: "#d9f99d",
      300: "#bef264",
      400: "#a3e635",
      500: "#84cc16",
      600: "#65a30d",
      700: "#4d7c0f",
      800: "#3f6212",
      900: "#365314",
      950: "#1a2e05",
    },
    green: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
      950: "#052e16",
    },
    emerald: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
      950: "#022c22",
    },
    teal: {
      50: "#f0fdfa",
      100: "#ccfbf1",
      200: "#99f6e4",
      300: "#5eead4",
      400: "#2dd4bf",
      500: "#14b8a6",
      600: "#0d9488",
      700: "#0f766e",
      800: "#115e59",
      900: "#134e4a",
      950: "#042f2e",
    },
    cyan: {
      50: "#ecfeff",
      100: "#cffafe",
      200: "#a5f3fc",
      300: "#67e8f9",
      400: "#22d3ee",
      500: "#06b6d4",
      600: "#0891b2",
      700: "#0e7490",
      800: "#155e75",
      900: "#164e63",
      950: "#083344",
    },
    sky: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
      950: "#082f49",
    },
    blue: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
      950: "#172554",
    },
    indigo: {
      50: "#eef2ff",
      100: "#e0e7ff",
      200: "#c7d2fe",
      300: "#a5b4fc",
      400: "#818cf8",
      500: "#6366f1",
      600: "#4f46e5",
      700: "#4338ca",
      800: "#3730a3",
      900: "#312e81",
      950: "#1e1b4b",
    },
    violet: {
      50: "#f5f3ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
      950: "#2e1065",
    },
    purple: {
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      300: "#d8b4fe",
      400: "#c084fc",
      500: "#a855f7",
      600: "#9333ea",
      700: "#7e22ce",
      800: "#6b21a8",
      900: "#581c87",
      950: "#3b0764",
    },
    fuchsia: {
      50: "#fdf4ff",
      100: "#fae8ff",
      200: "#f5d0fe",
      300: "#f0abfc",
      400: "#e879f9",
      500: "#d946ef",
      600: "#c026d3",
      700: "#a21caf",
      800: "#86198f",
      900: "#701a75",
      950: "#4a044e",
    },
    pink: {
      50: "#fdf2f8",
      100: "#fce7f3",
      200: "#fbcfe8",
      300: "#f9a8d4",
      400: "#f472b6",
      500: "#ec4899",
      600: "#db2777",
      700: "#be185d",
      800: "#9d174d",
      900: "#831843",
      950: "#500724",
    },
    rose: {
      50: "#fff1f2",
      100: "#ffe4e6",
      200: "#fecdd3",
      300: "#fda4af",
      400: "#fb7185",
      500: "#f43f5e",
      600: "#e11d48",
      700: "#be123c",
      800: "#9f1239",
      900: "#881337",
      950: "#4c0519",
    },
  };

interface BarData {
  value: number;
  label?: string;
  frontColor?: string;
  [key: string]: any;
}

// Color themes using TWPalette
const colorThemes = {
  blue: { name: "blue", primary: 500, accent: 600 },
  purple: { name: "purple", primary: 500, accent: 600 },
  emerald: { name: "emerald", primary: 500, accent: 600 },
  orange: { name: "orange", primary: 500, accent: 600 },
  pink: { name: "pink", primary: 500, accent: 600 },
  cyan: { name: "cyan", primary: 500, accent: 600 },
} as const;

type ColorTheme = keyof typeof colorThemes;

export default function MinimalChart() {
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [colorTheme, setColorTheme] = useState<ColorTheme>("blue");

  const theme = colorThemes[colorTheme];
  const themeColor = Color[theme.name as keyof typeof Color];

  const getMonthName = (month: number) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[month];
  };

  const navigateMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setSelectedBarIndex(null);
  };

  const monthlyData = useMemo(
    () => generateMonthlyData(currentYear, currentMonth + 1),
    [currentYear, currentMonth]
  );

  const getChartData = useCallback(() => {
    return monthlyData.map((item, index) => ({
      ...item,
      frontColor:
        selectedBarIndex === index
          ? themeColor[theme.accent]
          : themeColor[theme.primary],
      gradientColor:
        selectedBarIndex === index ? themeColor[400] : themeColor[300],
      topLabelComponent: () =>
        selectedBarIndex === index ? (
          <Text
            style={{
              color: themeColor[700],
              fontSize: 10,
              fontWeight: "600",
              marginBottom: 4,
            }}
          >
            {item.value}
          </Text>
        ) : null,
    }));
  }, [monthlyData, selectedBarIndex, themeColor, theme]);

  const bgColors = [
    Color[colorThemes[colorTheme].name][100],
    "#ffffff",
    Color[colorThemes[colorTheme].name][100],
  ] as const;

  return (
    // <LinearGradient
    //   colors={bgColors}
    //   style={{ flex: 1 }}
    //   start={{ x: 0, y: 0 }}
    //   end={{ x: 1, y: 1 }}
    // >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flex:1}}
      >
        {/* Stats Cards */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 12,
            marginVertical: 32,
            paddingHorizontal: 16,
          }}
        >
          <View style={{ flex: 1, ...styles.card }}>
            <Text style={styles.label}>Average</Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: Color.gray[900],
                marginTop: 4,
              }}
            >
              {Math.round(
                monthlyData.reduce((sum, item) => sum + item.value, 0) /
                  monthlyData.length
              )}
            </Text>
          </View>

          <View style={{ flex: 1, ...styles.card }}>
            <Text style={styles.label}>Total</Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: Color.gray[900],
                marginTop: 4,
              }}
            >
              {monthlyData.reduce((sum, item) => sum + item.value, 0)}
            </Text>
          </View>

          <View style={{ flex: 1, ...styles.card }}>
            <Text style={styles.label}>Peak</Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: Color.gray[900],
                marginTop: 4,
              }}
            >
              {Math.max(...monthlyData.map((item) => item.value))}
            </Text>
          </View>
        </View>

        {/* Month Navigation */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            paddingHorizontal: 16,
          }}
        >
          <Pressable
            onPress={() => navigateMonth(-1)}
            style={{
              padding: 8,
              borderRadius: 8,
            }}
            hitSlop={20}
          >
           <Text>{"<"}</Text>
          </Pressable>

          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: Color.gray[900],
            }}
          >
            {getMonthName(currentMonth)} {currentYear}
          </Text>

          <Pressable
            onPress={() => navigateMonth(1)}
            style={{
              padding: 8,
              borderRadius: 8,
            }}
            hitSlop={20}
          >
            <Text>{">"}</Text>
          </Pressable>
        </View>

        {/* Chart Container */}
        <View
          style={{
            marginBottom: 32,
            overflow: "hidden",
          }}
        >
          <BarChart
            noOfSections={4}
            barBorderRadius={4}
            data={getChartData()}
            yAxisThickness={0}
            xAxisThickness={0}
            // hideYAxisText
            xAxisLabelTextStyle={{
              color: Color.gray[400],
              fontSize: 12,
              fontWeight: "500",
            }}
            yAxisTextStyle={{
              color: Color.gray[400],
              fontSize: 12,
              fontWeight: "500",
            }}
            showXAxisIndices={false}
            // renderTooltip={() => (
            //   <View style={{ backgroundColor: "white" }}>
            //     <Text>Tooltip</Text>
            //   </View>
            // )}
            isAnimated
            animationDuration={300}
            onPress={(_item: BarData, index: number) => {
              setSelectedBarIndex(selectedBarIndex === index ? null : index);
            }}
            showGradient
            dashGap={10}
          />
        </View>
        {/* Color Theme Selector */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text
            style={{
              ...styles.label,
              marginBottom: 12,
            }}
          >
            Choose Theme
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {(Object.keys(colorThemes) as ColorTheme[]).map((theme) => (
              <Pressable
                key={theme}
                onPress={() => {
                  setColorTheme(theme);
                  setSelectedBarIndex(null);
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor:
                    Color[colorThemes[theme].name as keyof typeof Color][500],
                  borderWidth: colorTheme === theme ? 3 : 0,
                  borderColor: Color.gray[900],
                  boxShadow:
                    colorTheme === theme
                      ? "0px 2px 8px rgba(0,0,0,0.2)"
                      : "none",
                }}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    // </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Color.gray[900],
  },
  subtitle: {
    fontSize: 16,
    color: Color.gray[600],
  },
  label: {
    fontSize: 14,
    color: Color.gray[600],
  },
});