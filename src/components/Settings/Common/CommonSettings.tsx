import { ScrollArea, Space, Stack, Text } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { useConfigContext } from '../../../config/provider';
import ConfigChanger from '../../Config/ConfigChanger';
import ConfigActions from './Config/ConfigActions';
import LanguageSelect from './Language/LanguageSelect';
import { SearchEngineSelector } from './SearchEngine/SearchEngineSelector';
import { useDashboard } from '~/pages';
import { CacheButtons } from './CacheButtons';

export default function CommonSettings() {
  const dashboard = useDashboard();
  const { height, width } = useViewportSize();

  return (
    <ScrollArea style={{ height: height - 100 }} scrollbarSize={5}>
      <Stack>
        {/* TODO: Search engine is now defined for each user <SearchEngineSelector searchEngine={} /> */}
        <Space />
        <LanguageSelect />
        <ConfigChanger />
        <CacheButtons />
        <ConfigActions />
      </Stack>
    </ScrollArea>
  );
}
