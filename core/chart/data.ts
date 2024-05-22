import { db, initDb } from '~/core/db';
import { mapArray, throwIfNull, unwrapDoc } from '~/core/utils';
import { combineLatest, combineLatestWith, filter, from, map, share, switchMap, timer } from 'rxjs';
import { populateActivity } from '~/core/models/activity';
import { initializeCalculation } from '~/core/calculations';
import { timeToTick } from '~/core/time';

export const activeProfile$ = from(initDb).pipe(
  switchMap((db) =>
    db.states.profile_settings.selectedProfileId$.pipe(
      throwIfNull(),
      switchMap((id) => db.profiles.findOne(id).exec().then(unwrapDoc)),
      share()
    )
  )
);

export const twelveHoursAgo$ = timer(0, 1000 * 60 * 5).pipe(
  map(() => Date.now() - 12 * 60 * 60 * 1000),
  share()
);
export const twelveHoursAgoTick$ = twelveHoursAgo$.pipe(map(timeToTick), share());

export const currentSugarValue$ = from(initDb).pipe(
  switchMap(
    (db) =>
      db.glucose_entries.findOne({
        sort: [{ date: 'desc' }],
      }).$
  ),
  map(unwrapDoc),
  share()
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
  mapArray(unwrapDoc)
);

export const currentMeals$ = twelveHoursAgoTick$.pipe(
  combineLatestWith(initDb),
  switchMap(([tick, db]) => db.meals.find({ selector: { startTick: { $gte: tick } } }).$),
  mapArray(unwrapDoc),
  share()
);
export const currentInjections$ = twelveHoursAgoTick$.pipe(
  combineLatestWith(initDb),
  switchMap(([tick, db]) => db.injections.find({ selector: { startTick: { $gte: tick } } }).$),
  mapArray(unwrapDoc),
  share()
);
export const currentActivities$ = combineLatest([currentMeals$, currentInjections$]).pipe(
  map((arr) => arr.flat()),
  switchMap((activities) => Promise.all(activities.map(populateActivity))),
  map((activities) => activities.map(initializeCalculation)),
  share()
);
