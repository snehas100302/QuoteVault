import * as FileSystem from 'expo-file-system/legacy';
import { quoteService } from './quoteService';
// import SharedGroupPreferences from 'react-native-shared-group-preferences'; // Would be needed for iOS App Groups

const WIDGET_DATA_FILE = `${FileSystem.documentDirectory}widget_quote.json`;
// const APP_GROUP_ID = 'group.com.sneha.quotevault'; // Replace with actual app group ID

export const widgetService = {
    /**
     * Prepares data for the home screen widget.
     * This saves the current Quote of the Day to a shared location.
     */
    updateWidgetData: async () => {
        try {
            const qotd = await quoteService.getQuoteOfTheDay();
            if (!qotd) return;

            const widgetData = {
                id: qotd.id,
                text: qotd.content,
                author: qotd.author,
                updatedAt: new Date().toISOString(),
                deepLink: `/quote/${qotd.id}`,
            };

            // 1. Save to local file system (Android can read this if implemented correctly)
            await FileSystem.writeAsStringAsync(WIDGET_DATA_FILE, JSON.stringify(widgetData));

            // 2. For iOS, we would normally use SharedGroupPreferences
            // try {
            //     await SharedGroupPreferences.setItem('widget_data', widgetData, APP_GROUP_ID);
            // } catch (e) {
            //     console.log('SharedGroupPreferences not available or not configured');
            // }

            console.log('Widget data updated:', WIDGET_DATA_FILE);
            return true;
        } catch (error) {
            console.error('Error updating widget data:', error);
            return false;
        }
    },

    /**
     * Returns the current widget data from the local file system.
     */
    getWidgetData: async () => {
        try {
            const exists = await FileSystem.getInfoAsync(WIDGET_DATA_FILE);
            if (exists.exists) {
                const content = await FileSystem.readAsStringAsync(WIDGET_DATA_FILE);
                return JSON.parse(content);
            }
        } catch (error) {
            console.error('Error reading widget data:', error);
        }
        return null;
    }
};
