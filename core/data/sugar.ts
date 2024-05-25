import { filter, from, map, switchMap } from 'rxjs';
import { db, initDb } from '~/core/db';
import { isDefined, shareLatest, unwrapDoc } from '~/core/utils';
import { mapArray } from '~/core/rxjs';
import { twelveHoursAgo$ } from '~/core/data/time';

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
