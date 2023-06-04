/* eslint-disable react/no-unknown-property */
import { PropsWithChildren, useEffect, useRef } from 'react';
import { useGridstackContext } from '../gridstack/context';
import { useDashboardStore } from '../store';
import { useItemContext } from './context';

type GridStackItemWrapperProps = PropsWithChildren<Record<never, string>>;

export const GridStackItemWrapper = (props: GridStackItemWrapperProps) => {
  const { item } = useItemContext();
  const { gridstack } = useGridstackContext();
  const isEditMode = useDashboardStore((x) => x.isEditMode);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!item || !ref.current) return;
    // Adds the new grid-stack-item to the gridstack engine
    gridstack?.current?.makeWidget(ref.current);

    // eslint-disable-next-line consistent-return
    return () => {
      // Removes the previous grid-stack-item from the gridstack engine
      const previousNode = gridstack?.current?.engine.nodes.find((x) => x.id === item.id);
      if (!previousNode) return;
      gridstack?.current?.engine.removeNode(previousNode, false);
    };
  }, [
    item,
    ref,
    isEditMode,
    item?.groupId,
    item?.positionX,
    item?.positionY,
    item?.width,
    item?.height,
  ]);

  if (!item) return null;

  return (
    <div
      className="grid-stack-item"
      data-type={item.type}
      data-id={item.id}
      gs-x={item.positionX}
      gs-y={item.positionY}
      gs-w={item.width}
      data-gridstack-w={item.width}
      gs-h={item.height}
      data-gridstack-h={item.height}
      gs-id={item.id}
      gs-min-w={1}
      gs-min-h={1}
      gs-max-w={12}
      gs-max-h={12}
      ref={ref}
    >
      {props.children}
    </div>
  );
};
