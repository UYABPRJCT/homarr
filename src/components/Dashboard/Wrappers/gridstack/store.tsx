import { create } from 'zustand';
import { useConfigContext } from '../../../../config/provider';
import { GridstackBreakpoints } from '../../../../constants/gridstack-breakpoints';
import { useDashboard } from '~/pages';

export const useGridstackStore = create<GridstackStoreType>((set, get) => ({
  mainAreaWidth: null,
  currentShapeSize: null,
  setMainAreaWidth: (w: number) =>
    set((v) => ({ ...v, mainAreaWidth: w, currentShapeSize: getCurrentShapeSize(w) })),
}));

interface GridstackStoreType {
  mainAreaWidth: null | number;
  currentShapeSize: null | 'sm' | 'md' | 'lg';
  setMainAreaWidth: (width: number) => void;
}

export const useNamedWrapperColumnCount = (): 'small' | 'medium' | 'large' | null => {
  const mainAreaWidth = useGridstackStore((x) => x.mainAreaWidth);
  if (!mainAreaWidth) return null;

  if (mainAreaWidth >= 1400) return 'large';

  if (mainAreaWidth >= 800) return 'medium';

  return 'small';
};

export const useWrapperColumnCount = () => {
  const dashboard = useDashboard();

  if (!dashboard) {
    return null;
  }

  switch (useNamedWrapperColumnCount()) {
    case 'large':
      return 12; // TODO: add column count customization
    case 'medium':
      return 6; // TODO: add column count customization
    case 'small':
      return 3; // TODO: add column count customization
    default:
      return null;
  }
};

function getCurrentShapeSize(size: number) {
  return size >= GridstackBreakpoints.large
    ? 'lg'
    : size >= GridstackBreakpoints.medium
    ? 'md'
    : 'sm';
}
