import React, { useEffect, useRef } from 'react'
import { type ViewProps,type LayoutChangeEvent, View } from 'react-native'
import { SkPath, Skia, SkPoint,Color, vec,LinearGradient, Canvas, Path,  Group,
  PathCommand,
  mix,
  Circle,
  Shadow,Vector, 
  PathVerb} from '@shopify/react-native-skia'
import { memo, useCallback, useMemo, useState } from 'react'

import Reanimated, {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  useDerivedValue,
  cancelAnimation,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  SharedValue
} from 'react-native-reanimated'
import { GestureDetector,PanGesture,Gesture } from 'react-native-gesture-handler'


const CIRCLE_RADIUS = 5
const CIRCLE_RADIUS_MULTIPLIER = 6
const PIXEL_RATIO = 2
// Types ========================

// ===>>
interface GraphXRange {
  min: Date
  max: Date
}

interface GraphYRange {
  min: number
  max: number
}

interface GraphPathRange {
  x: GraphXRange
  y: GraphYRange
}

type GraphPathWithGradient = { path: SkPath; gradientPath: SkPath }

type GraphPathConfig = {
  /**
   * Graph Points to use for the Path. Will be normalized and centered.
   */
  pointsInRange: GraphPoint[]
  /**
   * Optional Padding (left, right) for the Graph to correctly round the Path.
   */
  horizontalPadding: number
  /**
   * Optional Padding (top, bottom) for the Graph to correctly round the Path.
   */
  verticalPadding: number
  /**
   * Height of the Canvas (Measured with onLayout)
   */
  canvasHeight: number
  /**
   * Width of the Canvas (Measured with onLayout)
   */
  canvasWidth: number
  /**
   * Range of the graph's x and y-axis
   */
  range: GraphPathRange
}

type GraphPathConfigWithGradient = GraphPathConfig & {
  shouldFillGradient: true
}
type GraphPathConfigWithoutGradient = GraphPathConfig & {
  shouldFillGradient: false
}

// =====>>
interface GraphPoint {
  value: number
  date: Date
}

type GraphRange = Partial<GraphPathRange>

interface SelectionDotProps {
  isActive: SharedValue<boolean>
  color: BaseLineGraphProps['color']
  lineThickness: BaseLineGraphProps['lineThickness']
  circleX: SharedValue<number>
  circleY: SharedValue<number>
}

interface BaseLineGraphProps extends ViewProps {
  /**
   * All points to be marked in the graph. Coordinate system will adjust to scale automatically.
   */
  points: GraphPoint[]
  /**
   * Range of the graph's x and y-axis. The range must be greater
   * than the range given by the points.
   */
  range?: GraphRange
  /**
   * Color of the graph line (path)
   */
  color: string
  /**
   * (Optional) Colors for the fill gradient below the graph line
   */
  gradientFillColors?: Color[]
  /**
   * The width of the graph line (path)
   *
   * @default 3
   */
  lineThickness?: number
  /**
   * Enable the Fade-In Gradient Effect at the beginning of the Graph
   */
  enableFadeInMask?: boolean
}

type StaticLineGraphProps = BaseLineGraphProps & {
  /* any static-only line graph props? */
}
type AnimatedLineGraphProps = BaseLineGraphProps & {
  /**
   * Whether to enable Graph scrubbing/pan gesture.
   */
  enablePanGesture?: boolean
  /**
   * The color of the selection dot when the user is panning the graph.
   */
  selectionDotShadowColor?: string
  /**
   * Horizontal padding applied to graph, so the pan gesture dot doesn't get cut off horizontally
   */
  horizontalPadding?: number
  /**
   * Vertical padding applied to graph, so the pan gesture dot doesn't get cut off vertically
   */
  verticalPadding?: number
  /**
   * Enables an indicator which is displayed at the end of the graph
   */
  enableIndicator?: boolean
  /**
   * Let's the indicator pulsate
   */
  indicatorPulsating?: boolean
  /**
   * Delay after which the pan gesture starts
   */
  panGestureDelay?: number

  /**
   * Called for each point while the user is scrubbing/panning through the graph
   */
  onPointSelected?: (point: GraphPoint) => void
  /**
   * Called once the user starts scrubbing/panning through the graph
   */
  onGestureStart?: () => void
  /**
   * Called once the user stopped scrubbing/panning through the graph
   */
  onGestureEnd?: () => void

  /**
   * The element that renders the selection dot
   */
  SelectionDot?: React.ComponentType<SelectionDotProps> | null

  /**
   * The element that gets rendered above the Graph (usually the "max" point/value of the Graph)
   */
  TopAxisLabel?: () => React.ReactElement | null

  /**
   * The element that gets rendered below the Graph (usually the "min" point/value of the Graph)
   */
  BottomAxisLabel?: () => React.ReactElement | null
}




