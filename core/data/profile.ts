import { filter, from, map, switchMap } from 'rxjs';
import { initDb } from '~/core/db';
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

export const insulinTypesSelect$ = from(initDb).pipe(
  switchMap((db) =>
    db.insulin_types.find().$.pipe(
      mapArray((insulin) => ({
        value: insulin.id,
        label: insulin.name,
      })),
      shareLatest()
    )
  )
);
export const mealTypesSelect$ = from(initDb).pipe(
  switchMap((db) =>
    db.meal_types.find().$.pipe(
      mapArray((meal) => ({
        value: meal.id,
        label: meal.name,
      })),
      shareLatest()
    )
  )
);
