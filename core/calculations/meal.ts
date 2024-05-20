import { lerp } from 'algomatic';
import integrate from 'integrate-adaptive-simpson';

import type { Calculation } from '~/core/calculations/index';
import type { Axis } from '~/core/chart';
import type { SugarInfluence } from '~/core/sugarInfluence';
import { Profile } from '~/core/models/profile';
import { MealType, PopulatedMeal } from '~/core/models/meal';

const EASTING_INTERVAL = 3;

export class MealCalculation implements Calculation, SugarInfluence {
  public readonly durationTicks;
  private readonly activityCurve;
  public carbsCount: number;
  public carbsAbsorptionRatePerTick: number;
  public startTick: number;
  public mealType: MealType;

  constructor({ carbsCount, mealType, startTick }: PopulatedMeal) {
    this.carbsCount = carbsCount;
    this.carbsAbsorptionRatePerTick = (mealType.carbsAbsorptionRatePerHr / 60) * 5;
    this.startTick = startTick;
    // Clamp the duration to cover at least 2 easting intervals (in case of very low carbs count)
    this.durationTicks = Math.max(
      carbsCount / this.carbsAbsorptionRatePerTick,
      EASTING_INTERVAL * 2
    );
    this.activityCurve = this.initActivityCurve();
    this.mealType = mealType;
  }

  private initActivityCurve() {
    const xs = [
      this.startTick,
      this.startTick + EASTING_INTERVAL,
      this.startTick + this.durationTicks - EASTING_INTERVAL,
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

  public getActivityLevel(tick: number): number {
    if (tick < this.startTick || tick > this.startTick + this.durationTicks) return 0;
    return this.activityCurve(tick);
  }
  getActivityDelta(fromTick: number, toTick: number): number {
    if (fromTick < this.startTick) fromTick = this.startTick;
    if (toTick > this.startTick + this.durationTicks) toTick = this.startTick + this.durationTicks;
    return integrate(this.activityCurve, fromTick, toTick, 0.1);
  }
  getSugarDelta(fromTick: number, toTick: number, profile: Profile): number {
    return (
      (profile.carbSensitivity / 10) *
      (this.mealType.digestedPercentage / 100) *
      this.getActivityDelta(fromTick, toTick)
    );
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
