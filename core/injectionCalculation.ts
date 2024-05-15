import { csplineMonot } from 'algomatic';
import type { Calculation } from '~/core/calculation';
import type { SugarInfluence } from 'core/sugarInfluence';
import integrate from 'integrate-adaptive-simpson';

import type { Axis } from './chart';
import { Profile } from '~/core/models/profile';
import { ActivityPoints, PopulatedInjection } from './models/injection';

export class InjectionCalculation implements Calculation, SugarInfluence {
  public readonly activity: ActivityPoints[];
  public readonly insulinAmount: number;
  public readonly startTick: number;
  public readonly durationTicks;
  private readonly activityCurve;

  constructor({ insulinType, insulinAmount, startTick }: PopulatedInjection) {
    this.activity = insulinType.points;
    this.insulinAmount = insulinAmount;
    this.startTick = startTick;
    this.durationTicks = this.activity[this.activity.length - 1].tick;
    this.activityCurve = this.initActivityCurve();
  }

  getActivityLevel(tick: number): number {
    if (tick < this.startTick || tick > this.startTick + this.durationTicks) return 0;
    return this.activityCurve(tick);
  }
  getActivityDelta(fromTick: number, toTick: number): number {
    if (fromTick < this.startTick) fromTick = this.startTick;
    if (toTick > this.startTick + this.durationTicks) toTick = this.startTick + this.durationTicks;
    return integrate(this.activityCurve, fromTick, toTick, 1e-5, 30);
  }
  getSugarDelta(fromTick: number, toTick: number, profile: Profile): number {
    return -profile.insulinSensitivity * this.getActivityDelta(fromTick, toTick);
  }

  private initActivityCurve() {
    const xs = this.activity.map((a) => this.startTick + a.tick);
    let ys = this.activity.map((a) => a.value);

    const f = csplineMonot(xs, ys);
    const area = integrate(f, this.startTick, this.startTick + this.durationTicks, 1e-5, 30);

    // Normalize the area under the curve to be equal to the insulin amount
    ys = ys.map((y) => (y / area) * this.insulinAmount);

    // Interpolate the normalized curve
    return csplineMonot(xs, ys);
  }

  public getActivityPlot(xs: Axis) {
    const ys = xs.map((x) => this.getActivityLevel(x));
    return { xs, ys };
  }

  public getObPlot(xs: Axis) {
    const ys = xs.map((x) => this.insulinAmount - this.getActivityDelta(this.startTick, x));
    return { xs, ys };
  }
}
