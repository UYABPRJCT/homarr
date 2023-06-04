import { clsx } from '@mantine/core';
import { useRef } from 'react';
import { useGridstack } from '../gridstack/use-gridstack';
import { useDashboardStore } from '../store';
import { GroupContent } from './content';
import { useWrapperGroupContext } from './context';
import { useGridstackGroup } from './hooks';

export const WrapperGroup = () => {
  const { group, groupProps, classes, gridstack } = useWrapperGroup();
  const hasItems = group.items.length > 0;
  const isEditMode = useDashboardStore((x) => x.isEditMode);

  if (!group) return null;

  return (
    <div
      {...groupProps}
      className={clsx(
        classes,
        'min-row',
        hasItems || isEditMode ? undefined : 'gridstack-empty-wrapper'
      )}
      style={{ transitionDuration: '0s', paddingLeft: 16, paddingRight: 16 }}
    >
      <GroupContent {...gridstack} />
    </div>
  );
};

const useWrapperGroup = () => {
  const ref = useRef<HTMLDivElement>(null);
  const gridstack = useGridstack(ref);
  const { group } = useWrapperGroupContext();
  const { classes, ...props } = useGridstackGroup('wrapper', group);

  if (!group) throw new Error('Wrapper group must be used inside group context');

  return {
    group,
    groupProps: {
      ...props,
      ref,
    },
    classes,
    gridstack,
  };
};
