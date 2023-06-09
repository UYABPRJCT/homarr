import { Group, Stack } from '@mantine/core';
import { useEffect, useMemo, useRef } from 'react';
import { isSidebarEnabled, useDashboard } from '~/pages';
import { useResize } from '../../../hooks/use-resize';
import { useScreenLargerThan } from '../../../hooks/useScreenLargerThan';
import { DashboardCategory } from '../Wrappers/Category/Category';
import { DashboardSidebar } from '../Wrappers/Sidebar/Sidebar';
import { DashboardWrapper } from '../Wrappers/Wrapper/Wrapper';
import { useGridstackStore } from '../Wrappers/gridstack/store';
import { excludeItemsFromType } from '../types';

export const DashboardView = () => {
  const wrappers = useWrapperItems();
  const sidebarsVisible = useSidebarVisibility();
  const { isReady, mainAreaRef } = usePrepareGridstack();

  return (
    <Group align="top" h="100%" spacing="xs">
      {sidebarsVisible.left ? (
        <DashboardSidebar location="left" isGridstackReady={isReady} />
      ) : null}

      <Stack ref={mainAreaRef} mx={-10} style={{ flexGrow: 1 }}>
        {isReady &&
          wrappers.map((item) =>
            item.type === 'category' ? (
              <DashboardCategory key={item.id} category={item} />
            ) : (
              <DashboardWrapper key={item.id} wrapper={item} />
            )
          )}
      </Stack>

      {sidebarsVisible.right ? (
        <DashboardSidebar location="right" isGridstackReady={isReady} />
      ) : null}
    </Group>
  );
};

const usePrepareGridstack = () => {
  const mainAreaRef = useRef<HTMLDivElement>(null);
  const { width } = useResize(mainAreaRef, []);
  const setMainAreaWidth = useGridstackStore((x) => x.setMainAreaWidth);
  const mainAreaWidth = useGridstackStore((x) => x.mainAreaWidth);

  useEffect(() => {
    if (width === 0) return;
    setMainAreaWidth(width);
  }, [width]);

  return {
    isReady: Boolean(mainAreaWidth),
    mainAreaRef,
  };
};

const useSidebarVisibility = () => {
  const dashboard = useDashboard();
  const isLeftSidebarEnabled = isSidebarEnabled(dashboard, 'left');
  const isRightSidebarEnabled = isSidebarEnabled(dashboard, 'right');
  const screenLargerThanMd = useScreenLargerThan('md'); // For smaller screens mobile ribbons are displayed with drawers

  const isScreenSizeUnknown = typeof screenLargerThanMd === 'undefined';

  return {
    right: isRightSidebarEnabled && screenLargerThanMd,
    left: isLeftSidebarEnabled && screenLargerThanMd,
    isLoading: isScreenSizeUnknown,
  };
};

const useWrapperItems = () => {
  const dashboard = useDashboard();

  return useMemo(
    () => excludeItemsFromType(dashboard.groups, 'sidebar').sort((a, b) => a.index - b.index),
    [dashboard.groups]
  );
};
