import { z } from 'zod';

export const sharedItemSchema = z.object({
  id: z.string(),
  positionX: z.number(),
  positionY: z.number(),
  width: z.number(),
  height: z.number(),
  groupId: z.string(),
});

export const appSchema = sharedItemSchema.merge(
  z.object({
    type: z.literal('app'),
    name: z.string(),
    internalUrl: z.string(),
    externalUrl: z.string(),
    iconSource: z.string(),
    openInNewTab: z.boolean(),
  })
);

export const widgetSchema = sharedItemSchema.merge(
  z.object({
    type: z.literal('widget'),
    sort: z.string(),
    options: z.any(),
  })
);

export const itemSchema = z.union([appSchema, widgetSchema]);

export const wrapperSchema = z.object({
  id: z.string(),
  type: z.literal('wrapper'),
  index: z.number(),
  items: z.array(itemSchema),
});

export const categorySchema = z.object({
  id: z.string(),
  type: z.literal('category'),
  index: z.number(),
  name: z.string(),
  items: z.array(itemSchema),
});

export const sidebarSchema = z.object({
  id: z.string(),
  type: z.literal('sidebar'),
  index: z.null(),
  position: z.enum(['left', 'right']),
  items: z.array(itemSchema),
});

export const groupSchema = z.union([wrapperSchema, categorySchema, sidebarSchema]);

export const dashboardSchema = z.object({
  id: z.string(),
  pageTitle: z.string().nullable(),
  metaTitle: z.string().nullable(),
  name: z.string(),
  isPublic: z.boolean(),
  logoSource: z.string().nullable(),
  faviconSource: z.string().nullable(),
  backgroundImageSource: z.string().nullable(),
  customCss: z.string().nullable(),
  primaryColor: z.string().nullable(),
  secondaryColor: z.string().nullable(),
  primaryColorShade: z.number().nullable(),
  appOpacity: z.number().nullable(),
  isDockerEnabled: z.boolean(),
  isPingEnabled: z.boolean(),
  isSearchEnabled: z.boolean(),
  ownerId: z.string().cuid(),
  groups: z.array(groupSchema),
});
