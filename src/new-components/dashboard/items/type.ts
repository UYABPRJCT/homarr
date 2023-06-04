import { Group } from '../groups/type';

export type Item = Group['items'][number];

export type ItemType = Item['type'];

export type ItemWithout<TType extends ItemType, TItem extends Item = Item> = TItem extends {
  type: TType;
}
  ? never
  : TItem;

export type ItemOnly<TType extends ItemType, TItem extends Item = Item> = TItem extends {
  type: TType;
}
  ? TItem
  : never;