// utils =========================
function getGraphPathRange(
  points: GraphPoint[],
  range?: GraphRange
): GraphPathRange {
  const minValueX = range?.x?.min ?? points[0]?.date ?? new Date()
  const maxValueX =
    range?.x?.max ?? points[points.length - 1]?.date ?? new Date()

  const minValueY =
    range?.y?.min ??
    points.reduce(
      (prev, curr) => (curr.value < prev ? curr.value : prev),
      Number.MAX_SAFE_INTEGER
    )
  const maxValueY =
    range?.y?.max ??
    points.reduce(
      (prev, curr) => (curr.value > prev ? curr.value : prev),
      Number.MIN_SAFE_INTEGER
    )

  return {
    x: { min: minValueX, max: maxValueX },
    y: { min: minValueY, max: maxValueY },
  }
}

const getXPositionInRange = (
  date: Date,
  xRange: GraphXRange
): number => {
  const diff = xRange.max.getTime() - xRange.min.getTime()
  const x = date.getTime()

  return (x - xRange.min.getTime()) / diff
}

const getXInRange = (
  width: number,
  date: Date,
  xRange: GraphXRange
): number => {
  return Math.floor(width * getXPositionInRange(date, xRange))
}

const getYPositionInRange = (
  value: number,
  yRange: GraphYRange
): number => {
  const diff = yRange.max - yRange.min
  const y = value

  return (y - yRange.min) / diff
}

const getYInRange = (
  height: number,
  value: number,
  yRange: GraphYRange
): number => {
  return Math.floor(height * getYPositionInRange(value, yRange))
}

const getPointsInRange = (
  allPoints: GraphPoint[],
  range: GraphPathRange
) => {
  return allPoints.filter((point) => {
    const portionFactorX = getXPositionInRange(point.date, range.x)
    return portionFactorX <= 1 && portionFactorX >= 0
  })
}


function getSixDigitHex(color: string): `#${string}` {
  if (!color.startsWith('#'))
    throw new Error(`react-native-graph: "${color}" is not a valid hex color!`)
  const hexColor = color.substring(1) // removes '#'

  switch (hexColor.length) {
    case 3: {
      const sixDigitHex = hexColor
        .split('')
        .map((hex) => hex + hex)
        .join('')
      return `#${sixDigitHex}`
    }
    case 6:
      return `#${hexColor}`
    case 8:
      return `#${hexColor.substring(0, 6)}`
    default:
      throw new Error(
        `react-native-graph: Cannot convert "${color}" to a six-digit hex color!`
      )
  }
}


 function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  if (alpha > 0) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return `rgb(${r}, ${g}, ${b})`
}


// ============>>
const round = (value: number, precision = 0): number => {
  'worklet'

  const p = Math.pow(10, precision)
  return Math.round(value * p) / p
}

// https://stackoverflow.com/questions/27176423/function-to-solve-cubic-equation-analytically
const cuberoot = (x: number): number => {
  'worklet'

  const y = Math.pow(Math.abs(x), 1 / 3)
  return x < 0 ? -y : y
}

