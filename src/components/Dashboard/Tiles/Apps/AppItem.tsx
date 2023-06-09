import { useAppItemContext } from '../context';
import { AppTile } from './AppTile';

export const AppItemCard = () => {
  const app = useAppItemContext();

  return <AppTile app={app} className="grid-stack-item-content" />;
};
