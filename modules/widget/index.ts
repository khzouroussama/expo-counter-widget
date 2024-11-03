import WidgetModule from './src/WidgetModule';

export function setData(
  key: string,
  value: number,
  group: string = 'group.com.learn.counterwidget',
): string {
  return WidgetModule.setData(key, value, group);
}

export function getData(
  key: string,
  group: string = 'group.com.learn.counterwidget',
): number {
  return WidgetModule.getData(key, group);
}

export function getAppGroupContainerUrl(): string {
  return WidgetModule.getAppGroupContainerUrl();
}

export function readFile(file: string): string {
  return WidgetModule.readFile(file);
}

export function writeFile(file: string, content: string): number {
  return WidgetModule.writeFile(file, content);
}

export function reloadWidgets(): number {
  return WidgetModule.reloadWidgets();
}
