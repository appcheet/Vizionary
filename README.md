# Vizionary

This is a production-level React Native app for interactive, reusable charts (Line, Bar, StackBar, etc.).

## Folder Structure

```
Vizionary/
  src/
    components/      # Reusable UI components
      charts/        # Chart components (LineChart, BarChart, StackBarChart)
    screens/         # App screens (HomeScreen, Chart screens)
    navigation/      # Navigation setup (RootNavigator)
    utils/           # Utility functions/helpers
    hooks/           # Custom React hooks
    theme/           # Theme, colors, typography, etc.
    assets/          # Images, fonts, etc.
  App.tsx            # Entry point, sets up navigation
  index.js           # Registers the app
  ...
```

## Navigation

- Uses [React Navigation](https://reactnavigation.org/) with a root stack navigator.
- `App.tsx` sets up the `NavigationContainer` and the `RootNavigator`.
- Add new screens in `src/screens/` and register them in `src/navigation/RootNavigator.tsx`.

## Adding New Charts

- Create new chart components in `src/components/charts/`.
- Use them in the appropriate screen in `src/screens/`.

## Getting Started

1. Install dependencies:
```sh
   npm install
   # or
   yarn install
```
2. Run Metro:
```sh
   npm start
   # or
   yarn start
```
3. Run the app:
```sh
   npm run android
   # or
npm run ios
   ```

---

For more details, see the [React Native docs](https://reactnative.dev/docs/getting-started).
