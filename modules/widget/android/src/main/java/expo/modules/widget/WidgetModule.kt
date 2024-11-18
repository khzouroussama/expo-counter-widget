package expo.modules.widget

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.Context
import android.content.SharedPreferences
import android.content.Intent
import android.content.ComponentName
import android.appwidget.AppWidgetManager
import android.content.pm.PackageManager
import android.widget.Toast

class WidgetModule : Module() {
  override fun definition() = ModuleDefinition {
      Name("Widget")

      Function("getContainerUrl") {
          return@Function ""
      }

      AsyncFunction("writeAsStringAsync") { filename: String, content: String ->
          try {
              context.openFileOutput(filename, Context.MODE_PRIVATE).use {
                  it.write(content.toByteArray())
              }
          } catch (e: Exception) {
              e.printStackTrace()
              Toast.makeText(context, "Error writing file: ${e.message}", Toast.LENGTH_SHORT).show()
          }
      }


      AsyncFunction("readAsStringAsync") { filename: String ->
          try {
              val content = context.openFileInput(filename).bufferedReader().use {
                  it.readText()
              }
              return@AsyncFunction content
          } catch (e: Exception) {
              e.printStackTrace()
              Toast.makeText(context, "Error reading file: ${e.message}", Toast.LENGTH_SHORT).show()
          }
      }

      Function("reloadWidgets") {
          val packageName = context.packageName

          val intent = Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE)
          val widgetManager = AppWidgetManager.getInstance(context)
          val widgetProviders = context.packageManager.queryBroadcastReceivers(
              Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE),
              PackageManager.GET_META_DATA
          )

          for (provider in widgetProviders) {
              if (provider.activityInfo.packageName == packageName) {
                  val providerComponent = ComponentName(
                      provider.activityInfo.packageName,
                      provider.activityInfo.name
                  )
                  val widgetIds = widgetManager.getAppWidgetIds(providerComponent)
                  intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, widgetIds)
                  context.sendBroadcast(intent)
              }
          }
      }
  }

    private val context
    get() = requireNotNull(appContext.reactContext)

    private fun getPreferences(packageName: String): SharedPreferences {
      return context.getSharedPreferences(packageName + ".widgetdata", Context.MODE_PRIVATE)
    }

}
