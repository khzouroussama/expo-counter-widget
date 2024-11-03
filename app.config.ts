
import type { ConfigContext, ExpoConfig } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const newConfig = { ...config };

  return newConfig as ExpoConfig;
};
