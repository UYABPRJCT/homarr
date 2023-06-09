import { ComponentType } from 'react';
import { WidgetItem } from '~/components/Dashboard/types';
import Widgets from '.';
import { HomarrCardWrapper } from '../components/Dashboard/Tiles/HomarrCardWrapper';
import { WidgetsMenu } from '../components/Dashboard/Tiles/Widgets/WidgetsMenu';
import ErrorBoundary from './boundary';

interface WidgetWrapperProps {
  widgetSort: string;
  widget: WidgetItem;
  className: string;
  WidgetComponent: ComponentType<{ widget: WidgetItem }>;
}

// If a property has no value, set it to the default value
const useWidget = <T extends WidgetItem>(widget: T): T => {
  const definition = Widgets[widget.sort as keyof typeof Widgets];

  const newProps = { ...widget.options };

  Object.entries(definition.options).forEach(([key, property]) => {
    if (newProps[key] == null) {
      newProps[key] = property.defaultValue;
    }
  });

  return {
    ...widget,
    options: newProps,
  };
};

export const WidgetWrapper = ({
  widgetSort,
  widget,
  className,
  WidgetComponent,
}: WidgetWrapperProps) => {
  const widgetWithDefaultProps = useWidget(widget);
  return (
    <ErrorBoundary>
      <HomarrCardWrapper className={className}>
        <WidgetsMenu integration={widgetSort} widget={widgetWithDefaultProps} />
        <WidgetComponent widget={widgetWithDefaultProps} />
      </HomarrCardWrapper>
    </ErrorBoundary>
  );
};
