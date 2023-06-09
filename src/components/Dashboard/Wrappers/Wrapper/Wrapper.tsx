import { WrapperGroup } from '../../types';
import { useEditModeStore } from '../../Views/useEditModeStore';
import { useGridstack } from '../gridstack/use-gridstack';
import { WrapperContent } from '../WrapperContent';

interface DashboardWrapperProps {
  wrapper: WrapperGroup;
}

export const DashboardWrapper = ({ wrapper }: DashboardWrapperProps) => {
  const { refs, items } = useGridstack('wrapper', wrapper.id);
  const isEditMode = useEditModeStore((x) => x.enabled);
  const defaultClasses = 'grid-stack grid-stack-wrapper min-row';

  return (
    <div
      className={
        items.length > 0 || isEditMode
          ? defaultClasses
          : `${defaultClasses} gridstack-empty-wrapper`
      }
      style={{ transitionDuration: '0s' }}
      data-wrapper={wrapper.id}
      ref={refs.wrapper}
    >
      <WrapperContent items={items} refs={refs} />
    </div>
  );
};
