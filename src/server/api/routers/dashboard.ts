import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { Dashboard } from '~/components/dashboard-new/types';

const app = (
  id: string,
  integration: boolean,
  groupId: string,
  props: {
    x: number;
    y: number;
    width: number;
    height: number;
  }
) => ({
  id,
  type: 'app',
  positionX: props.x,
  positionY: props.y,
  width: props.width,
  height: props.height,
  name: `App ${id}`,
  internalUrl: '',
  externalUrl: '',
  iconSource: '',
  openInNewTab: true,
  statusCodes: [
    {
      code: 200,
      group: 'success',
    },
  ],
  integration: integration
    ? {
        id,
        type: 'sonarr',
        secrets: [
          {
            id,
            type: 'apiKey',
            value: null,
            isPrivate: true,
            isDefined: true,
          },
        ],
      }
    : null,
  groupId,
});

export const dashboardRouter = createTRPCRouter({
  byId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }): Dashboard => {
      const i = 0;
      return {
        id: input.id,
        isPublic: true,
        pageTitle: 'Homarr',
        metaTitle: 'Homarr',
        logoSource: '',
        faviconSource: '',
        backgroundImageSource: '',
        customCss: '',
        primaryColor: 'red',
        secondaryColor: 'orange',
        primaryColorShade: 1,
        appOpacity: 50,
        isLeftSidebarEnabled: false,
        isRightSidebarEnabled: false,
        isDockerEnabled: false,
        isPingEnabled: true,
        isSearchEnabled: true,
        ownerId: '1',
        groups: [
          {
            id: '1',
            type: 'wrapper',
            index: 0,
          },
          {
            id: '2',
            type: 'category',
            name: 'Category 1',
            index: 1,
          },
          {
            id: '3',
            type: 'wrapper',
            index: 2,
          },
          {
            id: '4',
            type: 'category',
            name: 'Category 2',
            index: 3,
          },
          {
            id: '5',
            type: 'wrapper',
            index: 4,
          },
        ],
        items: [
          app('1', true, '1', {
            x: 0,
            y: 0,
            width: 2,
            height: 2,
          }),
          {
            id: '3',
            type: 'widget',
            sort: 'clock',
            positionX: 0,
            positionY: 2,
            width: 2,
            height: 1,
            groupId: '2',
          },
          app('2', false, '5', {
            x: 2,
            y: 0,
            width: 2,
            height: 2,
          }),
        ],
      } satisfies Dashboard;
    }),
});
