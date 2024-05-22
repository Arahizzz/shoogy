import { HIGH_SUGAR, LOW_SUGAR } from '~/core/constants';
import echarts from 'echarts';
import { tickToTime } from '~/core/time';

export type SeriesProps = {
  xs: number[] | Float64Array;
  ys: number[] | Float64Array;
  markLineData: NonNullable<echarts.MarkLineComponentOption['data']>;
};

const defaultOptions: echarts.SeriesOption = {
  dimensions: ['time', 'value'],
  type: 'scatter',
  tooltip: {
    show: true,
    triggerOn: 'mousemove|click',
    trigger: 'item',
    formatter: ({ value }) => {
      return (value as number).toFixed(1);
    },
  },
  markPoint: {
    data: [
      {
        type: 'max',
        name: 'max',
        label: {
          formatter: ({ value }) => {
            return (value as number).toFixed(1);
          },
          color: 'white',
        },
      },
      {
        type: 'min',
        name: 'min',
        label: {
          formatter: ({ value }) => {
            return (value as number).toFixed(1);
          },
          offset: [0, 10],
          color: 'white',
        },
        symbolRotate: 180,
      },
    ],
  },
  symbolSize: 4,
  itemStyle: {
    color: ({ data }) => {
      const y = (data as number[])[1];
      if (y < LOW_SUGAR) return 'red';
      if (y > HIGH_SUGAR) return 'orange';
      return 'blue';
    },
  },
};

const getData = (xs: number[] | Float64Array, ys: number[] | Float64Array) => {
  const data = new Float64Array(xs.length * 2);
  for (let i = 0; i < xs.length; i++) {
    data[i * 2] = tickToTime(xs[i]);
    data[i * 2 + 1] = ys[i];
  }
  return data;
};

export const editScreenSeries = ({ xs, ys, markLineData }: SeriesProps): echarts.SeriesOption => {
  const data = getData(xs, ys);
  return {
    ...defaultOptions,
    data,
    markLine: {
      symbol: ['none', 'circle'],
      symbolSize: 7,
      data: markLineData,
    },
  };
};

export const indexScreenCurrentSeries = ({
  xs,
  ys,
  markLineData,
}: SeriesProps): echarts.SeriesOption => {
  const data = getData(xs, ys);
  return {
    ...defaultOptions,
    data,
    // markLine: {
    //   symbol: ['none', 'circle'],
    //   symbolSize: 7,
    //   data: markLineData,
    // },
    markPoint: {
      data: [],
    },
  };
};

export const indexScreenPrognosisSeries = ({
  xs,
  ys,
  markLineData,
}: SeriesProps): echarts.SeriesOption => {
  const data = getData(xs, ys);
  return {
    ...defaultOptions,
    data,
    markLine: {
      symbol: ['none', 'circle'],
      symbolSize: 7,
      data: [
        ...markLineData,
        {
          yAxis: HIGH_SUGAR,
          name: 'HIGH',
          lineStyle: {
            color: 'orange',
            type: 'dashed',
          },
        },
        {
          yAxis: LOW_SUGAR,
          name: 'LOW',
          lineStyle: {
            color: 'red',
            type: 'dashed',
          },
        },
      ],
    },
    itemStyle: {
      color: () => {
        return 'purple';
      },
    },
    markPoint: {
      data: [],
    },
  };
};
