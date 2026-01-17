# 🔧 Chart System Troubleshooting Guide

## Current Errors & Solutions

### ❌ Error: "Should not already be working"

**Cause:** Too many interactive charts rendering simultaneously overwhelms Reanimated's worklet runtime.

**Solutions Applied:**

1. **✅ Lazy Loading** - Charts now render progressively with delays
2. **✅ React.memo** - Prevents unnecessary re-renders
3. **✅ Placeholder Loading** - Shows lightweight placeholder until chart is ready

**If error persists:**

```tsx
// Option 1: Increase delay between charts
<LazyChart delay={3000}> {/* Increase from 300ms to 3000ms */}
    <YourChart />
</LazyChart>

// Option 2: Comment out some charts temporarily
{/* <BatteryChartDetail /> */}
{/* <HealthBarChart /> */}
```

### ❌ Error: "Invalid string prop value received"

**Cause:** Passing `SharedValue` to Skia prop that expects primitive value.

**Solution Pattern:**

```tsx
// ❌ BAD - Passing SharedValue directly
<Line p1={vec(touchX.value, 0)} /> // ERROR!

// ✅ GOOD - Use useDerivedValue
const lineP1 = useDerivedValue(() => vec(touchX.value, 0));
<Line p1={lineP1} />
```

**Already Fixed In:**
- ✅ BatteryChartDetail.tsx
- ✅ FullDayHeartRateChart.tsx
- ✅ All advanced charts

### ❌ Error: "Tried to call non-worklet function"

**Cause:** Calling D3 scale functions inside worklets.

**Solution Pattern:**

```tsx
// ❌ BAD - Calling scale in worklet
const y = useDerivedValue(() => yScale(data[i].value)); // ERROR!

// ✅ GOOD - Pre-calculate on JS thread
const yValues = useMemo(() => data.map(d => yScale(d.value)), [data]);
const y = useDerivedValue(() => yValues[i]);
```

**Already Fixed In:**
- ✅ BatteryChartDetail.tsx
- ✅ All advanced charts

## 🚀 Quick Fixes

### Fix 1: Reduce Chart Count

Comment out charts you don't need right now:

```tsx
// In WelltoryChartsMain.tsx
{/* <MultiLineChartWelltory /> */}
{/* <BarChartWelltory /> */}
{/* <GradientLineChartWelltory /> */}
```

### Fix 2: Increase Lazy Load Delays

```tsx
// Change from:
<LazyChart delay={300}>

// To:
<LazyChart delay={1000}>
```

### Fix 3: Use Advanced Charts

Replace legacy charts with optimized versions:

```tsx
// Instead of:
import BarChartWelltory from './BarChartWelltory';

// Use:
import { AdvancedBarChart } from './advanced';
```

## 📊 Performance Checklist

- [x] Lazy loading implemented
- [x] React.memo on all charts
- [x] Pre-calculated paths
- [x] Worklet-safe functions
- [ ] Remove legacy charts (optional)
- [ ] Test on physical device
- [ ] Profile with React DevTools

## 🎯 Recommended Approach

### Phase 1: Stabilize (Current)
1. ✅ Use lazy loading (implemented)
2. ✅ Add delays between charts (implemented)
3. Test on device

### Phase 2: Optimize (Next)
1. Replace legacy charts with advanced charts
2. Remove unused charts
3. Add virtualization for long lists

### Phase 3: Polish (Future)
1. Add loading states
2. Implement error boundaries
3. Add performance monitoring

## 💡 Best Practices

### DO ✅
- Use `useMemo` for expensive calculations
- Pre-calculate all paths on JS thread
- Use `React.memo` for chart components
- Implement lazy loading for multiple charts
- Use `useCallback` for event handlers
- Test on low-end devices

### DON'T ❌
- Call D3 functions in worklets
- Pass SharedValues to primitive props
- Render 10+ interactive charts simultaneously
- Forget to memoize data transformations
- Use inline functions in render
- Skip performance testing

## 🔍 Debugging Tools

### 1. React DevTools Profiler
```bash
# Enable profiling
# Record interaction
# Check which components re-render
```

### 2. Reanimated Logger
```tsx
// Add to worklet to debug
'worklet';
console.log('Touch X:', touchX.value);
```

### 3. Performance Monitor
```tsx
import { PerformanceObserver } from 'react-native';

// Monitor frame drops
```

## 📞 Need Help?

1. Check `BEST_PRACTICES.md` for patterns
2. Review `WelltoryAdvancedExample.tsx` for working code
3. Use advanced charts from `./advanced/`
4. Implement lazy loading (already done)

## 🎉 Current Status

✅ Lazy loading implemented  
✅ React.memo optimizations  
✅ Advanced chart system ready  
✅ Best practices documented  
⚠️ Some charts may need migration  

**The dashboard should now load without overwhelming Reanimated!**

---

Last Updated: 2026-01-18  
Version: 2.1.0
