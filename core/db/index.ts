import { Database } from '@nozbe/watermelondb';

import { adapter } from '~/core/db/adapter';
import { BoardGame } from '~/core/db/schema';

export const db: Database = new Database({
  adapter,
  modelClasses: [BoardGame],
});
