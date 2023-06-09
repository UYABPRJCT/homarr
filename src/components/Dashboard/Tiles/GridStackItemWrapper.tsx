/* eslint-disable react/no-unknown-property */
import { ReactNode, RefObject } from 'react';
import { useItemContext } from './context';

interface GridStackItemWrapperProps {
  itemRef: RefObject<HTMLDivElement>;
  children: ReactNode;
}

export const GridStackItemWrapper = ({ children, itemRef }: GridStackItemWrapperProps) => {
  const item = useItemContext();
  const locationProperties = useLocationProperties(item.positionX, item.positionY);
  const normalizedWidth = item.width ?? 1;
  const normalizedHeight = item.height ?? 1;

  return (
    <div
      className="grid-stack-item"
      data-type={item.type}
      data-id={item.id}
      {...locationProperties}
      gs-w={normalizedWidth}
      data-gridstack-w={normalizedWidth}
      gs-h={normalizedHeight}
      data-gridstack-h={normalizedHeight}
      gs-min-w={1}
      gs-min-h={1}
      gs-max-w={12}
      gs-max-h={12}
      ref={itemRef}
    >
      {children}
    </div>
  );
};
/* TODO: Maybe read those properties again from definition */

const useLocationProperties = (x: number | undefined, y: number | undefined) => {
  const isLocationDefined = x !== undefined && y !== undefined;

  if (!isLocationDefined) {
    return {
      'gs-auto-position': 'true',
    };
  }

  return {
    'gs-x': x.toString(),
    'data-gridstack-x': x.toString(),
    'gs-y': y.toString(),
    'data-gridstack-y': y.toString(),
  };
};
