import { HIGH_SUGAR, LOW_SUGAR } from '~/core/constants';
import echarts, { EChartsOption } from 'echarts';
import { tickToTime } from '~/core/time';

type SeriesProps = {
  xs: number[] | Float64Array;
  ys: number[] | Float64Array;
  markLine?: echarts.MarkLineComponentOption;
};

export const prognosisSeries = ({ xs, ys, markLine }: SeriesProps): echarts.SeriesOption => {
  const data = new Float64Array(xs.length * 2);
  for (let i = 0; i < xs.length; i++) {
    data[i * 2] = tickToTime(xs[i]);
    data[i * 2 + 1] = ys[i];
  }

  return {
    data,
    dimensions: ['time', 'value'],
    type: 'scatter',
    markLine,
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
};
