import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to Widget.web.ts
// and on native platforms to Widget.ts
import WidgetModule from './src/WidgetModule';
import WidgetView from './src/WidgetView';
import { ChangeEventPayload, WidgetViewProps } from './src/Widget.types';

// Get the native constant value.
export const PI = WidgetModule.PI;

export function hello(): string {
  return WidgetModule.hello();
}

export async function setValueAsync(value: string) {
  return await WidgetModule.setValueAsync(value);
}

const emitter = new EventEmitter(WidgetModule ?? NativeModulesProxy.Widget);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { WidgetView, WidgetViewProps, ChangeEventPayload };
