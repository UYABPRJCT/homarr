import Consola from 'consola';
import WidgetComponents from '~/widgets';
import { useWidgetItemContext } from './context';
import { WidgetComponent } from './widget/definition';

export const WidgetItem = () => {
  const { item: widget } = useWidgetItemContext();

  if (!widget) return null;

  const Component = WidgetComponents[
    widget.sort as keyof typeof WidgetComponents
  ] as WidgetComponent<any>;

  if (!Component) {
    Consola.error(`Widget "${widget.sort}" has no component. Please check your widget definition.`);
    return null;
  }

  return <Component options={widget.options} />;
};
