import { createContext, useContext } from 'react';
import { Item, ItemOnly } from './type';

type ItemContextType<TItem extends Item = Item> = {
  item: TItem | null;
};

const ItemContext = createContext<ItemContextType>({ item: null });

export const useItemContext = () => useContext(ItemContext);

export const useAppItemContext = () => useItemContext() as ItemContextType<ItemOnly<'app'>>;

export const useWidgetItemContext = () => useItemContext() as ItemContextType<ItemOnly<'widget'>>;

export const ItemProvider = ItemContext.Provider;
