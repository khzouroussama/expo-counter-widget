import {
  ConfigPlugin,
  withDangerousMod,
  withProjectBuildGradle,
  withAppBuildGradle,
  withAndroidManifest,
  AndroidConfig
} from "@expo/config-plugins"
import * as fs from 'fs';
import glob from "glob"
import path from "path"
import { WIDGET_DIR } from "./constants"

const buildWidgetsReceivers = async () => {
  return [
    {
      $: {
        "android:name": ".SampleWidget",
        "android:exported": "false" as const,
      },
      "intent-filter": [
        {
          action: [
            {
              $: {
                "android:name": "android.appwidget.action.APPWIDGET_UPDATE",
              },
            },
          ],
        },
      ],
      "meta-data": [
        {
          $: {
            "android:name": "android.appwidget.provider",
            "android:resource": "@xml/sample_widget_info",
          },
        },
      ],
    },
  ]
}

const withWidgetManifest: ConfigPlugin = config => {
  return withAndroidManifest(config, async newConfig => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      newConfig.modResults,
    )
    const widgetReceivers = await buildWidgetsReceivers()
    mainApplication.receiver = widgetReceivers

    return newConfig
  })
}

/**
 * Add configuration of kotlin-gradle-plugin
 * @param config
 * @returns
 */
const withWidgetProjectBuildGradle: ConfigPlugin = config => {
  return withProjectBuildGradle(config, async newConfig => {
    const buildGradle = newConfig.modResults.contents

    const search = /dependencies\s?{/
    const replace = `dependencies {
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:\${project.ext.kotlinVersion}"`
    const newBuildGradle = buildGradle.replace(search, replace)
    newConfig.modResults.contents = newBuildGradle
    return newConfig
  })
}

/**
 * Add "apply plugin: kotlin-android" to app build.gradle
 * @param config
 * @returns
 */
const withWidgetAppBuildGradle: ConfigPlugin = config => {
  return withAppBuildGradle(config, async newConfig => {
    const buildGradle = newConfig.modResults.contents
    const search = /(apply plugin: "com\.android\.application"\n)/gm
    const replace = `$1apply plugin: "kotlin-android"\n`
    const newBuildGradle = buildGradle.replace(search, replace)
    newConfig.modResults.contents = newBuildGradle
    return newConfig
  })
}


function copyResourceFiles(widgetSourceDir: string, platformRoot: string) {
  const source = path.join(widgetSourceDir, "android", "src", "main", "res")
  const resDest = path.join(platformRoot, "app", "src", "main", "res")

  console.log(`copy the res files from ${source} to ${resDest}`)
  fs.cpSync(source, resDest, { recursive: true })
}


async function prepareSourceCodes(
  widgetSourceDir: string,
  platformRoot: string,
  packageName: string,
) {
  const packageDirPath = packageName.replace(/\./g, "/")

  const source = path.join(
    widgetSourceDir,
    `android/src/main/java/package_name`,
  )
  const dest = path.join(platformRoot, "app/src/main/java", packageDirPath)
  console.log(`copy the kotlin codes from ${source} to ${dest}`)
  fs.cpSync(source, dest, { recursive: true })

  const files = glob.sync(`${dest}/*.kt`)
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8")
    const newContent = content.replace(
      /^package .*\s/,
      `package ${packageName}\n`,
    )
    fs.writeFileSync(file, newContent)
  }
}

const withWidgetSourceCodes: ConfigPlugin = config => {
  return withDangerousMod(config, [
    "android",
    async newConfig => {
      const projectRoot = newConfig.modRequest.projectRoot
      const platformRoot = newConfig.modRequest.platformProjectRoot
      const widgetDir = path.join(projectRoot, WIDGET_DIR)
      copyResourceFiles(widgetDir, platformRoot)

      const packageName = config.android?.package
      prepareSourceCodes(widgetDir, platformRoot, packageName!)

      return newConfig
    },
  ])
}

export const withWidgetAndroid: ConfigPlugin = config => {
  config = withWidgetManifest(config)
  config = withWidgetProjectBuildGradle(config)
  config = withWidgetAppBuildGradle(config)
  config = withWidgetSourceCodes(config)
  return config
}
