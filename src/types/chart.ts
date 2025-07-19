export type ChartType = 'line' | 'bar' | 'stackbar';

export interface ChartDataPoint {
  label: string;
  value: number;
  [key: string]: any;
}

export interface ChartData {
  title: string;
  data: ChartDataPoint[];
  color?: string;
} 