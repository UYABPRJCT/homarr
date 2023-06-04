import { PropsWithChildren } from 'react';
import { HomarrCardWrapper } from '~/components/Dashboard/Tiles/HomarrCardWrapper';
import { useWidgetItemContext } from '~/new-components/dashboard/items/context';
import ErrorBoundary from '~/widgets/boundary';
import { AnyWidgetOptions, OptionDefinition, WidgetDefinition } from './definition';
import { WidgetMenu } from './widget-menu';

type WidgetItemProps = PropsWithChildren<{
  options: AnyWidgetOptions;
  definition: WidgetDefinition<string, OptionDefinition>;
}>;

export const WidgetWrapper = ({ children, options, definition }: WidgetItemProps) => {
  const { item: widget } = useWidgetItemContext();

  if (!widget) return null;

  return (
    <ErrorBoundary>
      <HomarrCardWrapper className="grid-stack-item-content">
        <WidgetMenu options={options} definition={definition} />
        {children}
      </HomarrCardWrapper>
    </ErrorBoundary>
  );
};
