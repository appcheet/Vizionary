# Modern Chart System Documentation

## Overview
A modern, reusable, and performant chart system built with React Native Skia and Reanimated. All charts are fully typed with TypeScript generics, interactive, and optimized for 60 FPS performance.

## Architecture

### Core Principles
1. **Reusability**: All components accept generic data types
2. **Performance**: Worklet-based interactions for 60 FPS
3. **Type Safety**: Full TypeScript support with generics
4. **Modularity**: Composable hooks and components
5. **Responsiveness**: Adaptive to screen sizes

## Components

### ModernLineChart
A fully featured line chart with area fill, gradients, and interactivity.

```tsx
import { ModernLineChart } from './components/ModernLineChart';

interface DataPoint {
  timestamp: number;
  value: number;
}

<ModernLineChart<DataPoint>
  data={myData}
  xKey={(d, i) => i}
  yKey={(d) => d.value}
  colors={['#10b981', '#059669']}
  showArea={true}
  showGrid={true}
  showMarker={true}
  onPointSelect={(index, data) => console.log(data)}
/>
```

**Props:**
- `data: T[]` - Array of data points (generic type)
- `xKey: keyof T | (d, i) => any` - X-axis accessor
- `yKey: keyof T | (d) => any` - Y-axis accessor
- `colors?: string[]` - Gradient colors
- `showArea?: boolean` - Show area fill
- `showGrid?: boolean` - Show grid lines
- `showMarker?: boolean` - Show interactive marker
- `curve?: d3.CurveFactory` - D3 curve type
- `onPointSelect?: (index, data) => void` - Selection callback

### ModernBarChart
Interactive bar chart with customizable colors and animations.

```tsx
import { ModernBarChart } from './components/ModernBarChart';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

<ModernBarChart<BarData>
  data={myData}
  xKey={(d) => d.label}
  yKey={(d) => d.value}
  colorKey={(d) => d.color || '#10b981'}
  showGradient={true}
  onBarSelect={(index, data) => console.log(data)}
/>
```

**Props:**
- `data: T[]` - Array of data points
- `xKey: keyof T | (d, i) => string` - X-axis labels
- `yKey: keyof T | (d) => number` - Y-axis values
- `colorKey?: keyof T | (d) => string` - Bar colors
- `showGradient?: boolean` - Apply gradient to bars
- `barRadius?: number` - Corner radius
- `onBarSelect?: (index, data) => void` - Selection callback

## Hooks

### useInteractiveChart
Provides pan gesture handling with automatic snapping.

```tsx
import { useInteractiveChart } from './hooks/useChartInteraction';

const { touchX, touchActive, selectedIndex, gesture } = useInteractiveChart({
  data: myData,
  xPoints: calculatedXPoints,
  onIndexChange: (index) => console.log(index),
  snapThreshold: 30,
  animationDuration: 200,
});
```

### useTapInteraction
Simple tap gesture for buttons and gauges.

```tsx
import { useTapInteraction } from './hooks/useChartInteraction';

const { touchActive, gesture, scaleStyle } = useTapInteraction(() => {
  console.log('Tapped!');
});
```

### useChartAnimation
Entry animation for charts.

```tsx
import { useChartAnimation } from './hooks/useChartInteraction';

const { progress, startAnimation } = useChartAnimation(1000);

useEffect(() => {
  startAnimation();
}, []);
```

### useScale
Create D3 scales with memoization.

```tsx
import { useScale } from './hooks/useChartScales';

const xScale = useScale('linear', {
  domain: [0, 100],
  range: [0, chartWidth],
});
```

### useLinePath / useAreaPath
Generate Skia paths from data.

```tsx
import { useLinePath, useAreaPath } from './hooks/useChartScales';

const linePath = useLinePath(
  data,
  (d, i) => xScale(i),
  (d) => yScale(d.value),
  d3.curveMonotoneX
);
```

## Reusable Components

### InteractiveMarker
```tsx
<InteractiveMarker
  touchX={touchX}
  touchY={touchY}
  touchActive={touchActive}
  color="#10b981"
  size={6}
  showGlow={true}
/>
```

