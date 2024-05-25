import { map, timer } from 'rxjs';
import { getCurrentTick, timeToTick } from '~/core/time';
import { shareLatest } from '~/core/utils';

export const currentTick$ = timer(0, 1000 * 60 * 5).pipe(map(getCurrentTick), shareLatest());
export const twelveHoursAgo$ = currentTick$.pipe(
  map(() => Date.now() - 12 * 60 * 60 * 1000),
  shareLatest()
);
export const twelveHoursAgoTick$ = twelveHoursAgo$.pipe(map(timeToTick), shareLatest());
