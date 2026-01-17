package com.sneha.quotevault

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import java.io.File

class QuoteWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_quote)

            // Read widget data from file
            val widgetData = readWidgetData(context)

            if (widgetData != null) {
                views.setTextViewText(R.id.widget_quote_text, "\"${widgetData["text"]}\"")
                views.setTextViewText(R.id.widget_quote_author, "— ${widgetData["author"]}")

                // Set up deep link on tap
                val quoteId = widgetData["id"] ?: ""
                val deepLink = Uri.parse("quotevault://quote/$quoteId")
                val intent = Intent(Intent.ACTION_VIEW, deepLink).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    `package` = context.packageName
                }

                val pendingIntent = android.app.PendingIntent.getActivity(
                    context,
                    appWidgetId,
                    intent,
                    android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun readWidgetData(context: Context): Map<String, String>? {
            return try {
                val fileName = "widget_quote.json"
                val file = File(context.filesDir, fileName)
                if (file.exists()) {
                    val json = file.readText()
                    parseJson(json)
                } else {
                    null
                }
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }

        private fun parseJson(json: String): Map<String, String> {
            val result = mutableMapOf<String, String>()
            // Simple JSON parsing without external library
            val text = extractJsonValue(json, "text")
            val author = extractJsonValue(json, "author")
            val id = extractJsonValue(json, "id")

            if (text != null) result["text"] = text
            if (author != null) result["author"] = author
            if (id != null) result["id"] = id

            return result
        }

        private fun extractJsonValue(json: String, key: String): String? {
            val regex = "\"$key\"\\s*:\\s*\"([^\"]+)\"".toRegex()
            val matchResult = regex.find(json)
            return matchResult?.groupValues?.get(1)
        }
    }
}
