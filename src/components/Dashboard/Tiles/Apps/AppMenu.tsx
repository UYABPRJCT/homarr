import { openContextModalGeneric } from '../../../../tools/mantineModalManagerExtensions';
import { AppType } from '../../../../types/app';
import { AppItem } from '../../types';
import { GenericTileMenu } from '../GenericTileMenu';

interface TileMenuProps {
  app: AppItem;
}

export const AppMenu = ({ app }: TileMenuProps) => {
  const handleClickEdit = () => {
    openContextModalGeneric<{ app: AppType; allowAppNamePropagation: boolean }>({
      modal: 'editApp',
      size: 'xl',
      innerProps: {
        app,
        allowAppNamePropagation: false,
      },
      styles: {
        root: {
          zIndex: 201,
        },
      },
    });
  };

  const handleClickChangePosition = () => {
    openContextModalGeneric({
      modal: 'changeAppPositionModal',
      innerProps: {
        app,
      },
      styles: {
        root: {
          zIndex: 201,
        },
      },
    });
  };

  const handleClickDelete = () => {
    if (configName === undefined) {
      return;
    }

    updateConfig(configName, (previousConfig) => ({
      ...previousConfig,
      apps: previousConfig.apps.filter((a) => a.id !== app.id),
    }));
  };

  return (
    <GenericTileMenu
      handleClickEdit={handleClickEdit}
      handleClickChangePosition={handleClickChangePosition}
      handleClickDelete={handleClickDelete}
      displayEdit
    />
  );
};
