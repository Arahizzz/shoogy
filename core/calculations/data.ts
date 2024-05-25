import { db, initDb } from '~/core/db';
import { combineLatest, combineLatestWith, filter, from, map, switchMap, timer } from 'rxjs';
import { populateInjection, populateMeal } from '~/core/models/activity';
import { getCurrentTick, timeToTick } from '~/core/time';
import { MealCalculation } from '~/core/calculations/meal';
import { InjectionCalculation } from '~/core/calculations/injection';
import { mapArray, throwIfNull } from '~/core/rxjs';
import { isDefined, shareLatest, unwrapDoc } from '~/core/utils';

export const activeProfile$ = from(initDb).pipe(
  switchMap((db) =>
    db.states.profile_settings.selectedProfileId$.pipe(
      throwIfNull(),
      switchMap((id) => db.profiles.findOne(id).$),
      filter(isDefined),
      map(unwrapDoc),
      shareLatest()
    )
  )
);

export const currentTick$ = timer(0, 1000 * 60 * 5).pipe(map(getCurrentTick), shareLatest());
export const twelveHoursAgo$ = currentTick$.pipe(
  map(() => Date.now() - 12 * 60 * 60 * 1000),
  shareLatest()
);
export const twelveHoursAgoTick$ = twelveHoursAgo$.pipe(map(timeToTick), shareLatest());

export const currentSugarValue$ = from(initDb).pipe(
  switchMap(
    (db) =>
      db.glucose_entries.findOne({
        sort: [{ date: 'desc' }],
      }).$
  ),
  filter(isDefined),
  map(unwrapDoc),
  shareLatest()
);
export const currentSugarHistory$ = twelveHoursAgo$.pipe(
  switchMap(
    (time) =>
      db.glucose_entries.find({
        sort: [{ date: 'asc' }],
        selector: {
          date: { $gt: time },
        },
      }).$
  ),
  filter((a) => a.length > 0),
  mapArray(unwrapDoc),
  shareLatest()
);

export const currentMeals$ = twelveHoursAgoTick$.pipe(
  combineLatestWith(initDb),
  switchMap(([tick, db]) => db.meals.find({ selector: { startTick: { $gte: tick } } }).$),
  mapArray(unwrapDoc),
  switchMap((activities) => combineLatest(activities.map(populateMeal))),
  combineLatestWith(activeProfile$),
  map(([activities, profile]) => activities.map((a) => new MealCalculation(a, profile))),
  shareLatest()
);
export const currentInjections$ = twelveHoursAgoTick$.pipe(
  combineLatestWith(initDb),
  switchMap(([tick, db]) => db.injections.find({ selector: { startTick: { $gte: tick } } }).$),
  mapArray(unwrapDoc),
  switchMap((activities) => combineLatest(activities.map(populateInjection))),
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
