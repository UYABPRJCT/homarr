import { GridStack } from 'fily-publish-gridstack';
import { MutableRefObject, createContext, useContext } from 'react';

type GridStackContextType = {
  gridstack: MutableRefObject<GridStack | undefined> | null;
};

const GridstackContext = createContext<GridStackContextType>({ gridstack: null });

export const useGridstackContext = () => useContext(GridstackContext);

export const GridstackProvider = GridstackContext.Provider;
