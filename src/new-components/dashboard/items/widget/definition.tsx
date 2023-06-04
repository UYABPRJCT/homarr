import { TablerIcon } from '@tabler/icons';
import { useMemo } from 'react';
import { z } from 'zod';
import { WidgetWrapper } from './widget-wrapper';

export const switchOption = <T extends boolean>(
  schema: z.ZodType<T>,
  options: {
    defaultValue: T;
  }
) =>
  ({
    type: 'switch',
    zod: schema,
    options,
  } as const);

export const textOption = <T extends string, TNullable extends boolean>(
  schema: z.ZodType<T>,
  options: {
    defaultValue: TNullable extends true ? T | null : T;
    nullable: TNullable;
  }
) =>
  ({
    type: 'text',
    zod: schema,
    options,
  } as const);

const multiSelectOption = <T extends [string, ...string[]]>(
  schema: z.ZodEnum<T>,
  options: {
    defaultValue: T[number][];
  }
) =>
  ({
    type: 'multiSelect',
    zod: schema,
    options,
  } as const);

const multipleTextOption = <T extends string[]>(
  schema: z.ZodArray<z.ZodType<T[number]>>,
  options: {
    defaultValue: T;
  }
) =>
  ({
    type: 'multipleText',
    zod: schema,
    options,
  } as const);

const selectOption = <T extends [string, ...string[]], TNullable extends boolean>(
  schema: z.ZodEnum<T>,
  options: {
    defaultValue: TNullable extends true ? T[number] | null : T[number];
    nullable: TNullable;
  }
) =>
  ({
    type: 'select',
    zod: schema,
    options,
  } as const);

const numberOption = <T extends number>(
  schema: z.ZodType<T>,
  options: {
    defaultValue: T;
    stepHoldDelay?: number;
    stepHoldInterval?: number;
  }
) =>
  ({
    type: 'number',
    zod: schema,
    options,
  } as const);

const sliderOption = <T extends number>(
  schema: z.ZodType<T>,
  options: {
    defaultValue: T;
  }
) =>
  ({
    type: 'slider',
    zod: schema,
    options,
  } as const);

type StaticDraggableListItems<TKey extends string> = Record<TKey, Record<string, OptionReturnType>>;

const staticDraggableListOption = <
  TKey extends string,
  TItems extends StaticDraggableListItems<TKey>
>(
  items: TItems,
  options: {
    defaultValue: TKey[];
  }
) => {
  // TODO: construct schema from items
  const schemas: z.ZodObject<any>[] = [];
  Object.entries(items).forEach(([key, value]: [string, any]) => {
    const subValues = Object.entries(value)
      .map(([subKey, subValue]: [string, any]) => ({ [subKey]: subValue.zod }))
      .reduce((prev, curr) => ({ ...prev, ...curr }), {});

    schemas.push(
      z.object({
        key: z.literal(key),
        subValues: z.object(subValues),
      })
    );
  });

  let finalSchema = schemas[0]!;
  for (let i = 1; i < schemas.length; i += 1) {
    finalSchema = finalSchema.or(schemas[i]!) as any;
  }

  const schema = z.array(finalSchema) as unknown as z.ZodType<inferOptionsType<TItems>>;

  return {
    type: 'static-draggable-list',
    zod: schema,
    items,
    options,
  } as const;
};

staticDraggableListOption(
  {
    storage: {
      enabled: switchOption(z.boolean(), { defaultValue: true }),
      compactView: switchOption(z.boolean(), { defaultValue: true }),
      span: numberOption(z.number().min(1).max(2), { defaultValue: 2 }),
      multiView: switchOption(z.boolean(), { defaultValue: false }),
    },
    network: {
      enabled: switchOption(z.boolean(), { defaultValue: true }),
      compactView: switchOption(z.boolean(), { defaultValue: true }),
      span: numberOption(z.number().min(1).max(2), { defaultValue: 2 }),
    },
    cpu: {
      enabled: switchOption(z.boolean(), { defaultValue: true }),
      multiView: switchOption(z.boolean(), { defaultValue: false }),
      span: numberOption(z.number().min(1).max(2), { defaultValue: 1 }),
    },
    ram: {
      enabled: switchOption(z.boolean(), { defaultValue: true }),
      span: numberOption(z.number().min(1).max(2), { defaultValue: 1 }),
    },
    gpu: {
      enabled: switchOption(z.boolean(), { defaultValue: false }),
      span: numberOption(z.number().min(1).max(2), { defaultValue: 1 }),
    },
  },
  {
    defaultValue: ['storage', 'network', 'cpu', 'ram', 'gpu'],
  }
);

