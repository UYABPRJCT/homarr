import { openContextModal } from '@mantine/modals';
import { ContextModalProps, OpenContextModal } from '@mantine/modals/lib/context';
import { WidgetEditModal } from '~/new-components/dashboard/items/widget/modals/edit-widget-modal';
import { WidgetRemoveModal } from '~/new-components/dashboard/items/widget/modals/remove-widget-modal';

export const contextModals = {
  'widget.remove': WidgetRemoveModal,
  'widget.edit': WidgetEditModal,
} as const;

export const openContextModalGeneric = <T extends Record<string, unknown>>(
  payload: OpenContextModal<T> & { modal: string }
) => openContextModal(payload);

type ModalKey = keyof typeof contextModals;
type inferInnerProps<T> = T extends React.FC<ContextModalProps<infer TInnerProps>>
  ? TInnerProps
  : never;

export const openContextModalNew = <TKey extends ModalKey>(
  payload: OpenContextModal<inferInnerProps<(typeof contextModals)[TKey]>> & { modal: TKey }
) => openContextModal(payload);
