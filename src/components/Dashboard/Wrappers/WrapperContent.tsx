import { GridStack } from 'fily-publish-gridstack';
import { MutableRefObject, RefObject } from 'react';
import { ItemCard } from '../Tiles/Item';
import { Item } from '../types';
import { useGridstackStore } from './gridstack/store';

interface WrapperContentProps {
  items: Item[];
  refs: {
    wrapper: RefObject<HTMLDivElement>;
    items: MutableRefObject<Record<string, RefObject<HTMLDivElement>>>;
    gridstack: MutableRefObject<GridStack | undefined>;
  };
}

export function WrapperContent({ items, refs }: WrapperContentProps) {
  const shapeSize = useGridstackStore((x) => x.currentShapeSize);

  if (!shapeSize) return null;

  return items.map((item) => <ItemCard item={item} itemRef={refs.items.current[item.id]} />);
}
