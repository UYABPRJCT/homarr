import { useMantineTheme } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { IconCalendarTime } from '@tabler/icons';
import { i18n } from 'next-i18next';
import { useState } from 'react';
import { z } from 'zod';
import { useDashboardContext } from '~/new-components/dashboard/context';
import { useGroupContext } from '~/new-components/dashboard/groups/context';
import { useWidgetItemContext } from '~/new-components/dashboard/items/context';
import {
  createWidgetComponent,
  defineWidget,
  widgetOption,
} from '~/new-components/dashboard/items/widget/definition';
import { constructClientSecretChangesForIntegrations } from '~/server/api/helpers/apps';
import { mediaIntegrationTypes } from '~/server/api/helpers/integrations';
import { api } from '~/utils/api';
import { CalendarDay } from './CalendarDay';
import { getBgColorByDateAndTheme } from './bg-calculator';
import { MediasType } from './type';

const definition = defineWidget({
  sort: 'calendar',
  icon: IconCalendarTime,
  options: {
    useSonarrv4: widgetOption.switch(z.boolean(), {
      defaultValue: false,
    }),
    sundayStart: widgetOption.switch(z.boolean(), {
      defaultValue: false,
    }),
    radarrReleaseType: widgetOption.select(
      z.enum(['inCinemas', 'physicalRelease', 'digitalRelease']),
      {
        defaultValue: 'inCinemas',
        nullable: false,
      }
    ),
  },
  gridstack: {
    minWidth: 2,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
});

const CalendarWidget = createWidgetComponent(definition, ({ options }) => {
  const dashboard = useDashboardContext();
  const { group } = useGroupContext();
  const { item } = useWidgetItemContext();
  const { colorScheme } = useMantineTheme();
  const [month, setMonth] = useState(new Date());

  const apps = constructClientSecretChangesForIntegrations(
    group?.items.filter((x) => x.type === 'app') ?? [],
    mediaIntegrationTypes
  );

  const { data: medias } = api.calendar.medias.useQuery(
    {
      month: month.getMonth(),
      year: month.getFullYear(),
      apps,
      configName: 'configName',
      options: {
        useSonarrv4: options.useSonarrv4,
      },
    },
    {
      enabled: apps.length >= 1,
      staleTime: 1000 * 60 * 60 * 5,
    }
  );

  return (
    <Calendar
      defaultDate={new Date()}
      onPreviousMonth={setMonth}
      onNextMonth={setMonth}
      size="xs"
      locale={i18n?.resolvedLanguage ?? 'en'}
      firstDayOfWeek={options.sundayStart ? 0 : 1}
      hideWeekdays
      style={{ position: 'relative', top: -10 }}
      date={month}
      maxLevel="month"
      hasNextLevel={false}
      styles={{
        calendarHeader: {
          maxWidth: 'inherit',
        },
        calendar: {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        },
        monthLevelGroup: {
          height: '100%',
        },
        monthLevel: {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        },
        month: {
          flex: 1,
        },
      }}
      getDayProps={(date) => ({
        bg: getBgColorByDateAndTheme(colorScheme, date),
      })}
      renderDay={(date) => (
        <CalendarDay date={date} medias={getReleasedMediasForDate(medias, date, item)} />
      )}
    />
  );
});

const getReleasedMediasForDate = (
  medias: MediasType | undefined,
  date: Date,
  widget: ICalendarWidget
): MediasType => {
  const { radarrReleaseType } = widget.properties;

  const books =
    medias?.books.filter((b) => new Date(b.releaseDate).toDateString() === date.toDateString()) ??
    [];
  const movies =
    medias?.movies.filter(
      (m) => new Date(m[radarrReleaseType]).toDateString() === date.toDateString()
    ) ?? [];
  const musics =
    medias?.musics.filter((m) => new Date(m.releaseDate).toDateString() === date.toDateString()) ??
    [];
  const tvShows =
    medias?.tvShows.filter(
      (tv) => new Date(tv.airDateUtc).toDateString() === date.toDateString()
    ) ?? [];
  const totalCount = medias ? books.length + movies.length + musics.length + tvShows.length : 0;

  return {
    books,
    movies,
    musics,
    tvShows,
    totalCount,
  };
};

export default CalendarWidget;
