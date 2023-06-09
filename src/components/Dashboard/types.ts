import { RouterOutputs } from '../../utils/api';

type WithType = { type: string };

type OnlyOfType<TInput extends WithType, TType extends TInput['type']> = TInput extends {
  type: TType;
}
  ? TInput
  : never;

export type RemoveType<TInput extends WithType, TType extends TInput['type']> = TInput extends {
  type: TType;
}
  ? never
  : TInput;

export const excludeItemsFromType = <TItem extends WithType, TType extends TItem['type']>(
  items: TItem[],
  type: TType
) => items.filter((item): item is RemoveType<TItem, TType> => item.type !== type);

export const onlyItemsFromType = <TItem extends WithType, TType extends TItem['type']>(
  items: TItem[],
  type: TType
) => items.filter((item): item is RemoveType<TItem, TType> => item.type === type);

export type Dashboard = RouterOutputs['dashboard']['byId'];
export type ItemGroup = Dashboard['groups'][number];
export type CategoryGroup = OnlyOfType<ItemGroup, 'category'>;
export type WrapperGroup = OnlyOfType<ItemGroup, 'wrapper'>;
export type SidebarGroup = OnlyOfType<ItemGroup, 'sidebar'>;
export type Item = ItemGroup['items'][number];
export type AppItem = OnlyOfType<Item, 'app'>;
export type WidgetItem = OnlyOfType<Item, 'widget'>;
