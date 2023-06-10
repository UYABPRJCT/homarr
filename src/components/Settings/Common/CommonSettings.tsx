import { ScrollArea, Space, Stack } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { useDashboard } from '~/pages';
import { CacheButtons } from './CacheButtons';
import ConfigActions from './Config/ConfigActions';
import LanguageSelect from './Language/LanguageSelect';

export default function CommonSettings() {
  const dashboard = useDashboard();
  const { height, width } = useViewportSize();

  return (
    <ScrollArea style={{ height: height - 100 }} scrollbarSize={5}>
      <Stack>
        {/* TODO: Search engine is now defined for each user <SearchEngineSelector searchEngine={} /> */}
        <Space />
        <LanguageSelect />
        <CacheButtons />
        <ConfigActions />
      </Stack>
    </ScrollArea>
  );
}
