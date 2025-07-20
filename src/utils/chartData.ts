import { ChartData } from '../types/chart';

// Utility for random int in range
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Randomized line chart data
export const lineChartData = [
  {
    title: 'Monthly Sales',
    data: [
      { label: 'Jan', value: randomInt(1200, 2400) },
      { label: 'Feb', value: randomInt(1200, 2400) },
      { label: 'Mar', value: randomInt(1200, 2400) },
      { label: 'Apr', value: randomInt(1200, 2400) },
      { label: 'May', value: randomInt(1200, 2400) },
      { label: 'Jun', value: randomInt(1200, 2400) },
      { label: 'Jul', value: randomInt(1200, 2400) },
      { label: 'Aug', value: randomInt(1200, 2400) },
      { label: 'Sep', value: randomInt(1200, 2400) },
      { label: 'Oct', value: randomInt(1200, 2400) },
      { label: 'Nov', value: randomInt(1200, 2400) },
      { label: 'Dec', value: randomInt(1200, 2400) },
    ],
    color: '#007bff',
  },
  {
    title: 'Website Traffic',
    data: [
      { label: 'Mon', value: randomInt(300, 900) },
      { label: 'Tue', value: randomInt(300, 900) },
      { label: 'Wed', value: randomInt(300, 900) },
      { label: 'Thu', value: randomInt(300, 900) },
      { label: 'Fri', value: randomInt(300, 900) },
      { label: 'Sat', value: randomInt(300, 900) },
      { label: 'Sun', value: randomInt(300, 900) },
    ],
    color: '#28a745',
  },
];

export const barChartData = [
  {
    title: 'Product Sales',
    data: [
      { label: 'Shoes', value: randomInt(80, 200) },
      { label: 'Bags', value: randomInt(80, 200) },
      { label: 'Watches', value: randomInt(80, 200) },
      { label: 'Hats', value: randomInt(80, 200) },
      { label: 'Socks', value: randomInt(80, 200) },
    ],
    color: '#ff9800',
  },
  {
    title: 'Market Share',
    data: [
      { label: 'Brand A', value: randomInt(10, 50) },
      { label: 'Brand B', value: randomInt(10, 50) },
      { label: 'Brand C', value: randomInt(10, 50) },
      { label: 'Brand D', value: randomInt(10, 50) },
    ],
    color: '#673ab7',
  },
];

export const stackBarChartData = [
  {
    title: 'Quarterly Revenue by Region',
    data: [
      { label: 'Q1', value: randomInt(200, 900), region: 'North' },
      { label: 'Q1', value: randomInt(200, 900), region: 'South' },
      { label: 'Q1', value: randomInt(200, 900), region: 'East' },
      { label: 'Q1', value: randomInt(200, 900), region: 'West' },
      { label: 'Q2', value: randomInt(200, 900), region: 'North' },
      { label: 'Q2', value: randomInt(200, 900), region: 'South' },
      { label: 'Q2', value: randomInt(200, 900), region: 'East' },
      { label: 'Q2', value: randomInt(200, 900), region: 'West' },
      { label: 'Q3', value: randomInt(200, 900), region: 'North' },
      { label: 'Q3', value: randomInt(200, 900), region: 'South' },
      { label: 'Q3', value: randomInt(200, 900), region: 'East' },
      { label: 'Q3', value: randomInt(200, 900), region: 'West' },
      { label: 'Q4', value: randomInt(200, 900), region: 'North' },
      { label: 'Q4', value: randomInt(200, 900), region: 'South' },
      { label: 'Q4', value: randomInt(200, 900), region: 'East' },
      { label: 'Q4', value: randomInt(200, 900), region: 'West' },
    ],
    color: '#e91e63',
  },
];

export const  victoryBarData = [
  { label: 'Jan', value: randomInt(1200, 2400) },
  { label: 'Feb', value: randomInt(1200, 2400) },
  { label: 'Mar', value: randomInt(1200, 2400) },
  { label: 'Apr', value: randomInt(1200, 2400) },
  { label: 'May', value: randomInt(1200, 2400) },
  { label: 'Jun', value: randomInt(1200, 2400) },
  { label: 'Jul', value: randomInt(1200, 2400) },
];

export const giftedBarData = [
  { month: 'Jan', revenue: randomInt(1200, 2400), profit: randomInt(200, 800), category: 'A' },
  { month: 'Feb', revenue: randomInt(1200, 2400), profit: randomInt(200, 800), category: 'B' },
  { month: 'Mar', revenue: randomInt(1200, 2400), profit: randomInt(200, 800), category: 'A' },
  { month: 'Apr', revenue: randomInt(1200, 2400), profit: randomInt(200, 800), category: 'C' },
  { month: 'May', revenue: randomInt(1200, 2400), profit: randomInt(200, 800), category: 'B' },
  { month: 'Jun', revenue: randomInt(1200, 2400), profit: randomInt(200, 800), category: 'A' },
  { month: 'Jul', revenue: randomInt(1200, 2400), profit: randomInt(200, 800), category: 'C' },
];






