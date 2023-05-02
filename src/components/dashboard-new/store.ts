import { v4 } from 'uuid';
import { create } from 'zustand';
import { Category, Dashboard, Item, Wrapper } from './types';

type DashboardStore = {
  isEditMode: boolean;
  dashboard: Dashboard | null;
  edit: (dashboard: Dashboard) => void;
  disableEdit: () => void;
  categories: {
    all: () => Category[];
    byId: (id: string) => Category | null;
    items: (id: string) => Item[];
    remove: (id: string) => void;
    rename: (input: { id: string; name: string }) => void;
    move: (input: { id: string; direction: 'up' | 'down' }) => void;
    addToTop: (name: string) => void;
    add: (input: { id: string; name: string; position: 'above' | 'below' }) => void;
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
  disableEdit: () => {
    set({
      isEditMode: false,
      dashboard: null,
    });
  },
  categories: {
    all: () =>
      get().dashboard?.groups.filter((group): group is Category => group.type === 'category') ?? [],
    byId: (id) =>
      get().dashboard?.groups.find(
        (group): group is Category => group.type === 'category' && group.id === id
      ) ?? null,
    items: (id) => get().dashboard?.items.filter((item) => item.groupId === id) ?? [],
    remove(id) {
      const { dashboard } = get();
      if (!dashboard) return;
      const category = dashboard.groups.find((group): group is Category => group.id === id);
      if (!category) return;
      const wrapper = dashboard.groups.find(
        (group): group is Wrapper => group.type === 'wrapper' && group.index === category.index + 1
      );
      if (!wrapper) return;

      const firstWrapperAbove = dashboard.groups
        .filter((group): group is Wrapper | Category => group.type !== 'sidebar')
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
        const otherItems =
          dashboard?.items.filter((x) => x.groupId !== id && x.groupId !== wrapper.id) ?? [];
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

        const category = dashboard.groups.find((group): group is Category => group.id === id);
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

        const category = dashboard.groups.find((group): group is Category => group.id === id);
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
              })
              .concat({
                id: v4(),
                type: 'wrapper',
                index: category.index + offset + 1,
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
                  })
                  .concat({
                    id: v4(),
                    type: 'wrapper',
                    index: 2,
                  }),
              },
      }));
    },
  },
}));
