import {
  AppItem,
  CategoryGroup,
  Item,
  ItemGroup,
  PrismaClient,
  PrismaPromise,
  SidebarGroup,
  WidgetItem,
  WidgetOption,
} from '@prisma/client';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { dashboardSchema } from '~/validation/dashboard';

async function getDashboardById(id: string, prisma: PrismaClient) {
  return prisma.dashboard.findUnique({
    where: {
      id,
    },
    include: {
      groups: {
        orderBy: {
          index: 'asc',
        },
        include: {
          items: {
            include: {
              appItem: true,
              widgetItem: true,
            },
          },
          categoryGroup: true,
          sidebarGroup: true,
        },
      },
    },
  });
}

async function generateDashboardOutputById(id: string, prisma: PrismaClient) {
  const dashboard = await getDashboardById(id, prisma);

  if (!dashboard) {
    return null;
  }

  const widgetOptions = await prisma.widgetOption.findMany({
    where: {
      widget: {
        item: {
          groupId: {
            in: dashboard.groups.map((group) => group.id),
          },
        },
      },
    },
  });

  return {
    ...dashboard,
    groups: dashboard.groups.map((group) => {
      if (group.type === 'category') {
        return {
          ...groupProperties(group, 'category'),
          name: group.categoryGroup!.name,
          items: mapItems(group.items, widgetOptions),
        };
      }
      if (group.type === 'sidebar') {
        return {
          ...groupProperties(group, 'sidebar'),
          position: group.sidebarGroup!.position as 'left' | 'right',
          items: mapItems(group.items, widgetOptions),
        };
      }
      return {
        ...groupProperties(group, 'wrapper'),
        items: mapItems(group.items, widgetOptions),
      };
    }),
  };
}

export const dashboardRouter = createTRPCRouter({
  default: publicProcedure.query(async ({ ctx }) => {
    const dashboard = await generateDashboardOutputById('clhgj9ogl0000vqrgtkkldyx9', ctx.prisma);

    if (!dashboard) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Dashboard not found',
      });
    }

    return dashboard;
  }),
  byId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const dashboard = await generateDashboardOutputById(input.id, ctx.prisma);

      if (!dashboard) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Dashboard not found',
        });
      }

      return dashboard;
    }),
  all: publicProcedure.query(async ({ ctx }) =>
    ctx.prisma.dashboard.findMany({
      include: {
        owner: true,
      },
    })
  ),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        isPublic: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dashboard = await ctx.prisma.dashboard.create({
        data: {
          name: input.name,
          owner: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          isPublic: input.isPublic,
          groups: {
            create: [
              {
                type: 'wrapper',
                index: 0,
              },
              {
                type: 'category',
                index: 1,
                categoryGroup: {
                  create: {
                    name: 'Uncategorized',
                  },
                },
              },
              {
                type: 'wrapper',
                index: 2,
              },
            ],
          },
        },
      });

      return dashboard;
    }),
  update: protectedProcedure.input(dashboardSchema).mutation(async ({ ctx, input }) => {
    const dashboard = await getDashboardById(input.id, ctx.prisma);

    if (!dashboard) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Dashboard not found',
      });
    }

    const { id, groups, ownerId, ...dashboardWithoutGroups } = input;

    const transactionActions: PrismaPromise<any>[] = [];

    // Update common dashboard properties
    transactionActions.push(
      ctx.prisma.dashboard.update({
        where: {
          id,
        },
        data: dashboardWithoutGroups,
      })
    );

    // Removes groups
    const groupsToRemove = dashboard.groups.filter(
      (group) => !input.groups.some((g) => g.id === group.id)
    );

    if (groupsToRemove.some((group) => group.items.length > 0)) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Cannot remove group with items',
      });
    }
    transactionActions.push(
      ctx.prisma.itemGroup.deleteMany({
        where: {
          id: {
            in: groupsToRemove.map((group) => group.id),
          },
        },
      })
    );

    // Update groups
    const groupsToUpdate = input.groups.filter((group) =>
      dashboard.groups.some((g) => g.id === group.id)
    );
    // eslint-disable-next-line no-restricted-syntax
    for (const { items, ...group } of groupsToUpdate) {
      transactionActions.push(
        ctx.prisma.itemGroup.update({
          where: {
            id: group.id,
          },
          include: {
            categoryGroup: true,
            sidebarGroup: true,
          },
          data: {
            index: group.index ?? null,
            categoryGroup: group.type === 'category' ? { update: { name: group.name } } : undefined,
            sidebarGroup:
              group.type === 'sidebar' ? { update: { position: group.position } } : undefined,
          },
        })
      );
    }

    // Create groups
    const groupsToCreate = input.groups.filter(
      (group) => !dashboard.groups.some((g) => g.id === group.id)
    );
    // eslint-disable-next-line no-restricted-syntax
    for (const { items, ...group } of groupsToCreate) {
      transactionActions.push(
        ctx.prisma.itemGroup.create({
          data: {
            ...group,
            dashboardId: id,
            categoryGroup: group.type === 'category' ? { create: { name: group.name } } : undefined,
            sidebarGroup:
              group.type === 'sidebar' ? { create: { position: group.position } } : undefined,
          },
        })
      );
    }

    const dbItems = dashboard.groups.flatMap((group) => group.items);
    const bodyItems = input.groups.flatMap((group) => group.items);

    // Removes items
    const itemsToRemove = dbItems.filter((item) => !bodyItems.some((i) => i.id === item.id));
    transactionActions.push(
      ctx.prisma.item.deleteMany({
        where: {
          id: {
            in: itemsToRemove.map((item) => item.id),
          },
        },
      })
    );

    // Update items
    const itemsToUpdate = bodyItems.filter((item) => dbItems.some((i) => i.id === item.id));
    // eslint-disable-next-line no-restricted-syntax
    for (const item of itemsToUpdate) {
      transactionActions.push(
        ctx.prisma.item.update({
          where: {
            id: item.id,
          },
          include: {
            appItem: true,
            widgetItem: true,
          },
          data: {
            type: item.type,
            positionX: item.positionX,
            positionY: item.positionY,
            width: item.width,
            height: item.height,
            appItem:
              item.type === 'app'
                ? {
                    update: {
                      externalUrl: item.externalUrl,
                      internalUrl: item.internalUrl,
                      iconSource: item.iconSource,
                      name: item.name,
                      openInNewTab: item.openInNewTab,
                    },
                  }
                : undefined,
            widgetItem:
              item.type === 'widget'
                ? {
                    update: {
                      sort: item.sort,
                      options: undefined,
                    },
                  }
                : undefined,
            groupId: item.groupId,
          },
        })
      );
    }

    // Create items
    const itemsToCreate = bodyItems.filter((item) => !dbItems.some((i) => i.id === item.id));
    // eslint-disable-next-line no-restricted-syntax
    for (const item of itemsToCreate) {
      transactionActions.push(
        ctx.prisma.item.create({
          data: {
            type: item.type,
            positionX: item.positionX,
            positionY: item.positionY,
            width: item.width,
            height: item.height,
            appItem:
              item.type === 'app'
                ? {
                    create: {
                      externalUrl: item.externalUrl,
                      internalUrl: item.internalUrl,
                      iconSource: item.iconSource,
                      name: item.name,
                      openInNewTab: item.openInNewTab,
                    },
                  }
                : undefined,
            widgetItem:
              item.type === 'widget'
                ? {
                    create: {
                      sort: item.sort,
                      options: undefined,
                    },
                  }
                : undefined,
            groupId: item.groupId,
          },
        })
      );
    }

    await ctx.prisma.$transaction(transactionActions);
  }),
});

