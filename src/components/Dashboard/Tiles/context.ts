import { createContext, useContext } from 'react';
import { Item } from '../types';

type ItemContext = {
  item: Item;
};

const ItemContext = createContext<ItemContext | null>(null);

export const ItemProvider = ItemContext.Provider;

export const useItemContext = () => {
  const context = useContext(ItemContext);

  if (!context) {
    throw new Error('useItemContext must be used within an ItemProvider');
  }

  return context.item;
};

export const useWidgetItemContext = () => {
  const context = useContext(ItemContext);

  if (!context || context.item.type !== 'widget') {
    throw new Error('useWidgetItemContext must be used within an ItemProvider');
  }

  return context.item;
};

export const useAppItemContext = () => {
  const context = useContext(ItemContext);

  if (!context || context.item.type !== 'app') {
    throw new Error('useWidgetItemContext must be used within an ItemProvider');
  }

  return context.item;
};
