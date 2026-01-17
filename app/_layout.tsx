import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { notificationService } from '../services/notificationService';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { themeColors, mode } = useTheme();

  const scheme = useColorScheme();

  const isDark = mode === 'dark' || (mode === 'system' && scheme === 'dark');

  const baseTheme = isDark ? DarkTheme : DefaultTheme;

  const navTheme = {
    ...baseTheme,
    dark: isDark,
    colors: {
      ...baseTheme.colors,
      primary: themeColors.primary,
      background: themeColors.background,
      card: themeColors.surface,
      text: themeColors.text,
      border: themeColors.border,
      notification: themeColors.primary,
    },
  } as const;

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    (async () => {
      try {
        const bg = themeColors.surface ?? themeColors.background;
        await NavigationBar.setBackgroundColorAsync(bg);
        await NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
      } catch (e) {
        // ignore expo-navigation-bar failures
      }
    })();
  }, [themeColors, isDark]);

  useEffect(() => {
    notificationService.requestNotificationPermissions().then(status => {
      if (status === 'granted') {
        notificationService.scheduleDailyQuoteNotification();
      }
    });
  }, []);

  useEffect(() => {
    if (loading) return;

    // Hide splash screen once auth state is resolved
    SplashScreen.hideAsync();

    const rootSegment = segments[0];
    const isAuthGroup = rootSegment === '(tabs)';
    const isAuthScreen = rootSegment === 'login' || rootSegment === 'signup';

    if (!session && !isAuthScreen) {
      router.replace('/login');
    } else if (session && isAuthScreen) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  return (
    <NavThemeProvider value={navTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="collection-details" options={{ headerBackTitle: 'Back', title: 'Collection' }} />
      </Stack>
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
