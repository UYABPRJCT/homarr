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
import { GridStack } from 'fily-publish-gridstack';
import {
  MutableRefObject,
  PropsWithChildren,
  RefObject,
  createContext,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { v4 } from 'uuid';
import { api } from '~/utils/api';
import { MobileRibbons } from '../Dashboard/Mobile/Ribbon/MobileRibbon';
import { useGridstackStore } from '../Dashboard/Wrappers/gridstack/store';
import { useCardStyles } from '../layout/useCardStyles';
import { useDashboardStore } from './store';
import { Item, ItemGroup } from './types';

export const DashboardNew = () => (
  <>
    <View />
    <MobileRibbons />
  </>
);

const View = () => {
  const setMainAreaWidth = useGridstackStore((x) => x.setMainAreaWidth);
  const mainAreaWidth = useGridstackStore((x) => x.mainAreaWidth);
  const { data: dashboard } = useDashboard('1');
  const isEditMode = useDashboardStore((x) => x.isEditMode);
  const edit = useDashboardStore((x) => x.edit);
  const disableEdit = useDashboardStore((x) => x.disableEdit);

  useEffect(() => {
    setMainAreaWidth(1200);
  }, []);

  if (!mainAreaWidth) return null;

  return (
    <Group align="top" h="100%" spacing="xs">
      <Stack mx={-10} style={{ flexGrow: 1 }}>
        <Button onClick={isEditMode ? disableEdit : () => edit(dashboard!)}>Change</Button>
        {dashboard?.groups
          .filter((group) => group.type !== 'sidebar')
          .sort((a, b) => a.index! - b.index!)
          .map((item) => (
            <GroupContext.Provider value={{ group: item }} key={item.id}>
              {item.type === 'category' ? <CategoryGroup /> : <WrapperGroup />}
            </GroupContext.Provider>
          ))}
      </Stack>
    </Group>
  );
};

type GroupContextType<TItemGroup extends ItemGroup = ItemGroup> = {
  group: TItemGroup | null;
};

const GroupContext = createContext<GroupContextType>({ group: null });

const useCategoryContext = () => {
  const { group } = useContext(GroupContext);
  const category = group?.type !== 'category' ? null : group;
  return { category };
};

const useWrapperContext = () => {
  const { group } = useContext(GroupContext);
  const wrapper = group?.type !== 'wrapper' ? null : group;
  return { wrapper };
};

const useGroupContext = () => {
  const { group } = useContext(GroupContext);
  return { group };
};

const WrapperGroup = () => {
  const { wrapper } = useWrapperContext();

  if (!wrapper) return null;

  return (
    <div
      className="grid-stack grid-stack-wrapper min-row gridstack-empty-wrapper"
      style={{ transitionDuration: '0s', paddingLeft: 16, paddingRight: 16 }}
      data-wrapper={wrapper.id}
    >
      <GroupContent />
    </div>
  );
};

const CategoryGroup = () => {
  const { category } = useCategoryContext();
  const { classes: cardClasses, cx } = useCardStyles(true);
  const isEditMode = useDashboardStore((x) => x.isEditMode);

  if (!category) return null;

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
        <Accordion.Control icon={isEditMode && <CategoryEditMenu />}>
          <Title order={3}>{category.name}</Title>
        </Accordion.Control>
        <Accordion.Panel>
          <div className="grid-stack grid-stack-category" data-category={category.id}>
            <GroupContent />
          </div>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

type GridstackContextType = {
  gridstackRef: MutableRefObject<GridStack | undefined>;
  itemRefs: MutableRefObject<Record<string, RefObject<HTMLDivElement>>>;
  wrapperRef: RefObject<HTMLDivElement>;
};

const GridstackContext = createContext<GridstackContextType | null>(null);

// eslint-disable-next-line @typescript-eslint/ban-types
const GridstackProvider = ({ children }: PropsWithChildren<{}>) => {
  // define reference for wrapper - is used to calculate the width of the wrapper
  const wrapperRef = useRef<HTMLDivElement>(null);
  // references to the diffrent items contained in the gridstack
  const itemRefs = useRef<Record<string, RefObject<HTMLDivElement>>>({});
  // reference of the gridstack object for modifications after initialization
  const gridstackRef = useRef<GridStack>();

  return (
    <GridstackContext.Provider
      value={{
        wrapperRef,
        itemRefs,
        gridstackRef,
      }}
    >
      {children}
    </GridstackContext.Provider>
  );
};

const GroupContent = () => {
  const { group } = useGroupContext();
  const categories = useDashboardStore((x) => x.categories);

  return (
    <>
      {categories.items(group!.id).map((item) => (
        <Card h="100%" w="100%">
          {item.type}
        </Card>
      ))}
    </>
  );
};

const CategoryEditMenu = () => {
  const { category } = useCategoryContext();
  const categories = useDashboardStore((x) => x.categories);

  if (!category) return null;

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

type ItemContextType<TItem extends Item = Item> = {
  item: TItem | null;
};

const ItemContext = createContext<ItemContextType>({ item: null });

const useAppContext = () => {
  const { item } = useContext(ItemContext);
  const app = item?.type !== 'app' ? null : item;
  return { app };
};

const useWidgetContext = () => {
  const { item } = useContext(ItemContext);
  const widget = item?.type !== 'widget' ? null : item;
  return { widget };
};

const useItemContext = () => {
  const { item } = useContext(ItemContext);
  return { item };
};

export const useDashboard = (id: string) => {
  const { data, isLoading, isError } = api.dashboard.old.useQuery(
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
