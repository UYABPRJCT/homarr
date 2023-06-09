import { PropsWithChildren } from 'react';
import { HomarrCardWrapper } from '~/components/Dashboard/Tiles/HomarrCardWrapper';
import ErrorBoundary from '~/widgets/boundary';
import { AnyWidgetOptions, OptionDefinition, WidgetDefinition } from './definition';
import { useWidgetItemContext } from '~/components/Dashboard/Tiles/context';

type WidgetItemProps = PropsWithChildren<{
  options: AnyWidgetOptions;
  definition: WidgetDefinition<string, OptionDefinition>;
}>;

export const WidgetWrapper = ({ children, options, definition }: WidgetItemProps) => {
  const widget = useWidgetItemContext();

  if (!widget) return null;

  return (
    <ErrorBoundary>
      <HomarrCardWrapper className="grid-stack-item-content">
        {/*<WidgetMenu options={options} definition={definition} />*/}
        {children}
      </HomarrCardWrapper>
    </ErrorBoundary>
  );
};
