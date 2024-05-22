import type { Axis } from '~/core/chart';
import { RxDocument } from 'rxdb/src/types';
import { PopulatedActivity } from '~/core/models/activity';
import { InjectionCalculation } from '~/core/calculations/injection';
import { MealCalculation } from '~/core/calculations/meal';

export interface Calculation {
  get startTick(): number;
  get durationTicks(): number;

  getActivityLevel(tick: number): number;
  getActivityDelta(fromTick: number, toTick: number): number;

  getActivityPlot(xs: Axis): { xs: Axis; ys: Axis };
  getObPlot(xs: Axis): { xs: Axis; ys: Axis };
}

export function initializeCalculation(activity: PopulatedActivity) {
  if (activity.type === 'meal') {
    return new MealCalculation(activity);
  } else {
    return new InjectionCalculation(activity);
  }
}
