package com.sneha.quotevault

import android.content.Context
import androidx.work.Worker
import androidx.work.WorkerParameters
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import java.util.concurrent.TimeUnit

class QuoteWidgetUpdateWorker(context: Context, params: WorkerParameters) : Worker(context, params) {
    override fun doWork(): Result {
        return try {
            // Update all widget instances
            val appWidgetManager = AppWidgetManager.getInstance(applicationContext)
            val componentName = ComponentName(applicationContext, QuoteWidgetProvider::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)

            if (appWidgetIds.isNotEmpty()) {
                for (appWidgetId in appWidgetIds) {
                    QuoteWidgetProvider.updateAppWidget(applicationContext, appWidgetManager, appWidgetId)
                }
            }
            Result.success()
        } catch (e: Exception) {
            e.printStackTrace()
            Result.retry()
        }
    }

    companion object {
        fun scheduleUpdates(context: Context) {
            val updateRequest = PeriodicWorkRequestBuilder<QuoteWidgetUpdateWorker>(
                1, TimeUnit.DAYS
            ).build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                "quote_widget_update",
                ExistingPeriodicWorkPolicy.KEEP,
                updateRequest
            )
        }
    }
}
