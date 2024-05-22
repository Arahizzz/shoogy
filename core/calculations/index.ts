import type { Axis } from '~/core/chart';

export interface Calculation {
  get startTick(): number;
  get durationTicks(): number;

  getActivityLevel(tick: number): number;
  getActivityDelta(fromTick: number, toTick: number): number;

  getActivityPlot(xs: Axis): { xs: Axis; ys: Axis };
  getObValue(tick: number): number;
  getObPlot(xs: Axis): { xs: Axis; ys: Axis };
}
