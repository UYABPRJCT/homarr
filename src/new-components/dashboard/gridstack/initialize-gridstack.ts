import { GridStack, GridStackNode } from 'fily-publish-gridstack';
import { DDElement } from 'fily-publish-gridstack/dist/dd-element';
import { MutableRefObject, RefObject } from 'react';
import { Group } from '../groups/type';

type InitializeGridstackProps = {
  group: Group;
  wrapperRef: RefObject<
    HTMLDivElement & { gridstack: GridStack | undefined; ddElement: DDElement | undefined }
  >;
  gridRef: MutableRefObject<GridStack | undefined>;
  isEditMode: boolean;
  wrapperColumnCount: number;
  shapeSize: 'sm' | 'md' | 'lg';
  actions: {
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
    hasGroupItem: (groupId: string, id: string) => boolean;
  };
};

export const initializeGridstack = ({
  group,
  wrapperRef,
  gridRef,
  isEditMode,
  wrapperColumnCount,
  shapeSize,
  actions,
}: InitializeGridstackProps) => {
  if (!wrapperRef.current) return;
  // calculates the currently available count of columns
  const columnCount = group.type === 'sidebar' ? 2 : wrapperColumnCount;
  const minRow = group.type !== 'sidebar' ? 1 : Math.floor(wrapperRef.current.offsetHeight / 128);
  // initialize gridstack
  const newGrid = gridRef;
  const widgetWidth = 1920 / wrapperColumnCount;
  newGrid.current = GridStack.init(
    {
      column: columnCount,
      margin: group.type === 'sidebar' ? 5 : 10,
      cellHeight: widgetWidth,
      float: true,
      alwaysShowResizeHandle: 'mobile',
      acceptWidgets: true,
      disableOneColumnMode: true,
      staticGrid: !isEditMode,
      minRow,
      animate: false,
    },
    wrapperRef.current
  );
  const grid = newGrid.current;
  if (!grid) return;
  // Must be used to update the column count after the initialization
  grid.column(columnCount, 'none');

  // Add listener for moving items around in a wrapper
  grid.on('change', (_, el) => {
    const nodes = el as GridStackNode[];
    const changedNode = nodes.at(0);
    if (!changedNode) return;
    const itemType = changedNode.el?.getAttribute('data-type');
    const itemId = changedNode.el?.getAttribute('data-id');
    if (!itemType || !itemId) return;

    actions.savePositionOrSize({
      id: itemId,
      position: {
        x: changedNode.x!,
        y: changedNode.y!,
      },
      size: {
        width: changedNode.w!,
        height: changedNode.h!,
      },
    });
  });

  let lastCalledAdditionId = '';
  // Add listener for moving items in config from one wrapper to another
  grid.on('added', (_, el) => {
    const nodes = el as GridStackNode[];
    const changedNode = nodes.at(0);
    if (!changedNode) return;
    const itemType = changedNode.el?.getAttribute('data-type');
    const itemId = changedNode.el?.getAttribute('data-id');
    if (!itemType || !itemId) return;

    // Cancel if the item is already in the group (Otherwise on initial load it will cause an infinite loop)
    if (actions.hasGroupItem(group.id, itemId)) return;
    if (lastCalledAdditionId === itemId) return;

    lastCalledAdditionId = itemId;
    actions.moveToGroup({
      id: itemId,
      groupId: group.id,
      position: {
        x: changedNode.x!,
        y: changedNode.y!,
      },
      size: {
        width: changedNode.w!,
        height: changedNode.h!,
      },
    });
  });

  grid.on('removed', (_, el) => {
    const nodes = el as GridStackNode[];
    const changedNode = nodes.at(0);
    if (!changedNode) return;

    const itemType = changedNode.el?.getAttribute('data-type');
    const itemId = changedNode.el?.getAttribute('data-id');

    if (!itemType || !itemId) return;

    if (lastCalledAdditionId === itemId) {
      lastCalledAdditionId = '';
    }
    grid.engine.removeNode(changedNode, false, false);
  });
};
