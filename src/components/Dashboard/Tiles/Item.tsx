import { RefObject } from 'react';
import { Item } from '../types';
import { ItemProvider } from './context';
import { GridStackItemWrapper } from './GridStackItemWrapper';
import { WidgetItemCard } from './Widgets/WidgetItem';
import { AppItemCard } from './Apps/AppItem';

type ItemCardProps = {
  item: Item;
  itemRef: RefObject<HTMLDivElement>;
};

export const ItemCard = ({ item, itemRef }: ItemCardProps) => (
  <ItemProvider value={{ item }}>
    <GridStackItemWrapper itemRef={itemRef}>
      {item.type === 'widget' ? <WidgetItemCard /> : <AppItemCard />}
    </GridStackItemWrapper>
  </ItemProvider>
);
