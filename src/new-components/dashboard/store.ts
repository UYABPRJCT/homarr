import { v4 } from 'uuid';
import { create } from 'zustand';
import { RouterOutputs, api } from '~/utils/api';
import { GroupOnly, GroupWithout } from './groups/type';

type Dashboard = RouterOutputs['dashboard']['byId'];

type DashboardStore = {
  isEditMode: boolean;
  dashboard: Dashboard | null;
  edit: (dashboard: Dashboard) => void;
  afterChangesSaved: () => void;
  categories: {
    all: () => GroupOnly<'category'>[];
    byId: (id: string) => GroupOnly<'category'> | null;
    items: (id: string) => any[];
    remove: (id: string) => void;
    rename: (input: { id: string; name: string }) => void;
    move: (input: { id: string; direction: 'up' | 'down' }) => void;
    addToTop: (name: string) => void;
    add: (input: { id: string; name: string; position: 'above' | 'below' }) => void;
  };
  groups: {
    hasItem: (groupId: string, id: string) => boolean;
  };
  widgets: {
    saveOptions: (input: { id: string; options: Record<string, unknown> }) => void;
  };
  items: {
    remove: (id: string) => void;
    savePositionOrSize: (input: {
      id: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
    }) => void;
    moveToGroup: (input: {
      id: string;
      groupId: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
    }) => void;
  };
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  isEditMode: false,
  dashboard: null,
  edit: (dashboard) => {
    set({
      isEditMode: true,
      dashboard,
    });
  },
  afterChangesSaved: () => {
    set({
      isEditMode: false,
      dashboard: null,
    });
  },
  groups: {
    hasItem: (groupId, itemId) => {
      const { dashboard } = get();
      if (!dashboard) return false;
      return (
        dashboard.groups
          .find((group) => groupId === group.id)
          ?.items.some((item) => item.id === itemId) ?? false
      );
    },
  },
  categories: {
    all: () =>
      get().dashboard?.groups.filter(
        (group): group is GroupOnly<'category'> => group.type === 'category'
      ) ?? [],
    byId: (id) =>
      get().dashboard?.groups.find(
        (group): group is GroupOnly<'category'> => group.type === 'category' && group.id === id
      ) ?? null,
    items: (id) => get().categories.byId(id)?.items ?? [],
    remove(id) {
      const { dashboard } = get();
      if (!dashboard) return;
      const category = dashboard.groups.find(
        (group): group is GroupOnly<'category'> => group.id === id
      );
      if (!category) return;
      const wrapper = dashboard.groups.find(
        (group): group is GroupOnly<'wrapper'> =>
          group.type === 'wrapper' && group.index === category.index + 1
      );
      if (!wrapper) return;

      const firstWrapperAbove = dashboard.groups
        .filter((group): group is GroupWithout<'sidebar'> => group.type !== 'sidebar')
        .sort((a, b) => b.index - a.index)
        .find((group) => group.index < category.index)!;

      set(({ dashboard, ...others }) => {
        if (!dashboard) {
          return {
            ...others,
            dashboard,
          };
        }

        // Get vertical position where the items should be moved to
        let verticalStartFillPosition = get()
          .categories.items(firstWrapperAbove.id)
          .reduce(
            (p: number, item) =>
              item.positionY + item.height > p ? item.positionY + item.height : p,
            0
          );

        // Move items from removed category to the first wrapper above
        const otherItems = wrapper.items;
        const oldCategoryItems = get()
          .categories.items(id)
          .map((item) => ({
            ...item,
            groupId: firstWrapperAbove.id,
            positionY: item.positionY + verticalStartFillPosition,
          }));

        // Get vertical position where the items should be moved to
        verticalStartFillPosition = get()
          .categories.items(id)
          .reduce(
            (p: number, item) =>
              item.positionY + item.height > p ? item.positionY + item.height : p,
            0
          );

        // Move items from removed wrapper below category to the first wrapper above
        const oldWrapperItems = get()
          .categories.items(wrapper.id)
          .map((item) => ({
            ...item,
            groupId: firstWrapperAbove.id,
            positionY: item.positionY + verticalStartFillPosition,
          }));

        return {
          ...others,
          dashboard: {
            ...dashboard,
            items: [...otherItems, ...oldCategoryItems, ...oldWrapperItems],
            groups: dashboard.groups
              .filter((group) => group.id !== category.id && group.id !== wrapper.id)
              .map((group) =>
                group.type === 'sidebar'
                  ? group
                  : {
                      ...group,
                      index: group.index > category.index ? group.index - 2 : group.index,
                    }
              ),
          },
        };
      });
    },
    rename({ id, name }) {
      set(({ dashboard, ...others }) => {
        if (!dashboard) {
          return {
            ...others,
            dashboard,
          };
        }

        return {
          ...others,
          dashboard: {
            ...dashboard,
            groups: dashboard.groups.map((item) =>
              item.type === 'category' && item.id === id
                ? {
                    ...item,
                    name,
                  }
                : item
            ),
          },
        };
      });
    },
    move({ id, direction }) {
      set(({ dashboard, ...others }) => {
        if (!dashboard) {
          return { ...others, dashboard };
        }

        const category = dashboard.groups.find(
          (group): group is GroupOnly<'category'> => group.id === id
        );
        if (!category) {
          return {
            ...others,
            dashboard,
          };
        }
        const otherIndex = category.index + (direction === 'up' ? -2 : 2);

        if (!dashboard.groups.some((x) => x.index === otherIndex)) {
          return {
            ...others,
            dashboard,
          };
        }

        return {
          ...others,
          dashboard: {
            ...dashboard,
            groups: dashboard.groups.map((group) =>
              group.type === 'category' &&
              (group.index === category.index || group.index === otherIndex)
                ? {
                    ...group,
                    index: category.id === group.id ? otherIndex : category.index,
                  }
                : group
            ),
          },
        };
      });
    },
    add({ id, name, position }) {
      const offset = position === 'above' ? 0 : 2;

      set(({ dashboard, ...others }) => {
        if (!dashboard) {
          return {
            ...others,
            dashboard,
          };
        }

        const category = dashboard.groups.find(
          (group): group is GroupOnly<'category'> => group.id === id
        );
        if (!category) {
          return {
            ...others,
            dashboard,
          };
        }

        return {
          ...others,
          dashboard: {
            ...dashboard,
            groups: dashboard.groups
              .map((group) =>
                group.type === 'sidebar'
                  ? group
                  : {
                      ...group,
                      index: group.index >= category.index + offset ? group.index + 2 : group.index,
                    }
              )
              .concat({
                id: v4(),
                type: 'category',
                index: category.index + offset,
                name,
                items: [],
              })
              .concat({
                id: v4(),
                type: 'wrapper',
                index: category.index + offset + 1,
                items: [],
              }),
          },
        };
      });
    },
    addToTop(name) {
      set(({ dashboard, ...others }) => ({
        ...others,
        dashboard:
          dashboard === null
            ? null
            : {
                ...dashboard,
                groups: dashboard.groups
                  .map((group) =>
                    group.type === 'sidebar'
                      ? group
                      : {
                          ...group,
                          index: group.index === 0 ? 0 : group.index + 2,
                        }
                  )
                  .concat({
                    id: v4(),
                    type: 'category',
                    index: 1,
                    name,

                    items: [],
                  })
                  .concat({
                    id: v4(),
                    type: 'wrapper',
                    index: 2,

                    items: [],
                  }),
              },
      }));
    },
  },
  widgets: {
    saveOptions({ id, options }) {
      set(({ dashboard, ...others }) => ({
        ...others,
        dashboard:
          dashboard === null
            ? null
            : {
                ...dashboard,
                groups: dashboard?.groups.map((group) =>
                  group.items.some((item) => item.id === id)
                    ? {
                        ...group,
                        items: group.items.map((item) =>
                          item.id === id
                            ? {
                                ...item,
                                options,
                              }
                            : item
                        ),
                      }
                    : group
                ),
              },
      }));
    },
  },
  items: {
    remove(id) {
      set(({ dashboard, ...others }) => ({
        ...others,
        dashboard:
          dashboard === null
            ? null
            : {
                ...dashboard,
                groups: dashboard?.groups.map((group) => ({
                  ...group,
                  items: group.items.filter((item) => item.id !== id),
                })),
              },
      }));
    },
    savePositionOrSize({ id, position, size }) {
      set(({ dashboard, ...others }) => ({
        ...others,
        dashboard:
          dashboard === null
            ? null
            : {
                ...dashboard,
                groups: dashboard?.groups.map((group) => ({
                  ...group,
                  items: group.items.map((item) =>
                    item.id === id
                      ? {
                          ...item,
                          positionX: position.x,
                          positionY: position.y,
                          width: size.width,
                          height: size.height,
                        }
                      : item
                  ),
                })),
              },
      }));
    },
    moveToGroup({ id, groupId, position, size }) {
      set(({ dashboard, ...others }) => {
        const item = dashboard?.groups
          .map((group) => group.items.find((item) => item.id === id))
          .find((item) => item !== undefined);

        if (!item) return { ...others, dashboard };

        console.log(position, size);

        return {
          ...others,
          dashboard:
            dashboard === null
              ? null
              : {
                  ...dashboard,
                  groups: dashboard.groups.map((group) =>
                    group.id === groupId
                      ? {
                          ...group,
                          items: group.items.concat({
                            ...item,
                            groupId: group.id,
                            positionX: position.x,
                            positionY: position.y,
                            width: size.width,
                            height: size.height,
                          }),
                        }
                      : {
                          ...group,
                          items: group.items.filter((x) => x.id !== id),
                        }
                  ),
                },
        };
      });
    },
  },
}));

export const useDashboardSave = () => {
  const utils = api.useContext();
  const { mutateAsync: saveChangesAsync } = api.dashboard.save.useMutation();
  const afterChangesSaved = useDashboardStore((state) => state.afterChangesSaved);

  return async (dashboard: RouterOutputs['dashboard']['byId']) => {
    if (!dashboard) return;
    await saveChangesAsync(dashboard, {
      onSuccess: () => {
        utils.dashboard.byId.setData({ id: dashboard.id }, dashboard);
        afterChangesSaved();
      },
    });
  };
};
