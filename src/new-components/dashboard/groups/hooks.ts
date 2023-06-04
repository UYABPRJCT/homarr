import { clsx } from '@mantine/core';
import { Group, GroupType } from './type';

export const useGridstackGroup = (type: GroupType, group: Group | null) => ({
  classes: clsx('grid-stack', `grid-stack-${type}`),
  [`data-group-${type}`]: group?.id,
});
