import { lerp } from 'algomatic';
import integrate from 'integrate-adaptive-simpson';

import type { Activity } from '~/core/activity';
import type { Axis } from '~/core/chart';
import { CarbSensitivity } from '~/core/settings';
import type { SugarInfluence } from '~/core/sugarInfluence';

export class Meal implements Activity, SugarInfluence {
  constructor(
    public carbsCount: number,
    public carbsAbsorptionRatePerHr: number,
    public startTime: number
  ) {
    const carbsAbsorptionRatePerMin = carbsAbsorptionRatePerHr / 60;
    this.duration = carbsCount / carbsAbsorptionRatePerMin;
    this.activityCurve = this.initActivityCurve();
  }

  public readonly duration;
  private readonly activityCurve;

  private initActivityCurve() {
    const easingInterval = 15;
    const xs = [
      this.startTime,
      this.startTime + easingInterval,
      this.startTime + this.duration - easingInterval,
      this.startTime + this.duration,
    ];
    let ys = [0, 1, 1, 0];

    const f = lerp(xs, ys);
    const area = integrate(f, this.startTime, this.startTime + this.duration, 0.1);

    // Normalize the area under the curve to be equal to the carbs count
    ys = ys.map((y) => (y / area) * this.carbsCount);

    // Interpolate the normalized curve
    return lerp(xs, ys);
  }

  public getActivityLevel(time: number): number {
    return this.activityCurve(time);
  }
  getActivityDelta(from: number, to: number): number {
    return integrate(this.activityCurve, from, to, 0.1);
  }
  getSugarDelta(from: number, to: number): number {
    return CarbSensitivity * this.getActivityDelta(from, to);
  }

  public getActivityPlot(xs: Axis) {
    const ys = xs.map((x) => this.getActivityLevel(x));
    return { xs, ys };
  }

  public getObPlot(xs: Axis) {
    const ys = xs.map((x) => this.carbsCount - this.getActivityDelta(this.startTime, x));
    return { xs, ys };
  }
}
