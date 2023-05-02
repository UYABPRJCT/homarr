import { Accordion, ActionIcon, Button, Card, Group, Menu, Stack, Title } from '@mantine/core';
import {
  IconDots,
  IconEdit,
  IconRowInsertBottom,
  IconRowInsertTop,
  IconTransitionBottom,
  IconTransitionTop,
  IconTrash,
} from '@tabler/icons';
import { v4 } from 'uuid';
import { api } from '~/utils/api';
import { MobileRibbons } from '../Dashboard/Mobile/Ribbon/MobileRibbon';
import { useDashboardStore } from './store';
import { useCardStyles } from '../layout/useCardStyles';
import { Category, Wrapper } from './types';

export const DashboardNew = () => {
  const dashboard = useDashboard('1');

  return (
    <>
      <View />
      <MobileRibbons />
    </>
  );
};

const View = () => {
  const { data: dashboard } = useDashboard('1');
  const isEditMode = useDashboardStore((x) => x.isEditMode);
  const edit = useDashboardStore((x) => x.edit);
  const disableEdit = useDashboardStore((x) => x.disableEdit);

  return (
    <Group align="top" h="100%" spacing="xs">
      <Stack mx={-10} style={{ flexGrow: 1 }}>
        <Button onClick={isEditMode ? disableEdit : () => edit(dashboard!)}>Change</Button>
        {dashboard?.groups
          .filter((group) => group.type !== 'sidebar')
          .sort((a, b) => a.index! - b.index!)
          .map((item) =>
            item.type === 'category' ? (
              <CategoryGroup category={item} />
            ) : (
              <WrapperGroup wrapper={item as Wrapper} />
            )
          )}
      </Stack>
    </Group>
  );
};

type WrapperGroupProps = {
  wrapper: Wrapper;
};

const WrapperGroup = ({ wrapper }: WrapperGroupProps) => {
  return (
    <div
      style={{ transitionDuration: '0s', paddingLeft: 16, paddingRight: 16 }}
      data-wrapper={wrapper.id}
    >
      Items
    </div>
  );
};

type CategoryGroupProps = {
  category: Category;
};

const CategoryGroup = ({ category }: CategoryGroupProps) => {
  const { classes: cardClasses, cx } = useCardStyles(true);
  const isEditMode = useDashboardStore((x) => x.isEditMode);

  return (
    <Accordion
      classNames={{
        item: cx(cardClasses.card, 'dashboard-gs-category'),
      }}
      chevronPosition="left"
      value={isEditMode ? [category.id] : undefined}
      multiple
      variant="separated"
      radius="lg"
    >
      <Accordion.Item value={category.id}>
        <Accordion.Control icon={isEditMode && <CategoryEditMenu category={category} />}>
          <Title order={3}>{category.name}</Title>
        </Accordion.Control>
        <Accordion.Panel>
          <div className="grid-stack grid-stack-category" data-category={category.id}>
            Items
          </div>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

type CategoryEditMenuProps = {
  category: Category;
};

const CategoryEditMenu = ({ category }: CategoryEditMenuProps) => {
  const categories = useDashboardStore((x) => x.categories);

  return (
    <Menu withinPortal withArrow>
      <Menu.Target>
        <ActionIcon>
          <IconDots />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          icon={<IconEdit size={20} />}
          onClick={() => categories.rename({ id: category.id, name: v4() })}
        >
          Edit
        </Menu.Item>
        <Menu.Item icon={<IconTrash size={20} />} onClick={() => categories.remove(category.id)}>
          Remove
        </Menu.Item>
        <Menu.Label>Change positon</Menu.Label>
        <Menu.Item
          icon={<IconTransitionTop size={20} />}
          onClick={() => categories.move({ id: category.id, direction: 'up' })}
        >
          Move up
        </Menu.Item>
        <Menu.Item
          icon={<IconTransitionBottom size={20} />}
          onClick={() => categories.move({ id: category.id, direction: 'down' })}
        >
          Move down
        </Menu.Item>
        <Menu.Label>Add category</Menu.Label>
        <Menu.Item
          icon={<IconRowInsertTop size={20} />}
          onClick={() => categories.add({ id: category.id, position: 'above', name: v4() })}
        >
          Add category above
        </Menu.Item>
        <Menu.Item
          icon={<IconRowInsertBottom size={20} />}
          onClick={() => categories.add({ id: category.id, position: 'below', name: v4() })}
        >
          Add category below
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export const useDashboard = (id: string) => {
  const { data, isLoading, isError } = api.dashboard.byId.useQuery(
    { id },
    {
      staleTime: 0,
      cacheTime: 0,
    }
  );
  const clientData = useDashboardStore((x) => x.dashboard);
  const isEditMode = useDashboardStore((x) => x.isEditMode);
  return {
    data: isEditMode ? clientData : data,
    isLoading,
    isError,
  };
};
