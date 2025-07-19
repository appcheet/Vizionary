import { ChartData } from '../types/chart';

export const lineChartData: ChartData[] = [
  {
    title: 'Monthly Sales',
    data: [
      { label: 'Jan', value: 1200 },
      { label: 'Feb', value: 1500 },
      { label: 'Mar', value: 1700 },
      { label: 'Apr', value: 1400 },
      { label: 'May', value: 1800 },
      { label: 'Jun', value: 2000 },
      { label: 'Jul', value: 2200 },
      { label: 'Aug', value: 2100 },
      { label: 'Sep', value: 1900 },
      { label: 'Oct', value: 2300 },
      { label: 'Nov', value: 2500 },
      { label: 'Dec', value: 2700 },
    ],
    color: '#007bff',
  },
  {
    title: 'Website Traffic',
    data: [
      { label: 'Mon', value: 300 },
      { label: 'Tue', value: 450 },
      { label: 'Wed', value: 500 },
      { label: 'Thu', value: 400 },
      { label: 'Fri', value: 600 },
      { label: 'Sat', value: 700 },
      { label: 'Sun', value: 650 },
    ],
    color: '#28a745',
  },
];

export const barChartData: ChartData[] = [
  {
    title: 'Product Sales',
    data: [
      { label: 'Shoes', value: 120 },
      { label: 'Bags', value: 90 },
      { label: 'Watches', value: 60 },
      { label: 'Hats', value: 30 },
      { label: 'Socks', value: 50 },
    ],
    color: '#ff9800',
  },
  {
    title: 'Market Share',
    data: [
      { label: 'Brand A', value: 40 },
      { label: 'Brand B', value: 25 },
      { label: 'Brand C', value: 20 },
      { label: 'Brand D', value: 15 },
    ],
    color: '#673ab7',
  },
];

export const stackBarChartData: ChartData[] = [
  {
    title: 'Quarterly Revenue by Region',
    data: [
      { label: 'Q1', value: 500, region: 'North' },
      { label: 'Q1', value: 300, region: 'South' },
      { label: 'Q1', value: 200, region: 'East' },
      { label: 'Q1', value: 100, region: 'West' },
      { label: 'Q2', value: 600, region: 'North' },
      { label: 'Q2', value: 350, region: 'South' },
      { label: 'Q2', value: 250, region: 'East' },
      { label: 'Q2', value: 150, region: 'West' },
      { label: 'Q3', value: 700, region: 'North' },
      { label: 'Q3', value: 400, region: 'South' },
      { label: 'Q3', value: 300, region: 'East' },
      { label: 'Q3', value: 200, region: 'West' },
      { label: 'Q4', value: 800, region: 'North' },
      { label: 'Q4', value: 450, region: 'South' },
      { label: 'Q4', value: 350, region: 'East' },
      { label: 'Q4', value: 250, region: 'West' },
    ],
    color: '#e91e63',
  },
]; 



export const  victoryBarData = [
  { label: 'Jan', value: 1200 },
  { label: 'Feb', value: 1500 },
  { label: 'Mar', value: 1800 },
  { label: 'Apr', value: 1300 },
  { label: 'May', value: 1700 },
  { label: 'Jun', value: 1600 },
  { label: 'Jul', value: 1900 },
];

export const giftedBarData = [
  { month: 'Jan', revenue: 1200, profit: 300, category: 'A' },
  { month: 'Feb', revenue: 1500, profit: 450, category: 'B' },
  { month: 'Mar', revenue: 1800, profit: 600, category: 'A' },
  { month: 'Apr', revenue: 1300, profit: 350, category: 'C' },
  { month: 'May', revenue: 1700, profit: 500, category: 'B' },
  { month: 'Jun', revenue: 1600, profit: 400, category: 'A' },
  { month: 'Jul', revenue: 1900, profit: 700, category: 'C' },
];






export const sampleVictoryBarData = [
    { label: 'Mon', value: 505 },
    { label: 'Tue', value: 7112 },
    { label: 'Wed', value: 6019 },
    { label: 'Thu', value: 8822 },
    { label: 'Fri', value: 1829 },
    { label: 'Sat', value: 1281 },
    { label: 'Sun', value: 4000 },
];

export const fitnessBarGroupData = [
    { label: 'Mon', value1: 200, value2: 450 },
    { label: 'Tue', value1: 180, value2: 500 },
    { label: 'Wed', value1: 220, value2: 470 },
    { label: 'Thu', value1: 150, value2: 430 },
    { label: 'Fri', value1: 190, value2: 460 },
    { label: 'Sat', value1: 250, value2: 520 },
    { label: 'Sun', value1: 300, value2: 600 },
];


export const nutritionStackBarData = [
    { label: 'Mon', protein: 30, fat: 20, carbs: 50 },
    { label: 'Tue', protein: 35, fat: 25, carbs: 60 },
    { label: 'Wed', protein: 40, fat: 30, carbs: 55 },
    { label: 'Thu', protein: 45, fat: 35, carbs: 65 },
    { label: 'Fri', protein: 50, fat: 40, carbs: 70 },
    { label: 'Sat', protein: 55, fat: 45, carbs: 75 },
    { label: 'Sun', protein: 60, fat: 50, carbs: 80 },
];


export const formatXLabel = (num: any): string => {
    if (typeof num === 'string') {
        return num;
    }

    return '';
};