const solveCubic = (a: number, b: number, c: number, d: number): number[] => {
  'worklet'

  if (Math.abs(a) < 1e-8) {
    // Quadratic case, ax^2+bx+c=0
    a = b
    b = c
    c = d
    if (Math.abs(a) < 1e-8) {
      // Linear case, ax+b=0
      a = b
      b = c
      if (Math.abs(a) < 1e-8) {
        // Degenerate case
        return []
      }
      return [-b / a]
    }

    const D = b * b - 4 * a * c
    if (Math.abs(D) < 1e-8) return [-b / (2 * a)]
    if (D > 0)
      return [(-b + Math.sqrt(D)) / (2 * a), (-b - Math.sqrt(D)) / (2 * a)]

    return []
  }

  // Convert to depressed cubic t^3+pt+q = 0 (subst x = t - b/3a)
  const p = (3 * a * c - b * b) / (3 * a * a)
  const q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a)
  let roots

  if (Math.abs(p) < 1e-8) {
    // p = 0 -> t^3 = -q -> t = -q^1/3
    roots = [cuberoot(-q)]
  } else if (Math.abs(q) < 1e-8) {
    // q = 0 -> t^3 + pt = 0 -> t(t^2+p)=0
    roots = [0].concat(p < 0 ? [Math.sqrt(-p), -Math.sqrt(-p)] : [])
  } else {
    const D = (q * q) / 4 + (p * p * p) / 27
    if (Math.abs(D) < 1e-8) {
      // D = 0 -> two roots
      roots = [(-1.5 * q) / p, (3 * q) / p]
    } else if (D > 0) {
      // Only one real root
      const u = cuberoot(-q / 2 - Math.sqrt(D))
      roots = [u - p / (3 * u)]
    } else {
      // D < 0, three roots, but needs to use complex numbers/trigonometric solution
      const u = 2 * Math.sqrt(-p / 3)
      const t = Math.acos((3 * q) / p / u) / 3 // D < 0 implies p < 0 and acos argument in [-1..1]
      const k = (2 * Math.PI) / 3
      roots = [u * Math.cos(t), u * Math.cos(t - k), u * Math.cos(t - 2 * k)]
    }
  }

  // Convert back from depressed cubic
  for (let i = 0; i < roots.length; i++) roots[i] -= b / (3 * a)

  return roots
}

const cubicBezier = (
  t: number,
  from: number,
  c1: number,
  c2: number,
  to: number
): number => {
  'worklet'

  const term = 1 - t
  const a = 1 * term ** 3 * t ** 0 * from
  const b = 3 * term ** 2 * t ** 1 * c1
  const c = 3 * term ** 1 * t ** 2 * c2
  const d = 1 * term ** 0 * t ** 3 * to
  return a + b + c + d
}

export const cubicBezierYForX = (
  x: number,
  a: Vector,
  b: Vector,
  c: Vector,
  d: Vector,
  precision = 2
): number => {
  'worklet'

  const pa = -a.x + 3 * b.x - 3 * c.x + d.x
  const pb = 3 * a.x - 6 * b.x + 3 * c.x
  const pc = -3 * a.x + 3 * b.x
  const pd = a.x - x
  const ts = solveCubic(pa, pb, pc, pd)
    .map((root) => round(root, precision))
    .filter((root) => root >= 0 && root <= 1)
  const t = ts[0]
  if (t == null) return 0
  return cubicBezier(t, a.y, b.y, c.y, d.y)
}

interface Cubic {
  from: Vector
  c1: Vector
  c2: Vector
  to: Vector
}

export const selectCurve = (
  cmds: PathCommand[],
  x: number
): Cubic | undefined => {
  'worklet'

  let from: Vector = vec(0, 0)
  for (let i = 0; i < cmds.length; i++) {
    const cmd = cmds[i]
    if (cmd == null) return undefined
    if (cmd[0] === PathVerb.Move) {
      from = vec(cmd[1], cmd[2])
    } else if (cmd[0] === PathVerb.Cubic) {
      const c1 = vec(cmd[1], cmd[2])
      const c2 = vec(cmd[3], cmd[4])
      const to = vec(cmd[5], cmd[6])
      if (x >= from.x && x <= to.x) {
        return {
          from,
          c1,
          c2,
          to,
        }
      }
      from = to
    }
  }
  return undefined
}

const getYForX = (
  cmds: PathCommand[],
  x: number,
  precision = 2
): number | undefined => {
  'worklet'

  const c = selectCurve(cmds, x)
  if (c == null) return undefined

  return cubicBezierYForX(x, c.from, c.c1, c.c2, c.to, precision)
}


// utils =========================



function createGraphPathBase(
  props: GraphPathConfigWithGradient
): GraphPathWithGradient
function createGraphPathBase(props: GraphPathConfigWithoutGradient): SkPath

