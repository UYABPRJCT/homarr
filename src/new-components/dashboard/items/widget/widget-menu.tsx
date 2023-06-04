import { Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { openContextModalNew } from '~/tools/mantineModalManagerExtensions';
import { ItemMenu } from '../common/item-menu';
import { useWidgetItemContext } from '../context';
import { AnyWidgetOptions, OptionDefinition, WidgetDefinition } from './definition';
//import { useWrapperColumnCount } from '~/components/Dashboard/Wrappers/gridstack/store';

interface WidgetsMenuProps {
  options: AnyWidgetOptions;
  definition: WidgetDefinition<string, OptionDefinition>;
}

export const WidgetMenu = ({ options, definition }: WidgetsMenuProps) => {
  const { item: widget } = useWidgetItemContext();
  const { t } = useTranslation(`modules/${widget?.sort}`);

  if (!widget) return null;

  const handleDeleteClick = () => {
    openContextModalNew({
      modal: 'widget.remove',
      title: <Title order={4}>{t('common:remove')}</Title>,
      innerProps: {
        widgetId: widget.id,
        widgetSort: widget.sort,
      },
    });
  };

  /*const handleChangeSizeClick = () => {
    openContextModalGeneric<WidgetChangePositionModalInnerProps>({
      modal: 'changeIntegrationPositionModal',
      size: 'xl',
      title: null,
      innerProps: {
        widgetId: widget.id,
        widgetType: integration,
        widget,
        wrapperColumnCount,
      },
    });
  };*/

  const handleEditClick = () => {
    openContextModalNew({
      modal: 'widget.edit',
      title: <Title order={4}>{t('descriptor.settings.title')}</Title>,
      innerProps: {
        widgetId: widget.id,
        widgetSort: widget.sort,
        options: widget.options,
        definition,
      },
      zIndex: 250,
    });
  };

  return (
    <ItemMenu
      handleEditClick={handleEditClick}
      handleChangePositionClick={() => {}}
      handleDeleteClick={handleDeleteClick}
      isEditable
    />
  );
};
