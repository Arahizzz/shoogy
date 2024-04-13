import { lerp } from 'algomatic';
import integrate from 'integrate-adaptive-simpson';

import type { Activity } from '~/core/activity';
import type { Axis } from '~/core/chart';
import type { SugarInfluence } from '~/core/sugarInfluence';
import { Profile } from '~/core/models/profile';

export type MealParams = {
  carbsCount: number;
  carbsAbsorptionRatePerHr: number;
  startTime: number;
};

export class Meal implements Activity, SugarInfluence {
  public readonly duration;
  private readonly activityCurve;
  public carbsCount: number;
  public carbsAbsorptionRatePerHr: number;
  public startTime: number;

  constructor({ carbsCount, carbsAbsorptionRatePerHr, startTime }: MealParams) {
    this.carbsCount = carbsCount;
    this.carbsAbsorptionRatePerHr = carbsAbsorptionRatePerHr;
    this.startTime = startTime;
    const carbsAbsorptionRatePerMin = carbsAbsorptionRatePerHr / 60;
    this.duration = Math.max(carbsCount / carbsAbsorptionRatePerMin, 30);
    this.activityCurve = this.initActivityCurve();
  }

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
  getSugarDelta(from: number, to: number, profile: Profile): number {
    return (profile.carbSensitivity / 10) * this.getActivityDelta(from, to);
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
