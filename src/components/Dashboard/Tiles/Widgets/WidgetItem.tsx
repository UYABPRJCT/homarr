import Consola from 'consola';
import WidgetComponents from '~/widgets';
import { WidgetComponent } from '~/widgets/common/definition';
import { useWidgetItemContext } from '../context';

export const WidgetItemCard = () => {
  const widget = useWidgetItemContext();

  if (!widget) return null;

  const Component = WidgetComponents[
    widget.sort as keyof typeof WidgetComponents
  ] as WidgetComponent<any>;

  if (!Component) {
    Consola.error(`Widget "${widget.sort}" has no component. Please check your widget definition.`);
    return null;
  }

  if (typeof Component !== 'function') {
    return null;
  }

  return <Component options={widget.options} />;
};
