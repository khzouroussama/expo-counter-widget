import { readFile, reloadWidgets, writeFile } from 'modules:widget';
import React from 'react';

export interface SharedData {
  count: number;
  updatedAt: String | null;
}

export const useSharedData = () => {
  const [data, setData] = React.useState<SharedData>({ count: 0, updatedAt: null });
  const DATA_FILE_PATH = 'data.json';

  async function readData() {
    try {
      // const fileInfo = await FileSystem.getInfoAsync(DATA_FILE_PATH);
      // if (!fileInfo.exists) {
      //   return { count: 0, updatedAt: null };
      // }
      const dataString = readFile(DATA_FILE_PATH);
      console.log('Data read:', dataString);
      return JSON.parse(dataString);
    } catch (error) {
      console.error('Error reading data:', error);
      return { count: 0, updatedAt: null };
    }
  }

  async function writeData(data: SharedData) {
    try {
      const dataString = JSON.stringify(data);
      console.log('Data write:', dataString, DATA_FILE_PATH);
      writeFile(DATA_FILE_PATH, dataString);
    } catch (error) {
      console.error('Error writing data:', error);
    }
  }

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
