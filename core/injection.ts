import { Interpolator, csplineMonot } from 'algomatic';
import type { Activity } from 'core/activity';
import { InsulinSensitivity } from 'core/settings';
import type { SugarInfluence } from 'core/sugarInfluence';
import integrate from 'integrate-adaptive-simpson';

import type { Axis } from './chart';

export type InsulinActivityLevel = {
  time: number;
  value: number;
};

export class Injection implements Activity, SugarInfluence {
  constructor(
    public activity: InsulinActivityLevel[],
    public insulinAmount: number,
    public startTime: number
  ) {
    this.duration = activity[activity.length - 1].time;
    this.activityCurve = this.initActivityCurve();
  }

  public readonly duration;
  private readonly activityCurve;

  getActivityLevel(time: number): number {
    return this.activityCurve(time);
  }
  getActivityDelta(from: number, to: number): number {
    return integrate(this.activityCurve, from, to, 1e-5, 30);
  }
  getSugarDelta(from: number, to: number): number {
    return -InsulinSensitivity * this.getActivityDelta(from, to);
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

export const Apidra: InsulinActivityLevel[] = [
  { time: 0, value: 0.0 },
  { time: 30, value: 0.5 },
  { time: 60, value: 0.99 },
  { time: 90, value: 0.6 },
  { time: 120, value: 0.2 },
  { time: 240, value: 0.0 },
];