### VerticalGuideLine
```tsx
<VerticalGuideLine
  x={touchX}
  y1={0}
  y2={chartHeight}
  opacity={touchActive}
/>
```

### GridLines
```tsx
<GridLines
  width={chartWidth}
  height={chartHeight}
  yValues={[20, 40, 60, 80, 100]}
  color="#ffffff08"
/>
```

## Performance Optimization

### Best Practices
1. **Use worklets**: All gesture handlers marked with `'worklet'`
2. **Memoize calculations**: Use `useMemo` for expensive operations
3. **Derive values**: Use `useDerivedValue` for reactive calculations
4. **Batch updates**: Group related state changes
5. **Optimize paths**: Pre-calculate Skia paths in `useMemo`

### Example Optimization
```tsx
// ❌ Bad - Recalculates on every render
const xPoints = data.map((d, i) => xScale(i));

// ✅ Good - Memoized
const xPoints = useMemo(
  () => data.map((d, i) => xScale(i)),
  [data, xScale]
);
```

## Migration Guide

### From Old Charts to Modern Charts

**Before:**
```tsx
<BarChartWelltory
  data={[
    { label: 'A', value: 10 },
    { label: 'B', value: 20 },
  ]}
/>
```

**After:**
```tsx
<ModernBarChart
  data={[
    { label: 'A', value: 10 },
    { label: 'B', value: 20 },
  ]}
  xKey="label"
  yKey="value"
/>
```

## Customization

### Custom Colors
```tsx
<ModernLineChart
  data={data}
  xKey="x"
  yKey="y"
  colors={['#ef4444', '#f97316', '#fbbf24']}
/>
```

### Custom Curves
```tsx
import * as d3 from 'd3';

<ModernLineChart
  data={data}
  xKey="x"
  yKey="y"
  curve={d3.curveStep} // or curveStepAfter, curveBasis, etc.
/>
```

### Custom Padding
```tsx
<ModernLineChart
  data={data}
  xKey="x"
  yKey="y"
  padding={{ top: 40, right: 20, bottom: 60, left: 20 }}
/>
```

## Examples

### Heart Rate Chart
```tsx
interface HeartRateData {
  timestamp: number;
  bpm: number;
  hour: number;
}

<ModernLineChart<HeartRateData>
  data={heartRateData}
  xKey={(d) => d.hour}
  yKey={(d) => d.bpm}
  colors={['#ef4444', '#f97316', '#fbbf24']}
  yDomain={[40, 200]}
  showArea={true}
  title="Heart Rate"
  subtitle="Last 24 hours"
  onPointSelect={(index, data) => {
    console.log(`${data.bpm} BPM at ${data.hour}:00`);
  }}
/>
```

### Activity Bars
```tsx
interface ActivityData {
  day: string;
  steps: number;
  color: string;
}

<ModernBarChart<ActivityData>
  data={activityData}
  xKey={(d) => d.day}
  yKey={(d) => d.steps}
  colorKey={(d) => d.color}
  showGradient={true}
  title="Weekly Steps"
  onBarSelect={(index, data) => {
    console.log(`${data.steps} steps on ${data.day}`);
  }}
/>
```

## TypeScript Support

All components are fully typed with generics:

```tsx
// Type inference works automatically
const data = [{ x: 1, y: 10 }, { x: 2, y: 20 }];
<ModernLineChart data={data} xKey="x" yKey="y" />

// Or explicitly specify types
interface MyData {
  timestamp: Date;
  value: number;
}
<ModernLineChart<MyData> ... />
```

## Testing

Charts are designed to be testable:

```tsx
import { render } from '@testing-library/react-native';

test('renders chart with data', () => {
  const { getByText } = render(
    <ModernLineChart
      data={testData}
      xKey="x"
      yKey="y"
      title="Test Chart"
    />
  );
  expect(getByText('Test Chart')).toBeTruthy();
});
```

## Future Enhancements

- [ ] Multi-line charts
- [ ] Stacked bar charts
- [ ] Pie/Donut charts
- [ ] Scatter plots
- [ ] Candlestick charts
- [ ] Real-time data streaming
- [ ] Export to image
- [ ] Accessibility improvements
