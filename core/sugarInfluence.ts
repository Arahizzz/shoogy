import type { Axis, Plot } from '~/core/chart';

export interface SugarInfluence {
  getSugarDelta(from: number, to: number): number;
}

export function getCombinedSugarPlot(
  xs: Axis,
  activities: SugarInfluence[],
  startValue: number
): Plot {
  const ys = new Float64Array(xs.length);
  ys[0] = startValue;
  for (let i = 1; i < xs.length; i++) {
    ys[i] = ys[i - 1];
    for (const activity of activities) {
      ys[i] += activity.getSugarDelta(xs[i - 1], xs[i]);
    }
  }
  return { xs, ys };
}