type DbGroup = ItemGroup & {
  sidebarGroup: SidebarGroup | null;
  categoryGroup: CategoryGroup | null;
  items: DbItem[];
};

const groupProperties = <TKey extends 'category' | 'wrapper' | 'sidebar'>(
  input: DbGroup,
  type: TKey
) => ({
  id: input.id,
  type,
  index: input.index as TKey extends 'sidebar' ? null : number,
});

type DbItem = Item & {
  appItem: AppItem | null;
  widgetItem: WidgetItem | null;
};

const mapItems = (items: DbItem[], widgetOptions: WidgetOption[]) =>
  items.map((item) => {
    if (item.type === 'app') {
      return {
        ...itemProperties(item, 'app'),
        name: item.appItem!.name,
        internalUrl: item.appItem!.internalUrl,
        externalUrl: item.appItem!.externalUrl,
        iconSource: item.appItem!.iconSource,
        openInNewTab: item.appItem!.openInNewTab,
      };
    }
    const thisWidgetOptions = widgetOptions.filter((option) => option.widgetId === item.id);
    return {
      ...itemProperties(item, 'widget'),
      sort: item.widgetItem!.sort,
      options: thisWidgetOptions
        .filter((option) => option.parentId === null)
        .map((option) => ({
          [option.name]: getOptionValue(option, thisWidgetOptions),
        }))
        .reduce((acc, curr) => {
          const key = Object.keys(curr)[0];
          acc[key] = curr[key];
          return acc;
        }, {}),
    };
  });

const getOptionValue = (option: WidgetOption, otherOptions: WidgetOption[]): any => {
  if (option.type === 'boolean') {
    return option.value === 'true';
  }
  if (option.type === 'number') {
    return Number(option.value);
  }
  if (option.type === 'string') {
    return option.value;
  }

  if (option.type === 'object') {
    return getOptionChildren(otherOptions, option.id)
      .map((child) => ({
        [child.name]: getOptionValue(child, otherOptions),
      }))
      .reduce((acc, curr) => {
        const key = Object.keys(curr)[0];
        acc[key] = curr[key];
        return acc;
      }, {});
  }

  if (option.type === 'array') {
    return getOptionChildren(otherOptions, option.id).map((child) =>
      getOptionValue(child, otherOptions)
    );
  }

  return null;
};

const getOptionChildren = (options: WidgetOption[], id: string) =>
  options.filter((option) => option.parentId === id);

const itemProperties = <TKey extends 'app' | 'widget'>(
  input: Item & {
    appItem: AppItem | null;
    widgetItem: WidgetItem | null;
  },
  type: TKey
) => ({
  id: input.id,
  type,
  positionX: input.positionX,
  positionY: input.positionY,
  width: input.width,
  height: input.height,
  groupId: input.groupId,
});
