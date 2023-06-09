import { GridStack, GridStackNode } from 'fily-publish-gridstack';
import { MutableRefObject, RefObject } from 'react';
import { Item, ItemGroup } from '../../types';

export const initializeGridstack = (
  groupType: ItemGroup['type'],
  wrapperRef: RefObject<HTMLDivElement>,
  gridRef: MutableRefObject<GridStack | undefined>,
  itemRefs: MutableRefObject<Record<string, RefObject<HTMLDivElement>>>,
  areaId: string,
  items: Item[],
  isEditMode: boolean,
  wrapperColumnCount: number,
  shapeSize: 'sm' | 'md' | 'lg',
  tilesWithUnknownLocation: TileWithUnknownLocation[],
  events: {
    onChange: (changedNode: GridStackNode) => void;
    onAdd: (addedNode: GridStackNode) => void;
  }
) => {
  if (!wrapperRef.current) return;
  // calculates the currently available count of columns
  const columnCount = groupType === 'sidebar' ? 2 : wrapperColumnCount;
  const minRow = groupType !== 'sidebar' ? 1 : Math.floor(wrapperRef.current.offsetHeight / 128);
  // initialize gridstack
  const newGrid = gridRef;
  newGrid.current = GridStack.init(
    {
      column: columnCount,
      margin: groupType === 'sidebar' ? 5 : 10,
      cellHeight: 128,
      float: true,
      alwaysShowResizeHandle: 'mobile',
      acceptWidgets: true,
      disableOneColumnMode: true,
      staticGrid: !isEditMode,
      minRow,
      animate: false,
    },
    // selector of the gridstack item (it's eather category or wrapper)
    `.grid-stack-${groupType}[data-${groupType}='${areaId}']`
  );
  const grid = newGrid.current;
  // Must be used to update the column count after the initialization
  grid.column(columnCount, 'none');

  // Add listener for moving items around in a wrapper
  grid.on('change', (_, el) => {
    const nodes = el as GridStackNode[];
    const firstNode = nodes.at(0);
    if (!firstNode) return;
    events.onChange(firstNode);
  });

  // Add listener for moving items in config from one wrapper to another
  grid.on('added', (_, el) => {
    const nodes = el as GridStackNode[];
    const firstNode = nodes.at(0);
    if (!firstNode) return;
    events.onAdd(firstNode);
  });

  grid.batchUpdate();
  grid.removeAll(false);
  // TODO: add this but with new schema
  items.forEach((item) => {
    const itemRef = itemRefs.current[item.id]?.current;
    setAttributesFromShape(itemRef, item);
    itemRef && grid.makeWidget(itemRef as HTMLDivElement);
    /*if (itemRef) {
      const gridItemElement = itemRef as GridItemHTMLElement;
      if (gridItemElement.gridstackNode) {
        const { x, y, w, h } = gridItemElement.gridstackNode;
        tilesWithUnknownLocation.push({ x, y, w, h, type: item.type, id: item.id });
      }
    }*/
  });
  grid.batchUpdate(false);
};

function setAttributesFromShape(ref: HTMLDivElement | null, item: Item) {
  if (!ref) return;
  ref.setAttribute('gs-x', item.positionX.toString());
  ref.setAttribute('gs-y', item.positionY.toString());
  ref.setAttribute('gs-w', item.width.toString());
  ref.setAttribute('gs-h', item.height.toString());
}

export type TileWithUnknownLocation = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  type: 'app' | 'widget';
  id: string;
};
