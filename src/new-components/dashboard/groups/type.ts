import { RouterOutputs } from '~/utils/api';

export type Group = Exclude<RouterOutputs['dashboard']['byId'], null>['groups'][number];

export type GroupType = Group['type'];

export type GroupWithout<TType extends GroupType, TGroup extends Group = Group> = TGroup extends {
  type: TType;
}
  ? never
  : TGroup;

export type GroupOnly<TType extends GroupType, TGroup extends Group = Group> = TGroup extends {
  type: TType;
}
  ? TGroup
  : never;