function createGraphPathBase({
  pointsInRange: graphData,
  range,
  horizontalPadding,
  verticalPadding,
  canvasHeight: height,
  canvasWidth: width,
  shouldFillGradient,
}: GraphPathConfigWithGradient | GraphPathConfigWithoutGradient):
  | SkPath
  | GraphPathWithGradient {
  const path = Skia.Path.Make()

  // Canvas width substracted by the horizontal padding => Actual drawing width
  const drawingWidth = width - 2 * horizontalPadding
  // Canvas height substracted by the vertical padding => Actual drawing height
  const drawingHeight = height - 2 * verticalPadding

  if (graphData[0] == null) return path

  const points: SkPoint[] = []

  const startX =
    getXInRange(drawingWidth, graphData[0]!.date, range.x) + horizontalPadding
  const endX =
    getXInRange(drawingWidth, graphData[graphData.length - 1]!.date, range.x) +
    horizontalPadding

  const getGraphDataIndex = (pixel: number) =>
    Math.round(((pixel - startX) / (endX - startX)) * (graphData.length - 1))

  const getNextPixelValue = (pixel: number) => {
    if (pixel === endX || pixel + PIXEL_RATIO < endX) return pixel + PIXEL_RATIO
    return endX
  }

  for (
    let pixel = startX;
    startX <= pixel && pixel <= endX;
    pixel = getNextPixelValue(pixel)
  ) {
    const index = getGraphDataIndex(pixel)

    // Draw first point only on the very first pixel
    if (index === 0 && pixel !== startX) continue
    // Draw last point only on the very last pixel

    if (index === graphData.length - 1 && pixel !== endX) continue

    if (index !== 0 && index !== graphData.length - 1) {
      // Only draw point, when the point is exact
      const exactPointX =
        getXInRange(drawingWidth, graphData[index]!.date, range.x) +
        horizontalPadding

      const isExactPointInsidePixelRatio = Array(PIXEL_RATIO)
        .fill(0)
        .some((_value, additionalPixel) => {
          return pixel + additionalPixel === exactPointX
        })

      if (!isExactPointInsidePixelRatio) continue
    }

    const value = graphData[index]!.value
    const y =
      drawingHeight -
      getYInRange(drawingHeight, value, range.y) +
      verticalPadding

    points.push({ x: pixel, y: y })
  }

  for (let i = 0; i < points.length; i++) {
    const point = points[i]!

    // first point needs to start the path
    if (i === 0) path.moveTo(point.x, point.y)

    const prev = points[i - 1]
    const prevPrev = points[i - 2]

    if (prev == null) continue

    const p0 = prevPrev ?? prev
    const p1 = prev
    const cp1x = (2 * p0.x + p1.x) / 3
    const cp1y = (2 * p0.y + p1.y) / 3
    const cp2x = (p0.x + 2 * p1.x) / 3
    const cp2y = (p0.y + 2 * p1.y) / 3
    const cp3x = (p0.x + 4 * p1.x + point.x) / 6
    const cp3y = (p0.y + 4 * p1.y + point.y) / 6

    path.cubicTo(cp1x, cp1y, cp2x, cp2y, cp3x, cp3y)

    if (i === points.length - 1) {
      path.cubicTo(point.x, point.y, point.x, point.y, point.x, point.y)
    }
  }

  if (!shouldFillGradient) return path

  const gradientPath = path.copy()

  gradientPath.lineTo(endX, height + verticalPadding)
  gradientPath.lineTo(0 + horizontalPadding, height + verticalPadding)

  return { path: path, gradientPath: gradientPath }
}


function StaticLineGraph({
  points: allPoints,
  range,
  color,
  lineThickness = 3,
  enableFadeInMask,
  style,
  ...props
}: StaticLineGraphProps): React.ReactElement {
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  const onLayout = useCallback(
    ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
      setWidth(Math.round(layout.width))
      setHeight(Math.round(layout.height))
    },
    []
  )

  const pathRange: GraphPathRange = useMemo(
    () => getGraphPathRange(allPoints, range),
    [allPoints, range]
  )

  const pointsInRange = useMemo(
    () => getPointsInRange(allPoints, pathRange),
    [allPoints, pathRange]
  )

  const path = useMemo(
    () =>
      createGraphPath({
        pointsInRange: pointsInRange,
        range: pathRange,
        canvasHeight: height,
        canvasWidth: width,
        horizontalPadding: lineThickness,
        verticalPadding: lineThickness,
      }),
    [height, lineThickness, pathRange, pointsInRange, width]
  )

  const gradientColors = useMemo(
    () => [`${getSixDigitHex(color)}00`, `${getSixDigitHex(color)}ff`],
    [color]
  )
  const gradientFrom = useMemo(() => vec(0, 0), [])
  const gradientTo = useMemo(() => vec(width * 0.15, 0), [width])

  return (
    <View {...props} style={style} onLayout={onLayout}>
      {/* Fix for react-native-skia's incorrect type declarations */}
      <Canvas style={{flex:1}}>
        <Path
          path={path}
          strokeWidth={lineThickness}
          color={enableFadeInMask ? undefined : color}
          style="stroke"
          strokeJoin="round"
          strokeCap="round"
        >
          {enableFadeInMask && (
            <LinearGradient
              start={gradientFrom}
              end={gradientTo}
              colors={gradientColors}
            />
          )}
        </Path>
      </Canvas>
    </View>
  )
}








