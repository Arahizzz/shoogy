import { csplineMonot } from 'algomatic';
import type { Calculation } from '~/core/calculations/index';
import type { SugarInfluence } from '~/core/sugarInfluence';
import integrate from 'integrate-adaptive-simpson';

import type { Axis } from '../chart';
import { Profile } from '~/core/models/profile';
import { ActivityPoints, PopulatedInjection } from '../models/injection';

export class InjectionCalculation implements Calculation, SugarInfluence {
  public readonly injection: PopulatedInjection;
  public readonly profile: Profile;
  public readonly durationTicks;
  private readonly activityCurve;

  public get startTick() {
    return this.injection.startTick;
  }
  public get insulinAmount() {
    return this.injection.insulinAmount;
  }
  public get insulinType() {
    return this.injection.insulinType;
  }

  constructor(injection: PopulatedInjection, profile: Profile) {
    this.injection = injection;
    this.profile = profile;

    const activity = this.insulinType.points;
    this.durationTicks = activity[activity.length - 1].tick;
    this.activityCurve = this.initActivityCurve(activity);
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
  getSugarDelta(fromTick: number, toTick: number): number {
    return -this.profile.insulinSensitivity * this.getActivityDelta(fromTick, toTick);
  }

  private initActivityCurve(activity: ActivityPoints[]) {
    const xs = activity.map((a) => this.startTick + a.tick);
    let ys = activity.map((a) => a.value);

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

  public getObValue(tick: number) {
    if (tick < this.startTick) return 0;
    if (tick > this.startTick + this.durationTicks) return 0;
    return this.insulinAmount - this.getActivityDelta(this.startTick, tick);
  }

  public getObPlot(xs: Axis) {
    const ys = xs.map((x) => this.getObValue(x));
    return { xs, ys };
  }
}
