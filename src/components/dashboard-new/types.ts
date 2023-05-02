import { MantineColor } from '@mantine/core';

export type Wrapper = {
  id: string;
  type: 'wrapper';
  index: number;
};

export type Category = {
  id: string;
  type: 'category';
  index: number;
  name: string;
};

export type Sidebar = {
  id: string;
  type: 'sidebar';
  position: 'right' | 'left';
  index: undefined;
};

export type ItemGroup = Wrapper | Category | Sidebar;

export type StatusCode = {
  code: number;
  group: 'success' | 'client-error' | 'server-error';
};

export type IntegrationSecret = {
  id: string;
  type: 'apiKey' | 'password' | 'username';
  value: string | null;
  isPrivate: boolean;
  isDefined: boolean;
};

export type Integration = {
  id: string;
  type: 'sonarr' | 'readarr' | 'radarr' | 'jellyfin';
  secrets: IntegrationSecret[];
};

export type App = {
  id: string;
  type: 'app';
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  name: string;
  internalUrl: string;
  externalUrl: string;
  iconSource: string;
  openInNewTab: boolean;
  statusCodes: StatusCode[];
  integration: Integration | null;
  groupId: string;
};

export type Widget = {
  id: string;
  type: 'widget';
  sort: 'clock' | 'calendar' | 'weather';
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  groupId: string;
};

export type Item = Widget | App;

export type Dashboard = {
  id: string;
  isPublic: boolean;
  pageTitle: string;
  metaTitle: string;
  logoSource: string;
  faviconSource: string;
  backgroundImageSource: string;
  customCss: string;
  primaryColor: MantineColor;
  secondaryColor: string;
  primaryColorShade: number;
  appOpacity: number;
  isLeftSidebarEnabled: boolean;
  isRightSidebarEnabled: boolean;
  isDockerEnabled: boolean;
  isPingEnabled: boolean;
  isSearchEnabled: boolean;
  ownerId: string;
  groups: ItemGroup[];
  items: Item[];
};