function DefaultSelectionDot({
  isActive,
  color,
  circleX,
  circleY,
}: SelectionDotProps): React.ReactElement {
  const circleRadius = useSharedValue(0)
  const circleStrokeRadius = useDerivedValue(
    () => circleRadius.value * CIRCLE_RADIUS_MULTIPLIER,
    [circleRadius]
  )

  const setIsActive = useCallback(
    (active: boolean) => {
      circleRadius.value = withSpring(active ? CIRCLE_RADIUS : 0, {
        mass: 1,
        stiffness: 1000,
        damping: 50,
        velocity: 0,
      })
    },
    [circleRadius]
  )

  useAnimatedReaction(
    () => isActive.value,
    (active) => {
      runOnJS(setIsActive)(active)
    },
    [isActive, setIsActive]
  )

  return (
    <Group>
      <Circle
        opacity={0.05}
        cx={circleX}
        cy={circleY}
        r={circleStrokeRadius}
        color="#333333"
      />
      <Circle cx={circleX} cy={circleY} r={circleRadius} color={color}>
        <Shadow dx={0} dy={0} color="rgba(0,0,0,0.5)" blur={4} />
      </Circle>
    </Group>
  )
}


function createGraphPath(props: GraphPathConfig): SkPath {
  return createGraphPathBase({ ...props, shouldFillGradient: false })
}

function createGraphPathWithGradient(
  props: GraphPathConfig
): GraphPathWithGradient {
  return createGraphPathBase({
    ...props,
    shouldFillGradient: true,
  })
}






type LineGraphProps =
  | ({ animated: true } & AnimatedLineGraphProps)
  | ({ animated: false } & StaticLineGraphProps)


//   =========================. Types






// hoook 

interface Config {
  enabled: boolean
  holdDuration: number
}

interface Result {
  x: Reanimated.SharedValue<number>
  y: Reanimated.SharedValue<number>
  isActive: Reanimated.SharedValue<boolean>
  gesture: PanGesture
}

function usePanGesture({ enabled, holdDuration = 300 }: Config): Result {
  const x = useSharedValue(0)
  const y = useSharedValue(0)
  const isPanGestureActive = useSharedValue(false)

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled)
        .activateAfterLongPress(holdDuration)
        .onChange((e) => {
          x.value = e.x
          y.value = e.y
        })
        .onStart(() => {
          isPanGestureActive.value = true
        })
        .onEnd(() => {
          isPanGestureActive.value = false
        }),
    [enabled, holdDuration, isPanGestureActive, x, y]
  )

  return useMemo(
    () => ({
      gesture: panGesture,
      isActive: isPanGestureActive,
      x: x,
      y: y,
    }),
    [isPanGestureActive, panGesture, x, y]
  )
}



// // =======================

const INDICATOR_RADIUS = 7
const INDICATOR_BORDER_MULTIPLIER = 1.3
const INDICATOR_PULSE_BLUR_RADIUS_SMALL =
  INDICATOR_RADIUS * INDICATOR_BORDER_MULTIPLIER
const INDICATOR_PULSE_BLUR_RADIUS_BIG =
  INDICATOR_RADIUS * INDICATOR_BORDER_MULTIPLIER + 20