export const giftedGroupBarChart = [
    {value: 2500, frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 3, label:'Jan'},
    {value: 2400, frontColor: '#3BE9DE', gradientColor: '#93FCF8'},
    {value: 3500, frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 3, label:'Feb'},
    {value: 3000, frontColor: '#3BE9DE', gradientColor: '#93FCF8'},
    {value: 4500, frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 3, label:'Mar'},
    {value: 4000, frontColor: '#3BE9DE', gradientColor: '#93FCF8'},
    {value: 5200, frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 3, label:'Apr'},
    {value: 4900, frontColor: '#3BE9DE', gradientColor: '#93FCF8'},
    {value: 3000, frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 3, label:'May'},
    {value: 2800, frontColor: '#3BE9DE', gradientColor: '#93FCF8'},
    {value: 8000, frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 3, label:'Jun'},
    {value: 5800, frontColor: '#3BE9DE', gradientColor: '#93FCF8'},
    {value: 1000, frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 3, label:'July'},
    {value: 2800, frontColor: '#3BE9DE', gradientColor: '#93FCF8'},
  ];




  export const caloriIntakeData = [
    {
      date: 'May 5',
      label: 'Mon',
      stacks: [
        { value: 120, color: 'rgba(237, 144, 14, 1)', marginBottom: 2, label: 'Carbs' },
        { value: 50, color: 'rgba(242, 103, 105, 1)', marginBottom: 2, label: 'Fats' },
        { value: 80, color: 'rgba(67, 173, 143, 1)', marginBottom: 2, label: 'Proteins' },
      ],
    },
    {
      date: 'May 6',
      label: 'Tue',
      stacks: [
        { value: 140, color: 'rgba(237, 144, 14, 1)', marginBottom: 2, label: 'Carbs' },
        { value: 60, color: 'rgba(242, 103, 105, 1)', marginBottom: 2, label: 'Fats' },
        { value: 75, color: 'rgba(67, 173, 143, 1)', marginBottom: 2, label: 'Proteins' },
      ],
    },
    {
      date: 'May 7',
      label: 'Wed',
      stacks: [
        { value: 130, color: 'rgba(237, 144, 14, 1)', marginBottom: 2, label: 'Carbs' },
        { value: 45, color: 'rgba(242, 103, 105, 1)', marginBottom: 2, label: 'Fats' },
        { value: 85, color: 'rgba(67, 173, 143, 1)', marginBottom: 2, label: 'Proteins' },
      ],
    },
    {
      date: 'May 8',
      label: 'Thu',
      stacks: [
        { value: 100, color: 'rgba(237, 144, 14, 1)', marginBottom: 2, label: 'Carbs' },
        { value: 40, color: 'rgba(242, 103, 105, 1)', marginBottom: 2, label: 'Fats' },
        { value: 70, color: 'rgba(67, 173, 143, 1)', marginBottom: 2, label: 'Proteins' },
      ],
    },
    {
      date: 'May 9',
      label: 'Fri',
      stacks: [
        { value: 160, color: 'rgba(237, 144, 14, 1)', marginBottom: 2, label: 'Carbs' },
        { value: 70, color: 'rgba(242, 103, 105, 1)', marginBottom: 2, label: 'Fats' },
        { value: 90, color: 'rgba(67, 173, 143, 1)', marginBottom: 2, label: 'Proteins' },
      ],
    },
    {
      date: 'May 10',
      label: 'Sat',
      stacks: [
        { value: 150, color: 'rgba(237, 144, 14, 1)', marginBottom: 2, label: 'Carbs' },
        { value: 55, color: 'rgba(242, 103, 105, 1)', marginBottom: 2, label: 'Fats' },
        { value: 95, color: 'rgba(67, 173, 143, 1)', marginBottom: 2, label: 'Proteins' },
      ],
    },
    {
      date: 'May 11',
      label: 'Sun',
      stacks: [
        { value: 110, color: 'rgba(237, 144, 14, 1)', marginBottom: 2, label: 'Carbs' },
        { value: 50, color: 'rgba(242, 103, 105, 1)', marginBottom: 2, label: 'Fats' },
        { value: 80, color: 'rgba(67, 173, 143, 1)', marginBottom: 2, label: 'Proteins' },
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
          value: 10,
        },
        {
          value: 20,
          marginBottom: 2,
        },
      ],
      label: 'Jan',
    },
    {
      stacks: [
        {value: 10},
        {
          value: 11,
          marginBottom: 2,
        },
        {
          value: 15,
          marginBottom: 2,
        },
      ],
      label: 'Feb',
    },
    {
      stacks: [{value: 14}, {value: 18, marginBottom: 2}],
      label: 'Mar',
    },
    {
      stacks: [{value: 7}, {value: 11, marginBottom: 2}],
      label: 'Apr',
    },
    {
      stacks: [
        {
          value: 10,
        },
        {
          value: 20,
          marginBottom: 2,
        },
      ],
      label: 'May',
    },
    {
      stacks: [
        {value: 10},
        {
          value: 11,
          marginBottom: 2,
        },
        {
          value: 15,
          marginBottom: 2,
        },
      ],
      label: 'Jun',
      leftShiftForTooltip: 20,
    },
    {
      stacks: [{value: 14}, {value: 18, marginBottom: 2}],
      label: 'Jul',
      leftShiftForTooltip: 60,
    },
    {
      stacks: [{value: 7}, {value: 11, marginBottom: 2}],
      label: 'Aug',
    },
  ];