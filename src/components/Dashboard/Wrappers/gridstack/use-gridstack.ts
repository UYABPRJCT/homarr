import { GridStack, GridStackNode } from 'fily-publish-gridstack';
import { MutableRefObject, RefObject, createRef, useEffect, useMemo, useRef } from 'react';
import { useDashboard } from '~/pages';
import { useEditModeStore } from '../../Views/useEditModeStore';
import { useDashboardStore } from '../../store';
import { Item, ItemGroup } from '../../types';
import { TileWithUnknownLocation, initializeGridstack } from './init-gridstack';
import { useGridstackStore, useWrapperColumnCount } from './store';

interface UseGristackReturnType {
  items: Item[];
  refs: {
    wrapper: RefObject<HTMLDivElement>;
    items: MutableRefObject<Record<string, RefObject<HTMLDivElement>>>;
    gridstack: MutableRefObject<GridStack | undefined>;
  };
}

export const useGridstack = (
  groupType: ItemGroup['type'],
  groupId: string
): UseGristackReturnType => {
  const isEditMode = useEditModeStore((x) => x.enabled);
  //const { config, configVersion, name: configName } = useConfigContext();
  const dashboard = useDashboard();
  const save = useDashboardStore((x) => x.save);
  // define reference for wrapper - is used to calculate the width of the wrapper
  const wrapperRef = useRef<HTMLDivElement>(null);
  // references to the diffrent items contained in the gridstack
  const itemRefs = useRef<Record<string, RefObject<HTMLDivElement>>>({});
  // reference of the gridstack object for modifications after initialization
  const gridRef = useRef<GridStack>();
  const wrapperColumnCount = useWrapperColumnCount();
  const shapeSize = useGridstackStore((x) => x.currentShapeSize);
  const mainAreaWidth = useGridstackStore((x) => x.mainAreaWidth);
  // width of the wrapper (updating on page resize)
  const root: HTMLHtmlElement = useMemo(() => document.querySelector(':root')!, []);

  if (!mainAreaWidth || !shapeSize || !wrapperColumnCount) {
    throw new Error('UseGridstack should not be executed before mainAreaWidth has been set!');
  }

  const items = useMemo(
    () =>
      dashboard.groups.find((group) => group.type === groupType && group.id === groupId)?.items ??
      [],
    [dashboard.groups]
  );

  // define items in itemRefs for easy access and reference to items
  if (Object.keys(itemRefs.current).length !== items.length) {
    items.forEach(({ id }: { id: keyof typeof itemRefs.current }) => {
      itemRefs.current[id] = itemRefs.current[id] || createRef();
    });
  }

  useEffect(() => {
    if (groupType === 'sidebar') return;
    const widgetWidth = mainAreaWidth / wrapperColumnCount;
    // widget width is used to define sizes of gridstack items within global.scss
    root.style.setProperty('--gridstack-widget-width', widgetWidth.toString());
    gridRef.current?.cellHeight(widgetWidth);
  }, [mainAreaWidth, wrapperColumnCount, gridRef.current]);

  useEffect(() => {
    // column count is used to define count of columns of gridstack within global.scss
    root.style.setProperty('--gridstack-column-count', wrapperColumnCount.toString());
  }, [wrapperColumnCount]);

  const onChange = isEditMode
    ? (changedNode: GridStackNode) => {
        const itemType = changedNode.el?.getAttribute('data-type');
        const itemId = changedNode.el?.getAttribute('data-id');
        if (!itemType || !itemId) return;

        // Updates the config and defines the new position of the item
        save((dashboard) => ({
          ...dashboard,
          groups: dashboard.groups.map((group) => ({
            ...group,
            items: group.items.map((item) =>
              itemId === item.id
                ? {
                    ...item,
                    positionX: changedNode.x!,
                    positionY: changedNode.y!,
                    width: changedNode.w!,
                    height: changedNode.h!,
                  }
                : item
            ),
          })),
        }));
      }
    : () => {};

  const onAdd = isEditMode
    ? (addedNode: GridStackNode) => {
        const itemType = addedNode.el?.getAttribute('data-type');
        const itemId = addedNode.el?.getAttribute('data-id');
        if (!itemType || !itemId) return;
        if (items.find((x) => x.id === itemId)) return;

        // Updates the config and defines the new position and wrapper of the ite
        save((dashboard) => {
          const previousItem = dashboard.groups
            .flatMap((group) => group.items)
            .find((x) => x.id === itemId);

          if (!previousItem) return dashboard;
          return {
            ...dashboard,
            groups: dashboard.groups.map((group) =>
              group.id === groupId
                ? {
                    ...group,
                    items: group.items.concat({
                      ...previousItem,
                      positionX: addedNode.x!,
                      positionY: addedNode.y!,
                      width: addedNode.w!,
                      height: addedNode.h!,
                      groupId,
                    }),
                  }
                : {
                    ...group,
                    items: group.items.filter((item) => item.id !== itemId),
                  }
            ),
          };
        });
      }
    : () => {};

  // initialize the gridstack
  useEffect(() => {
    const removeEventHandlers = () => {
      gridRef.current?.off('change');
      gridRef.current?.off('added');
    };

    const tilesWithUnknownLocation: TileWithUnknownLocation[] = [];
    initializeGridstack(
      groupType,
      wrapperRef,
      gridRef,
      itemRefs,
      groupId,
      items,
      isEditMode,
      wrapperColumnCount,
      shapeSize,
      tilesWithUnknownLocation,
      {
        onChange,
        onAdd,
      }
    );
    //if (!configName) return removeEventHandlers;
    /*updateConfig(configName, (prev) => ({
      ...prev,
      apps: prev.apps.map((app) => {
        const currentUnknownLocation = tilesWithUnknownLocation.find(
          (x) => x.type === 'app' && x.id === app.id
        );
        if (!currentUnknownLocation) return app;

        return {
          ...app,
          shape: {
            ...app.shape,
            [shapeSize]: {
              location: {
                x: currentUnknownLocation.x,
                y: currentUnknownLocation.y,
              },
              size: {
                width: currentUnknownLocation.w,
                height: currentUnknownLocation.h,
              },
            },
          },
        };
      }),
      widgets: prev.widgets.map((widget) => {
        const currentUnknownLocation = tilesWithUnknownLocation.find(
          (x) => x.type === 'widget' && x.id === widget.id
        );
        if (!currentUnknownLocation) return widget;

        return {
          ...widget,
          shape: {
            ...widget.shape,
            [shapeSize]: {
              location: {
                x: currentUnknownLocation.x,
                y: currentUnknownLocation.y,
              },
              size: {
                width: currentUnknownLocation.w,
                height: currentUnknownLocation.h,
              },
            },
          },
        };
      }),
    }));*/
    return removeEventHandlers;
  }, [items, wrapperRef.current, wrapperColumnCount]);

  return {
    items,
    refs: {
      items: itemRefs,
      wrapper: wrapperRef,
      gridstack: gridRef,
    },
  };
};