function AnimatedLineGraph({
  points: allPoints,
  color,
  gradientFillColors,
  lineThickness = 3,
  range,
  enableFadeInMask,
  enablePanGesture = false,
  onPointSelected,
  onGestureStart,
  onGestureEnd,
  panGestureDelay = 300,
  SelectionDot=DefaultSelectionDot,
  enableIndicator = false,
  indicatorPulsating = false,
  horizontalPadding = enableIndicator
    ? Math.ceil(INDICATOR_RADIUS * INDICATOR_BORDER_MULTIPLIER)
    : 0,
  verticalPadding = lineThickness,
  TopAxisLabel,
  BottomAxisLabel,
  ...props
}: AnimatedLineGraphProps): React.ReactElement {
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const interpolateProgress = useSharedValue(0)

  const { gesture, isActive, x } = usePanGesture({
    enabled: enablePanGesture,
    holdDuration: panGestureDelay,
  })
  const circleX = useSharedValue(0)
  const circleY = useSharedValue(0)
  const pathEnd = useSharedValue(0)
  const indicatorRadius = useSharedValue(enableIndicator ? INDICATOR_RADIUS : 0)
  const indicatorBorderRadius = useDerivedValue(
    () => indicatorRadius.value * INDICATOR_BORDER_MULTIPLIER
  )

  const pulseTrigger = useDerivedValue(() => (isActive.value ? 1 : 0))
  const indicatorPulseAnimation = useSharedValue(0)
  const indicatorPulseRadius = useDerivedValue(() => {
    if (pulseTrigger.value === 0) {
      return mix(
        indicatorPulseAnimation.value,
        INDICATOR_PULSE_BLUR_RADIUS_SMALL,
        INDICATOR_PULSE_BLUR_RADIUS_BIG
      )
    }
    return 0
  })
  const indicatorPulseOpacity = useDerivedValue(() => {
    if (pulseTrigger.value === 0) {
      return mix(indicatorPulseAnimation.value, 1, 0)
    }
    return 0
  })

  const positions = useDerivedValue(() => [
    0,
    Math.min(0.15, pathEnd.value),
    pathEnd.value,
    pathEnd.value,
    1,
  ])

  const onLayout = useCallback(
    ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
      setWidth(Math.round(layout.width))
      setHeight(Math.round(layout.height))
    },
    []
  )

  const straightLine = useMemo(() => {
    const path = Skia.Path.Make()
    path.moveTo(0, height / 2)
    for (let i = 0; i < width - 1; i += 2) {
      const x = i
      const y = height / 2
      path.cubicTo(x, y, x, y, x, y)
    }

    return path
  }, [height, width])

  const paths = useSharedValue<{ from?: SkPath; to?: SkPath }>({})
  const gradientPaths = useSharedValue<{ from?: SkPath; to?: SkPath }>({})
  const commands = useSharedValue<PathCommand[]>([])
  const [commandsChanged, setCommandsChanged] = useState(0)
  const pointSelectedIndex = useRef<number>(undefined)

  const pathRange: GraphPathRange = useMemo(
    () => getGraphPathRange(allPoints, range),
    [allPoints, range]
  )

  const pointsInRange = useMemo(
    () => getPointsInRange(allPoints, pathRange),
    [allPoints, pathRange]
  )

  const drawingWidth = useMemo(
    () => width - 2 * horizontalPadding,
    [horizontalPadding, width]
  )

  const lineWidth = useMemo(() => {
    const lastPoint = pointsInRange[pointsInRange.length - 1]

    if (lastPoint == null) return drawingWidth

    return Math.max(getXInRange(drawingWidth, lastPoint.date, pathRange.x), 0)
  }, [drawingWidth, pathRange.x, pointsInRange])

  const indicatorX = useDerivedValue(
    () => Math.floor(lineWidth) + horizontalPadding
  )
  const indicatorY = useDerivedValue(
    () => getYForX(commands.value, indicatorX.value) || 0
  )

  const indicatorPulseColor = useMemo(() => hexToRgba(color, 0.4), [color])

  const shouldFillGradient = gradientFillColors != null

  useEffect(() => {
    if (height < 1 || width < 1) {
      // view is not yet measured!
      return
    }
    if (pointsInRange.length < 1) {
      // points are still empty!
      return
    }

    let path
    let gradientPath

    const createGraphPathProps = {
      pointsInRange,
      range: pathRange,
      horizontalPadding,
      verticalPadding,
      canvasHeight: height,
      canvasWidth: width,
    }

    if (shouldFillGradient) {
      const { path: pathNew, gradientPath: gradientPathNew } =
        createGraphPathWithGradient(createGraphPathProps)

      path = pathNew
      gradientPath = gradientPathNew
    } else {
      path = createGraphPath(createGraphPathProps)
    }

    commands.value = path.toCmds()

    if (gradientPath != null) {
      const previous = gradientPaths.value
      let from: SkPath = previous.to ?? straightLine
      if (previous.from != null && interpolateProgress.value < 1)
        from =
          from.interpolate(previous.from, interpolateProgress.value) ?? from

      if (gradientPath.isInterpolatable(from)) {
        gradientPaths.value = {
          from,
          to: gradientPath,
        }
      } else {
        gradientPaths.value = {
          from: gradientPath,
          to: gradientPath,
        }
      }
    }

    const previous = paths.value
    let from: SkPath = previous.to ?? straightLine
    if (previous.from != null && interpolateProgress.value < 1)
      from = from.interpolate(previous.from, interpolateProgress.value) ?? from

    if (path.isInterpolatable(from)) {
      paths.value = {
        from,
        to: path,
      }
    } else {
      paths.value = {
        from: path,
        to: path,
      }
    }

    setCommandsChanged(commandsChanged + 1)

    interpolateProgress.value = withSpring(1, {
      mass: 1,
      stiffness: 500,
      damping: 400,
      velocity: 0,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    height,
    horizontalPadding,
    interpolateProgress,
    pathRange,
    paths,
    shouldFillGradient,
    gradientPaths,
    pointsInRange,
    range,
    straightLine,
    verticalPadding,
    width,
  ])

  const gradientColors = useMemo(() => {
    if (enableFadeInMask) {
      return [
        `${getSixDigitHex(color)}00`,
        `${getSixDigitHex(color)}ff`,
        `${getSixDigitHex(color)}ff`,
        `${getSixDigitHex(color)}33`,
        `${getSixDigitHex(color)}33`,
      ]
    }
    return [
      color,
      color,
      color,
      `${getSixDigitHex(color)}33`,
      `${getSixDigitHex(color)}33`,
    ]
  }, [color, enableFadeInMask])

  const path = useDerivedValue(
    () => {
      const from = paths.value.from ?? straightLine
      const to = paths.value.to ?? straightLine

      return to.interpolate(from, interpolateProgress.value)
    },
    // RN Skia deals with deps differently. They are actually the required SkiaValues that the derived value listens to, not react values.
    [interpolateProgress]
  )

  const gradientPath = useDerivedValue(
    () => {
      const from = gradientPaths.value.from ?? straightLine
      const to = gradientPaths.value.to ?? straightLine

      return to.interpolate(from, interpolateProgress.value)
    },
    // RN Skia deals with deps differently. They are actually the required SkiaValues that the derived value listens to, not react values.
    [interpolateProgress]
  )

  const stopPulsating = useCallback(() => {
    cancelAnimation(indicatorPulseAnimation)
    indicatorPulseAnimation.value = 0
  }, [indicatorPulseAnimation])

  const startPulsating = useCallback(() => {
    indicatorPulseAnimation.value = withRepeat(
      withDelay(
        1000,
        withSequence(
          withTiming(1, { duration: 1100 }),
          withTiming(0, { duration: 0 }), // revert to 0
          withTiming(0, { duration: 1200 }), // delay between pulses
          withTiming(1, { duration: 1100 }),
          withTiming(1, { duration: 2000 }) // delay after both pulses
        )
      ),
      -1
    )
  }, [indicatorPulseAnimation])

  const setFingerPoint = useCallback(
    (fingerX: number) => {
      const fingerXInRange = Math.max(fingerX - horizontalPadding, 0)

      const index = Math.round(
        (fingerXInRange /
          getXInRange(
            drawingWidth,
            pointsInRange[pointsInRange.length - 1]!.date,
            pathRange.x
          )) *
          (pointsInRange.length - 1)
      )
      const pointIndex = Math.min(Math.max(index, 0), pointsInRange.length - 1)

      if (pointSelectedIndex.current !== pointIndex) {
        const dataPoint = pointsInRange[pointIndex]
        pointSelectedIndex.current = pointIndex

        if (dataPoint != null) {
          onPointSelected?.(dataPoint)
        }
      }
    },
    [
      drawingWidth,
      horizontalPadding,
      onPointSelected,
      pathRange.x,
      pointsInRange,
    ]
  )

  const setFingerX = useCallback(
    (fingerX: number) => {
      'worklet'

      const y = getYForX(commands.value, fingerX)

      if (y != null) {
        circleX.value = fingerX
        circleY.value = y
      }

      if (isActive.value) pathEnd.value = fingerX / width
    },
    // pathRange.x must be extra included in deps otherwise onPointSelected doesn't work, IDK why
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [circleX, circleY, isActive, pathEnd, pathRange.x, width, commands]
  )

  const setIsActive = useCallback(
    (active: boolean) => {
      indicatorRadius.value = withSpring(!active ? INDICATOR_RADIUS : 0, {
        mass: 1,
        stiffness: 1000,
        damping: 50,
        velocity: 0,
      })

      if (active) {
        onGestureStart?.()
        stopPulsating()
      } else {
        onGestureEnd?.()
        pointSelectedIndex.current = undefined
        pathEnd.value = 1
        startPulsating()
      }
    },
    [
      indicatorRadius,
      onGestureEnd,
      onGestureStart,
      pathEnd,
      startPulsating,
      stopPulsating,
    ]
  )

  useAnimatedReaction(
    () => x.value,
    (fingerX) => {
      if (isActive.value || fingerX) {
        setFingerX(fingerX)
        runOnJS(setFingerPoint)(fingerX)
      }
    },
    [isActive, setFingerX, width, x]
  )

  useAnimatedReaction(
    () => isActive.value,
    (active) => {
      runOnJS(setIsActive)(active)
    },
    [isActive, setIsActive]
  )

  useEffect(() => {
    if (pointsInRange.length !== 0 && commands.value.length !== 0)
      pathEnd.value = 1
  }, [commands, pathEnd, pointsInRange.length])

  useEffect(() => {
    if (indicatorPulsating) {
      startPulsating()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indicatorPulsating])

  const axisLabelContainerStyle = {
    paddingTop: TopAxisLabel != null ? 20 : 0,
    paddingBottom: BottomAxisLabel != null ? 20 : 0,
  }

  const indicatorVisible = enableIndicator && commandsChanged > 0

  return (
    <View {...props}>
      <GestureDetector gesture={gesture}>
        <Reanimated.View style={[{flex:1}, axisLabelContainerStyle]}>
          {/* Top Label (max price) */}
          {TopAxisLabel != null && (
            <View style={{height:17}}>
              <TopAxisLabel />
            </View>
          )}

          {/* Actual Skia Graph */}
          <View style={{flex:1}} onLayout={onLayout}>
            {/* Fix for react-native-skia's incorrect type declarations */}
            <Canvas style={{flex:1}}>
              <Group>
                <Path
                  // @ts-expect-error
                  path={path}
                  strokeWidth={lineThickness}
                  style="stroke"
                  strokeJoin="round"
                  strokeCap="round"
                >
                  <LinearGradient
                    start={vec(0, 0)}
                    end={vec(width, 0)}
                    colors={gradientColors}
                    positions={positions}
                  />
                </Path>

                {shouldFillGradient && (
                  <Path
                    // @ts-expect-error
                    path={gradientPath}
                  >
                    <LinearGradient
                      start={vec(0, 0)}
                      end={vec(0, height)}
                      colors={gradientFillColors}
                    />
                  </Path>
                )}
              </Group>

              {SelectionDot != null && (
                <SelectionDot
                  isActive={isActive}
                  color={color}
                  lineThickness={lineThickness}
                  circleX={circleX}
                  circleY={circleY}
                />
              )}

              {indicatorVisible && (
                <Group>
                  {indicatorPulsating && (
                    <Circle
                      cx={indicatorX}
                      cy={indicatorY}
                      r={indicatorPulseRadius}
                      opacity={indicatorPulseOpacity}
                      color={indicatorPulseColor}
                      style="fill"
                    />
                  )}

                  <Circle
                    cx={indicatorX}
                    cy={indicatorY}
                    r={indicatorBorderRadius}
                    color="#ffffff"
                  >
                    <Shadow dx={2} dy={2} color="rgba(0,0,0,0.2)" blur={4} />
                  </Circle>
                  <Circle
                    cx={indicatorX}
                    cy={indicatorY}
                    r={indicatorRadius}
                    color={color}
                  />
                </Group>
              )}
            </Canvas>
          </View>

          {/* Bottom Label (min price) */}
          {BottomAxisLabel != null && (
            <View style={{height:17}}>
              <BottomAxisLabel />
            </View>
          )}
        </Reanimated.View>
      </GestureDetector>
    </View>
  )
}

// =======================


function LineGraphSk(props: LineGraphProps): React.ReactElement {
  if (props.animated) return <AnimatedLineGraph {...props} />
  else return <StaticLineGraph {...props} />
}

export const LineGraphSkia = memo(LineGraphSk)