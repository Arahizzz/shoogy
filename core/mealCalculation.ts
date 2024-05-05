import { lerp } from 'algomatic';
import integrate from 'integrate-adaptive-simpson';

import type { Calculation } from '~/core/calculation';
import type { Axis } from '~/core/chart';
import type { SugarInfluence } from '~/core/sugarInfluence';
import { Profile } from '~/core/models/profile';
import { Meal, PopulatedMeal } from '~/core/models/meal';

export class MealCalculation implements Calculation, SugarInfluence {
  public readonly durationTicks;
  private readonly activityCurve;
  public carbsCount: number;
  public carbsAbsorptionRatePerTick: number;
  public startTick: number;

  constructor({ carbsCount, mealType, startTick }: PopulatedMeal) {
    this.carbsCount = carbsCount;
    this.carbsAbsorptionRatePerTick = (mealType.carbsAbsorptionRatePerHr / 60) * 5;
    this.startTick = startTick;
    this.durationTicks = Math.max(carbsCount / this.carbsAbsorptionRatePerTick, 6);
    this.activityCurve = this.initActivityCurve();
  }

  private initActivityCurve() {
    const easingInterval = 3;
    const xs = [
      this.startTick,
      this.startTick + easingInterval,
      this.startTick + this.durationTicks - easingInterval,
      this.startTick + this.durationTicks,
    ];
    let ys = [0, 1, 1, 0];

    const f = lerp(xs, ys);
    const area = integrate(f, this.startTick, this.startTick + this.durationTicks, 0.1);

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
    const ys = xs.map((x) => this.carbsCount - this.getActivityDelta(this.startTick, x));
    return { xs, ys };
  }
}
