import type { ResourceFragment } from '@/logic/resource';

import { textCreate } from './textCreate';

export const RESOURCES: { [name in string]: ResourceFragment[] } = {
  textCreate,
};
