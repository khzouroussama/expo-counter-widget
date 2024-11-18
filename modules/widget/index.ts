import WidgetModule from './src/WidgetModule';

export function getContainerUrl(): string {
  return WidgetModule.getContainerUrl();
}

export async function readAsStringAsync(file: string): Promise<string> {
  return WidgetModule.readAsStringAsync(file);
}

export async function writeAsStringAsync(
  file: string,
  content: string,
): Promise<void> {
  return WidgetModule.writeAsStringAsync(file, content);
}

export function reloadWidgets(): void {
  return WidgetModule.reloadWidgets();
}
