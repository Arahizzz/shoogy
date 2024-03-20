import { Database } from '@nozbe/watermelondb';

import { adapter } from '~/core/db/adapter';
import { Profile, Setting } from '~/core/db/schema';

export const db: Database = new Database({
  adapter,
  modelClasses: [Profile, Setting],
});
