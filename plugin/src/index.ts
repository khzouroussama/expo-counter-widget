import { ConfigPlugin } from "@expo/config-plugins"
import { withWidgetAndroid } from "./with-widget-android"
import { withWidgetIos } from "./with-widget-ios"

export interface WithWidgetProps {
  teamID: string
}

const withAppConfigs: ConfigPlugin<WithWidgetProps> = (config, options) => {
  config = withWidgetAndroid(config)
  config = withWidgetIos(config, options)
  return config
}

export default withAppConfigs
