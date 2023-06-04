import { Accordion, Title, clsx } from '@mantine/core';
import { useRef } from 'react';
import { GridStack } from 'fily-publish-gridstack';
import { DDElement } from 'fily-publish-gridstack/dist/dd-element';
import { useCardStyles } from '~/components/layout/useCardStyles';
import { GroupContent } from './content';
import { useCategoryGroupContext } from './context';
import { useGridstackGroup } from './hooks';
import { CategoryEditMenu } from './category/category-menu';
import { useGridstack } from '../gridstack/use-gridstack';
import { useDashboardStore } from '../store';

type GridStackDivElementRef = HTMLDivElement & {
  gridstack: GridStack | undefined;
  ddElement: DDElement | undefined;
};

// TODO: add toggled categories

export const CategoryGroup = () => {
  const { group, groupProps, classes, gridstack } = useWrapperGroup();
  const { classes: cardClasses, cx } = useCardStyles(true);
  const isEditMode = useDashboardStore((x) => x.isEditMode);

  if (!group) return null;

  return (
    <Accordion
      classNames={{
        item: cx(cardClasses.card, 'dashboard-gs-category'),
      }}
      mx={10}
      chevronPosition="left"
      multiple
      value={isEditMode ? [group.id] : undefined}
      variant="separated"
      radius="lg"
      onChange={() => {}}
    >
      <Accordion.Item value={group.id}>
        <Accordion.Control icon={isEditMode && <CategoryEditMenu />}>
          <Title order={3}>{group.name}</Title>
        </Accordion.Control>
        <Accordion.Panel>
          <div {...groupProps} className={clsx(classes)}>
            <GroupContent {...gridstack} />
          </div>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

const useWrapperGroup = () => {
  const ref = useRef<GridStackDivElementRef>(null);
  const gridstack = useGridstack(ref);
  const { group } = useCategoryGroupContext();
  const { classes, ...props } = useGridstackGroup('category', group);

  if (!group) throw new Error('Category group must be used inside group context');

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
