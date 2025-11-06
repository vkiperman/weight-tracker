import { ChartDataPoint } from 'canvasjs';

interface SataSeries {
  visible: boolean;
  name: string;
}

interface ChartDataOptions {
  visible: boolean;
}

interface ChartData {
  options: ChartDataOptions;
}

interface Chart {
  data: ChartData[];
  render: () => void;
}

export interface ItemClickEvent {
  dataSeriesIndex: number;
  dataSeries: SataSeries;
  chart: Chart;
}

export interface Legend {
  color: string;
  label: string;
}

export interface WT_ChartDataPoint extends ChartDataPoint {
  filledIn?: boolean;
}
