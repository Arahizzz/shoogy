import { combineLatest, combineLatestWith, map, switchMap } from 'rxjs';
import { initDb } from '~/core/db';
import { mapArray } from '~/core/rxjs';
import { shareLatest, unwrapDoc } from '~/core/utils';
import { populateInjections, populateMeals } from '~/core/models/activity';
import { MealCalculation } from '~/core/calculations/meal';
import { InjectionCalculation } from '~/core/calculations/injection';
import { currentTick$, twelveHoursAgoTick$ } from '~/core/data/time';
import { activeProfile$ } from '~/core/data/profile';

export const currentMeals$ = twelveHoursAgoTick$.pipe(
  combineLatestWith(initDb),
  switchMap(([tick, db]) => db.meals.find({ selector: { startTick: { $gte: tick } } }).$),
  mapArray(unwrapDoc),
  populateMeals(),
  combineLatestWith(activeProfile$),
  map(([activities, profile]) => activities.map((a) => new MealCalculation(a, profile))),
  shareLatest()
);
export const currentInjections$ = twelveHoursAgoTick$.pipe(
  combineLatestWith(initDb),
  switchMap(([tick, db]) => db.injections.find({ selector: { startTick: { $gte: tick } } }).$),
  mapArray(unwrapDoc),
  populateInjections(),
  combineLatestWith(activeProfile$),
  map(([activities, profile]) => activities.map((a) => new InjectionCalculation(a, profile))),
  shareLatest()
);
export const currentActivities$ = combineLatest([currentMeals$, currentInjections$]).pipe(
  map((arr) => arr.flat()),
  shareLatest()
);

export const currentIob$ = combineLatest([currentTick$, currentInjections$]).pipe(
  map(([tick, injections]) => injections.map((i) => i.getObValue(tick))),
  map((iobs) => iobs.reduce((a, b) => a + b, 0)),
  shareLatest()
);
export const currentCob$ = combineLatest([currentTick$, currentMeals$]).pipe(
  map(([tick, meals]) => meals.map((m) => m.getObValue(tick))),
  map((cobs) => cobs.reduce((a, b) => a + b, 0)),
  shareLatest()
);