export const sampleVictoryBarData = [
    { label: 'Mon', value: randomInt(1200, 2400) },
    { label: 'Tue', value: randomInt(1200, 2400) },
    { label: 'Wed', value: randomInt(1200, 2400) },
    { label: 'Thu', value: randomInt(1200, 2400) },
    { label: 'Fri', value: randomInt(1200, 2400) },
    { label: 'Sat', value: randomInt(1200, 2400) },
    { label: 'Sun', value: randomInt(1200, 2400) },
];

export const fitnessBarGroupData = [
    { label: 'Mon', value1: randomInt(100, 300), value2: randomInt(400, 700) },
    { label: 'Tue', value1: randomInt(100, 300), value2: randomInt(400, 700) },
    { label: 'Wed', value1: randomInt(100, 300), value2: randomInt(400, 700) },
    { label: 'Thu', value1: randomInt(100, 300), value2: randomInt(400, 700) },
    { label: 'Fri', value1: randomInt(100, 300), value2: randomInt(400, 700) },
    { label: 'Sat', value1: randomInt(100, 300), value2: randomInt(400, 700) },
    { label: 'Sun', value1: randomInt(100, 300), value2: randomInt(400, 700) },
];


export const nutritionStackBarData = [
    { label: 'Mon', protein: randomInt(20, 60), fat: randomInt(10, 50), carbs: randomInt(40, 90) },
    { label: 'Tue', protein: randomInt(20, 60), fat: randomInt(10, 50), carbs: randomInt(40, 90) },
    { label: 'Wed', protein: randomInt(20, 60), fat: randomInt(10, 50), carbs: randomInt(40, 90) },
    { label: 'Thu', protein: randomInt(20, 60), fat: randomInt(10, 50), carbs: randomInt(40, 90) },
    { label: 'Fri', protein: randomInt(20, 60), fat: randomInt(10, 50), carbs: randomInt(40, 90) },
    { label: 'Sat', protein: randomInt(20, 60), fat: randomInt(10, 50), carbs: randomInt(40, 90) },
    { label: 'Sun', protein: randomInt(20, 60), fat: randomInt(10, 50), carbs: randomInt(40, 90) },
];


export const formatXLabel = (num: any): string => {
    if (typeof num === 'string') {
        return num;
    }

    return '';
};




