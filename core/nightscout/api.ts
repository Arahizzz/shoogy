import { fromFetch } from 'rxjs/fetch';
import { EMPTY, expand, first, from, map, reduce, switchMap, tap, timer } from 'rxjs';

import { timeToTick } from '~/core/time';
import { Direction, GlucoseEntry } from '~/core/models/glucoseEntry';
import { getDb } from '~/core/db';

const apiBase = 'https://nightscout.server.com/api';

const jwt = fromFetch(`${apiBase}/v2/authorization/request/{API-KEY}`, {
  selector: (response: Response) => response.json(),
}).pipe(map((jwt: { token: string }) => jwt.token));

export const fetchBloodGlucose = (startDate: number, endDate: number, limit = 100) =>
  jwt.pipe(
    switchMap((token) =>
      fromFetch(
        `${apiBase}/v3/entries?sort$desc=date&date$gt=${startDate}&date$lt=${endDate}&limit=100&type$eq=sgv`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          selector: (response: Response) => response.json() as Promise<EntriesResponse[]>,
        }
      )
    ),
    tap(console.debug),
    map((response: { result: EntriesResponse[] }) =>
      response.result.map((r) => {
        let direction = r.direction;
        if (direction === 'NOT COMPUTABLE' || direction === 'RATE OUT OF RANGE') {
          direction = Direction.Unknown;
        }
        return {
          id: r.identifier,
          date: r.date,
          tick: timeToTick(r.date),
          sugar: r.sgv * 0.0555, // mg/dL to mmol/L
          direction,
        } satisfies GlucoseEntry;
      })
    )
  );

export const fetchBloodGlucoseUntilDate = (startDate: number, endDate: number) => {
  console.log(
    'fetchBloodGlucoseUntilDate',
    new Date(startDate).toISOString(),
    new Date(endDate).toISOString()
  );
  return fetchBloodGlucose(startDate, endDate, 10).pipe(
    expand((data) => {
      if (!data.length) return EMPTY;
      const endDateSliding = data[data.length - 1].date;
      if (endDateSliding < startDate) return EMPTY;
      console.log('fetchBloodGlucoseUntilDate', new Date(endDateSliding).toISOString());
      return fetchBloodGlucose(startDate, endDateSliding);
    })
  );
};

type EntriesResponse = {
  identifier: string;
  date: number;
  sgv: number;
  direction: Direction | 'NOT COMPUTABLE' | 'RATE OUT OF RANGE';
};

export const glucoseFetchWorker = from(getDb).pipe(
  switchMap((db) =>
    timer(0, 5 * 1000 * 60).pipe(
      switchMap(() =>
        db.glucose_entries
          .findOne({
            sort: [{ date: 'desc' }],
          })
          .$.pipe(
            map((entry) => (entry ? entry.date : Date.now() - 12 * 60 * 60 * 1000)),
            first()
          )
      ),
      switchMap((lastEntryDate) => fetchBloodGlucoseUntilDate(lastEntryDate, Date.now())),
      switchMap((entries) => db.glucose_entries.bulkUpsert(entries))
    )
  )
);
