/* eslint-disable react/no-unknown-property */

import { GridStack } from 'fily-publish-gridstack';
import { MutableRefObject, RefObject } from 'react';
import { useGroupContext } from './context';
import { ItemProvider } from '../items/context';
import { GridStackItemWrapper } from '../items/grid-stack-item-wrapper';
import { AppItem } from '../items/app-item';
import { WidgetItem } from '../items/widget-item';
import { GridstackProvider } from '../gridstack/context';

type GroupContentProps = {
  gridRef: MutableRefObject<GridStack | undefined>;
};

export const GroupContent = ({ gridRef }: GroupContentProps) => {
  const { group } = useGroupContext();

  if (!group) return null;

  return (
    <GridstackProvider value={{ gridstack: gridRef }}>
      {group.items.map((item) => (
        <ItemProvider
          key={item.id}
          value={{
            item,
          }}
        >
          <GridStackItemWrapper>
            {item.type === 'app' ? <AppItem /> : <WidgetItem />}
          </GridStackItemWrapper>
        </ItemProvider>
      ))}
    </GridstackProvider>
  );
};
