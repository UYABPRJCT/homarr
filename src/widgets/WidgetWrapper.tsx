import Widgets from '.';
import { HomarrCardWrapper } from '../components/Dashboard/Tiles/HomarrCardWrapper';
import { WidgetsMenu } from '../components/Dashboard/Tiles/Widgets/WidgetsMenu';
import ErrorBoundary from './boundary';
import { IWidget } from './widgets';
import { useWidgetItemContext } from '~/new-components/dashboard/items/context';

interface WidgetWrapperProps {
  className: string;
}

export const WidgetItem = ({ className }: WidgetWrapperProps) => {
  const { item: widget } = useWidgetItemContext();

  if (!widget) return null;
  const WidgetComponent = Widgets[widget.type as keyof typeof Widgets];

  return (
    <ErrorBoundary>
      <HomarrCardWrapper className="grid-stack-item-content">
        <WidgetsMenu integration={widget.sort} />
        <WidgetComponent />
      </HomarrCardWrapper>
    </ErrorBoundary>
  );
};
