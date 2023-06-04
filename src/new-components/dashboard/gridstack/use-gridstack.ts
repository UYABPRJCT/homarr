import { GridStack } from 'fily-publish-gridstack';
import { DDElement } from 'fily-publish-gridstack/dist/dd-element';
import { RefObject, useEffect, useMemo, useRef } from 'react';
import { useGroupContext } from '../groups/context';
import { useDashboardStore } from '../store';
import { initializeGridstack } from './initialize-gridstack';

export const useGridstack = (
  wrapperRef: RefObject<
    HTMLDivElement & { gridstack: GridStack | undefined; ddElement: DDElement | undefined }
  >
) => {
  const isEditMode = useDashboardStore((x) => x.isEditMode);
  const { group } = useGroupContext();
  const itemsActions = useDashboardStore((x) => x.items);
  const groupActions = useDashboardStore((x) => x.groups);
  // reference of the gridstack object for modifications after initialization
  const gridRef = useRef<GridStack>();
  const wrapperColumnCount = 12;
  const shapeSize = 64;
  const mainAreaWidth = 1920;
  // width of the wrapper (updating on page resize)
  const root: HTMLHtmlElement = useMemo(() => document.querySelector(':root')!, []);

  if (!group) throw new Error('Group is not defined');

  useEffect(() => {
    if (group.type === 'sidebar' || group.index >= 1 || !gridRef.current) return;
    const widgetWidth = mainAreaWidth / wrapperColumnCount;
    // widget width is used to define sizes of gridstack items within global.scss
    root.style.setProperty('--gridstack-widget-width', widgetWidth.toString());
    gridRef.current?.cellHeight(widgetWidth);
  }, [mainAreaWidth, wrapperColumnCount, gridRef.current]);

  useEffect(() => {
    // column count is used to define count of columns of gridstack within global.scss
    root.style.setProperty('--gridstack-column-count', wrapperColumnCount.toString());
  }, [wrapperColumnCount]);

  // initialize the gridstack
  useEffect(() => {
    const removeEventHandlers = () => {
      gridRef.current?.off('change');
      gridRef.current?.off('added');
    };

    initializeGridstack({
      group,
      wrapperRef,
      gridRef,
      isEditMode,
      wrapperColumnCount,
      shapeSize: 'lg',
      actions: {
        savePositionOrSize: itemsActions.savePositionOrSize,
        moveToGroup: itemsActions.moveToGroup,
        hasGroupItem: groupActions.hasItem,
      },
    });

    // TODO: define position of items with unknown location

    return removeEventHandlers;
  }, [wrapperRef.current, wrapperColumnCount]);

  useEffect(() => {
    gridRef.current?.setStatic(!isEditMode);
  }, [isEditMode]);

  return {
    gridRef,
  };
};