export const giftedGroupBarChart = [
    {value: randomInt(1200, 2400), frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 3, label:'Jan'},
    {value: randomInt(1200, 2400), frontColor: '#3BE9DE', gradientColor: '#93FCF8'},
    {value: randomInt(1200, 2400), frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 3, label:'Feb'},
    {value: randomInt(1200, 2400), frontColor: '#3BE9DE', gradientColor: '#93FCF8'},
    {value: randomInt(1200, 2400), frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 3, label:'Mar'},
    {value: randomInt(1200, 2400), frontColor: '#3BE9DE', gradientColor: '#93FCF8'},
    {value: randomInt(1200, 2400), frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 3, label:'Apr'},
    {value: randomInt(1200, 2400), frontColor: '#3BE9DE', gradientColor: '#93FCF8'},
    {value: randomInt(1200, 2400), frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 3, label:'May'},
    {value: randomInt(1200, 2400), frontColor: '#3BE9DE', gradientColor: '#93FCF8'},
    {value: randomInt(1200, 2400), frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 3, label:'Jun'},
    {value: randomInt(1200, 2400), frontColor: '#3BE9DE', gradientColor: '#93FCF8'},
    {value: randomInt(1200, 2400), frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 3, label:'July'},
    {value: randomInt(1200, 2400), frontColor: '#3BE9DE', gradientColor: '#93FCF8'},
  ];




  export const caloriIntakeData = [
    {
      date: 'May 5',
      label: 'Mon',
      stacks: [
        { value: randomInt(80, 160), color: 'rgba(237, 144, 14, 1)', marginBottom: 2, label: 'Carbs' },
        { value: randomInt(40, 80), color: 'rgba(242, 103, 105, 1)', marginBottom: 2, label: 'Fats' },
        { value: randomInt(60, 100), color: 'rgba(67, 173, 143, 1)', marginBottom: 2, label: 'Proteins' },
      ],
    },
    {
      date: 'May 6',
      label: 'Tue',
      stacks: [
        { value: randomInt(80, 160), color: 'rgba(237, 144, 14, 1)', marginBottom: 2, label: 'Carbs' },
        { value: randomInt(40, 80), color: 'rgba(242, 103, 105, 1)', marginBottom: 2, label: 'Fats' },
        { value: randomInt(60, 100), color: 'rgba(67, 173, 143, 1)', marginBottom: 2, label: 'Proteins' },
      ],
    },
    {
      date: 'May 7',
      label: 'Wed',
      stacks: [
        { value: randomInt(80, 160), color: 'rgba(237, 144, 14, 1)', marginBottom: 2, label: 'Carbs' },
        { value: randomInt(40, 80), color: 'rgba(242, 103, 105, 1)', marginBottom: 2, label: 'Fats' },
        { value: randomInt(60, 100), color: 'rgba(67, 173, 143, 1)', marginBottom: 2, label: 'Proteins' },
      ],
    },
    {
      date: 'May 8',
      label: 'Thu',
      stacks: [
        { value: randomInt(80, 160), color: 'rgba(237, 144, 14, 1)', marginBottom: 2, label: 'Carbs' },
        { value: randomInt(40, 80), color: 'rgba(242, 103, 105, 1)', marginBottom: 2, label: 'Fats' },
        { value: randomInt(60, 100), color: 'rgba(67, 173, 143, 1)', marginBottom: 2, label: 'Proteins' },
      ],
    },
    {
      date: 'May 9',
      label: 'Fri',
      stacks: [
        { value: randomInt(80, 160), color: 'rgba(237, 144, 14, 1)', marginBottom: 2, label: 'Carbs' },
        { value: randomInt(40, 80), color: 'rgba(242, 103, 105, 1)', marginBottom: 2, label: 'Fats' },
        { value: randomInt(60, 100), color: 'rgba(67, 173, 143, 1)', marginBottom: 2, label: 'Proteins' },
      ],
    },
    {
      date: 'May 10',
      label: 'Sat',
      stacks: [
        { value: randomInt(80, 160), color: 'rgba(237, 144, 14, 1)', marginBottom: 2, label: 'Carbs' },
        { value: randomInt(40, 80), color: 'rgba(242, 103, 105, 1)', marginBottom: 2, label: 'Fats' },
        { value: randomInt(60, 100), color: 'rgba(67, 173, 143, 1)', marginBottom: 2, label: 'Proteins' },
      ],
    },
    {
      date: 'May 11',
      label: 'Sun',
      stacks: [
        { value: randomInt(80, 160), color: 'rgba(237, 144, 14, 1)', marginBottom: 2, label: 'Carbs' },
        { value: randomInt(40, 80), color: 'rgba(242, 103, 105, 1)', marginBottom: 2, label: 'Fats' },
        { value: randomInt(60, 100), color: 'rgba(67, 173, 143, 1)', marginBottom: 2, label: 'Proteins' },
      ],
    },
  ];


  export function getYAxisLabelTexts(data:any) {
    const calculatedData = data?.map((item:any) => {
      // taken_calories
      const {taken_calories} = item;
      return taken_calories;
    });

    const minCalories = Math.min(...calculatedData);
    const maxCalories = Math.max(...calculatedData);
    const yAxisLabelTexts = [];
    const step = Math.floor((maxCalories - minCalories) / 4);

    for (let i = 0; i <= 4; i++) {
      yAxisLabelTexts.push(minCalories + i * step);
    }
    yAxisLabelTexts[4] = maxCalories;

    return yAxisLabelTexts;
  }



  export const stackData = [
    {
      stacks: [
        {
          value: randomInt(5, 20)
        },
        {
          value: randomInt(10, 25),
          marginBottom: 2,
        },
      ],
      label: 'Jan',
    },
    {
      stacks: [
        {value: randomInt(5, 20)},
        {
          value: randomInt(10, 25),
          marginBottom: 2,
        },
        {
          value: randomInt(10, 20),
          marginBottom: 2,
        },
      ],
      label: 'Feb',
    },
    {
      stacks: [{value: randomInt(5, 20)}, {value: randomInt(10, 25), marginBottom: 2}],
      label: 'Mar',
    },
    {
      stacks: [{value: randomInt(5, 20)}, {value: randomInt(10, 25), marginBottom: 2}],
      label: 'Apr',
    },
    {
      stacks: [
        {
          value: randomInt(5, 20)
        },
        {
          value: randomInt(10, 25),
          marginBottom: 2,
        },
      ],
      label: 'May',
    },
    {
      stacks: [
        {value: randomInt(5, 20)},
        {
          value: randomInt(10, 25),
          marginBottom: 2,
        },
        {
          value: randomInt(10, 20),
          marginBottom: 2,
        },
      ],
      label: 'Jun',
      leftShiftForTooltip: 20,
    },
    {
      stacks: [{value: randomInt(5, 20)}, {value: randomInt(10, 25), marginBottom: 2}],
      label: 'Jul',
      leftShiftForTooltip: 60,
    },
    {
      stacks: [{value: randomInt(5, 20)}, {value: randomInt(10, 25), marginBottom: 2}],
      label: 'Aug',
    },
  ];

// 14 days data for VictoryBarChart
function randomBarValue() {
  return Math.floor(1200 + Math.random() * 1200); // 1200-2400
}
export const victoryBarData14Days = Array.from({ length: 14 }, (_, i) => ({
  label: String(i + 1),
  value: randomBarValue(),
}));

// 30 days data for VictoryBarChart
export const victoryBarData30Days = Array.from({ length: 30 }, (_, i) => ({
  label: String(i + 1),
  value: randomBarValue(),
}));