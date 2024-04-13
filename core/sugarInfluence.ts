import type { Axis, Plot } from '~/core/chart';
import { Profile } from '~/core/models/profile';

export interface SugarInfluence {
  getSugarDelta(from: number, to: number, profile: Profile): number;
}

export function getCombinedSugarPlot(
  xs: Axis,
  activities: SugarInfluence[],
  startValue: number,
  profile: Profile
): Plot {
  const ys = new Float64Array(xs.length);
  ys[0] = startValue;
  for (let i = 1; i < xs.length; i++) {
    ys[i] = ys[i - 1];
    for (const activity of activities) {
      ys[i] += activity.getSugarDelta(xs[i - 1], xs[i], profile);
    }
  }
  return { xs, ys };
}
