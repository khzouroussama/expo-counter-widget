import {
  getContainerUrl,
  readAsStringAsync,
  reloadWidgets,
  writeAsStringAsync,
} from 'modules:widget';
import React from 'react';
import { useInterval } from './useInterval';

const DATA_FILE_NAME = 'data.json';

export interface SharedData {
  count: number;
  updatedAt: string | null;
}

export const useSharedData = () => {
  const [data, setData] = React.useState<SharedData>({ count: 0, updatedAt: null });
  const sharedFilePatch = getContainerUrl() + DATA_FILE_NAME;

  async function readData() {
    try {
      const dataString = await readAsStringAsync(sharedFilePatch);
      return JSON.parse(dataString);
    } catch (error) {
      console.error('Error reading data:', error);
      return { count: 0, updatedAt: null };
    }
  }

  async function writeData(data: SharedData) {
    try {
      const jsonData = JSON.stringify(data);
      writeAsStringAsync(sharedFilePatch, jsonData);
    } catch (error) {
      console.error('Error writing data:', error);
    }
  }

  useInterval(async () => {
    const data = await readData();
    setData({ count: data.count || 0, updatedAt: data.updatedAt || null });
  }, 1000);

  React.useEffect(() => {
    (async () => {
      const data = await readData();
      setData({ count: data.count || 0, updatedAt: data.updatedAt || null });
    })();
  }, []);

  const set = React.useCallback(
    (updater: (prev: SharedData) => SharedData) => {
      setData((prev) => {
        const next = updater(prev);
        writeData(next);
        reloadWidgets();
        return next;
      });
    },
    [setData],
  );

  return [data, set] as const;
};
