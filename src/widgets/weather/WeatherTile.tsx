import { Center, Group, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconArrowDownRight, IconArrowUpRight, IconCloudRain } from '@tabler/icons-react';
import { z } from 'zod';
import { createWidgetComponent, defineWidget, widgetOption } from '../common/definition';
import { WeatherIcon } from './WeatherIcon';
import { useWeatherForCity } from './useWeatherForCity';

const definition = defineWidget({
  sort: 'weather',
  icon: IconCloudRain,
  options: {
    displayInFahrenheit: widgetOption.switch(z.boolean(), {
      defaultValue: false,
    }),
    location: widgetOption.text(z.string(), {
      defaultValue: 'Paris',
      nullable: false,
    }),
  },
  gridstack: {
    minWidth: 1,
    minHeight: 1,
    maxWidth: 12,
    maxHeight: 12,
  },
});

const WeatherWidget = createWidgetComponent(definition, ({ options }) => {
  const { data: weather, isLoading, isError } = useWeatherForCity(options.location);
  const { width, ref } = useElementSize();

  if (isLoading) {
    return (
      <Stack
        ref={ref}
        spacing="xs"
        justify="space-around"
        align="center"
        style={{ height: '100%', width: '100%' }}
      >
        <Skeleton height={40} width={100} mb="xl" />
        <Group noWrap>
          <Skeleton height={50} circle />
          <Group>
            <Skeleton height={25} width={70} mr="lg" />
            <Skeleton height={25} width={70} />
          </Group>
        </Group>
      </Stack>
    );
  }

  if (isError) {
    return (
      <Center>
        <Text weight={500}>An error occured</Text>
      </Center>
    );
  }

  // TODO: add widgetWrapper that is generic and uses the definition
  return (
    <Stack
      ref={ref}
      spacing="xs"
      justify="space-around"
      align="center"
      style={{ height: '100%', width: '100%' }}
    >
      <Group align="center" position="center" spacing="xs">
        <WeatherIcon code={weather!.current_weather.weathercode} />
        <Title>
          {getPerferedUnit(weather!.current_weather.temperature, options.displayInFahrenheit)}
        </Title>
      </Group>
      {width > 200 && (
        <Group noWrap spacing="xs">
          <IconArrowUpRight />
          {getPerferedUnit(weather!.daily.temperature_2m_max[0], options.displayInFahrenheit)}
          <IconArrowDownRight />
          {getPerferedUnit(weather!.daily.temperature_2m_min[0], options.displayInFahrenheit)}
        </Group>
      )}
    </Stack>
  );
});

const getPerferedUnit = (value: number, isFahrenheit = false): string =>
  isFahrenheit ? `${(value * (9 / 5) + 32).toFixed(1)}°F` : `${value.toFixed(1)}°C`;

export default WeatherWidget;