/*const i = {
  storage: {
    enabled: switchOption(z.boolean(), { defaultValue: true }),
    compactView: switchOption(z.boolean(), { defaultValue: true }),
    span: numberOption(z.number().min(1).max(2), { defaultValue: 2 }),
    multiView: switchOption(z.boolean(), { defaultValue: false }),
  },
  network: {
    enabled: switchOption(z.boolean(), { defaultValue: true }),
    compactView: switchOption(z.boolean(), { defaultValue: true }),
    span: numberOption(z.number().min(1).max(2), { defaultValue: 2 }),
  },
  cpu: {
    enabled: switchOption(z.boolean(), { defaultValue: true }),
    multiView: switchOption(z.boolean(), { defaultValue: false }),
    span: numberOption(z.number().min(1).max(2), { defaultValue: 1 }),
  },
  ram: {
    enabled: switchOption(z.boolean(), { defaultValue: true }),
    span: numberOption(z.number().min(1).max(2), { defaultValue: 1 }),
  },
  gpu: {
    enabled: switchOption(z.boolean(), { defaultValue: false }),
    span: numberOption(z.number().min(1).max(2), { defaultValue: 1 }),
  },
};
*/
type inferOptionsType<T extends StaticDraggableListItems<string>> = {
  [K in keyof T]: {
    key: K;
    subValues: {
      [K2 in keyof T[K]]: T[K][K2] extends OptionReturnType ? z.infer<T[K][K2]['zod']> : never;
    };
  };
}[keyof T][];
/*
type Another5 = inferOptionsType<typeof i>;

const j: Another5 = [];
*/
type OptionFunctionType =
  | typeof sliderOption
  | typeof numberOption
  | typeof selectOption
  | typeof multipleTextOption
  | typeof multiSelectOption
  | typeof textOption
  | typeof switchOption;

type RootOptionFunctionType = OptionFunctionType | typeof staticDraggableListOption;

type OptionReturnType = ReturnType<OptionFunctionType>;

type RootOptionReturnType = ReturnType<RootOptionFunctionType>;

type IconUrl = string;

export type OptionDefinition = Record<string, RootOptionReturnType>;

export type WidgetDefinition<TSort extends string, TOptions extends OptionDefinition> = {
  sort: TSort;
  icon: IconUrl | TablerIcon;
  options: TOptions;
  gridstack: {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
  };
};

export const widgetOption = {
  switch: switchOption,
  text: textOption,
  multiSelect: multiSelectOption,
  multipleText: multipleTextOption,
  select: selectOption,
  number: numberOption,
  slider: sliderOption,
  staticDraggableList: staticDraggableListOption,
};

export type AnyWidgetOptions = inferOptionsFromDefinition<
  WidgetDefinition<string, OptionDefinition>
>;

export const defineWidget = <
  TSort extends string,
  TOptions extends OptionDefinition,
  TWidgetDefinition extends WidgetDefinition<TSort, TOptions>
>(
  options: TWidgetDefinition
) => options;

export type inferOptionsFromDefinition<
  TDefinition extends WidgetDefinition<string, OptionDefinition>
> = {
  [K in keyof TDefinition['options']]: z.infer<TDefinition['options'][K]['zod']>;
};

export type WidgetComponent<TDefinition extends WidgetDefinition<string, OptionDefinition>> =
  (props: { options: inferOptionsFromDefinition<TDefinition> }) => JSX.Element | null;

export const createWidgetComponent =
  <TDefinition extends WidgetDefinition<string, OptionDefinition>>(
    definition: TDefinition,
    componentFn: WidgetComponent<TDefinition>
  ): WidgetComponent<TDefinition> =>
  ({ options }) => {
    const Component = componentFn;

    const widgetOptions = useMemo(() => {
      const newProps = { ...options };

      Object.entries(definition.options).forEach(([key]) => {
        if (newProps[key as keyof typeof newProps] == null) {
          newProps[key as keyof typeof newProps] = definition.options[key].options
            .defaultValue as unknown as any;
        }
      });
      return newProps;
    }, [definition.options, options]);

    return (
      <WidgetWrapper options={widgetOptions} definition={definition}>
        <Component options={widgetOptions} />
      </WidgetWrapper>
    );
  };
