import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { quoteService } from './quoteService';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const notificationService = {
    /**
     * Reqeusts permission for local notifications.
     * NOTE: We only use local notifications for QOTD reminders.
     * The Expo Go SDK 53 warning about "Push notifications" removed from Expo Go
     * only refers to Remote Push (server-side), so local notifications still work.
     */
    async requestNotificationPermissions() {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return null;
        }

        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('daily-quotes', {
                name: 'Daily Quotes',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return finalStatus;
    },

    async scheduleDailyQuoteNotification() {
        try {
            // Cancel existing to avoid duplicates
            await Notifications.cancelAllScheduledNotificationsAsync();

            const quote = await quoteService.getQuoteOfTheDay();

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Random Quote ✨",
                    body: `"${quote.content}" — ${quote.author}`,
                    data: { quoteId: quote.id },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour: 9,
                    minute: 0,
                } as any,
            });

            console.log('Daily notification scheduled for 9 AM');
        } catch (error) {
            console.error('Error scheduling notification:', error);
        }
    },

    async sendTestNotification() {
        const quote = await quoteService.getQuoteOfTheDay();
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Random Quote ✨",
                body: `"${quote.content}" — ${quote.author}`,
            },
            trigger: null, // Send immediately
        });
    }
};
