package <PACKAGE>

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.os.SystemClock
import android.widget.RemoteViews
import org.json.JSONObject
import java.io.FileNotFoundException
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class SampleWidget : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        appWidgetIds.forEach { appWidgetId ->
            // Tell the AppWidgetManager to perform an update on the current
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }
}

internal fun updateAppWidget(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetId: Int
) {
    val views = RemoteViews(context.packageName, R.layout.sample_widget)

    try {
        val content = context.openFileInput("data.json").bufferedReader().use { it.readText() }
        val jsonObject = JSONObject(content)
        val count = jsonObject.getString("count")
        val date = jsonObject.getString("updatedAt")

        views.setTextViewText(R.id.widget_count, count)

        val pastTimeInMillis = parseIsoDateToMillis(date)

        val elapsedRealtime = SystemClock.elapsedRealtime()
        val timeDifference = elapsedRealtime - (System.currentTimeMillis() - pastTimeInMillis)

        views.setChronometer(
            R.id.widget_chronometer,
            timeDifference,
            "Updated %s seconds ago",
            true
        )

        // Set up the intent that starts the app when the widget is clicked
        val intent = Intent(context, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // launch the app when clicking on the widget
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)
    } catch (e: Exception) {
        when {
            e is FileNotFoundException -> {
                views.setTextViewText(R.id.widget_count, "File not found")
            }
            else -> e.printStackTrace()
        }
    }

    appWidgetManager.updateAppWidget(appWidgetId, views)
}

fun parseIsoDateToMillis(isoDate: String): Long {
    return try {
        val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX", Locale.getDefault())
        isoFormat.timeZone = TimeZone.getTimeZone("UTC")
        val date = isoFormat.parse(isoDate)
        date!!.time
    } catch (e: Exception) {
        e.printStackTrace()
        System.currentTimeMillis()
    }
}
