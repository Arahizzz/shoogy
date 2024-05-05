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
  public readonly startTime: number;
  public readonly duration;
  private readonly activityCurve;

  constructor({ insulinType, insulinAmount, startTick }: PopulatedInjection) {
    this.activity = insulinType.points;
    this.insulinAmount = insulinAmount;
    this.startTime = startTick;
    this.duration = this.activity[this.activity.length - 1].time;
    this.activityCurve = this.initActivityCurve();
  }

  getActivityLevel(time: number): number {
    return this.activityCurve(time);
  }
  getActivityDelta(from: number, to: number): number {
    return integrate(this.activityCurve, from, to, 1e-5, 30);
  }
  getSugarDelta(from: number, to: number, profile: Profile): number {
    return -profile.insulinSensitivity * this.getActivityDelta(from, to);
  }

  private initActivityCurve() {
    const xs = this.activity.map((a) => this.startTime + a.time);
    let ys = this.activity.map((a) => a.value);

    const f = csplineMonot(xs, ys);
    const area = integrate(f, this.startTime, this.startTime + this.duration, 1e-5, 30);

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
    const ys = xs.map((x) => this.insulinAmount - this.getActivityDelta(this.startTime, x));
    return { xs, ys };
  }
}
