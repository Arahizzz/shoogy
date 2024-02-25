import type { Axis } from '~/core/chart.js';

export interface Activity {
  get startTime(): number;
  get duration(): number;

  getActivityLevel(time: number): number;
  getActivityDelta(from: number, to: number): number;

  getActivityPlot(xs: Axis): { xs: Axis; ys: Axis };
  getObPlot(xs: Axis): { xs: Axis; ys: Axis };
}
