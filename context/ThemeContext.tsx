import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors as StaticColors } from '../styles/theme';

type ThemeMode = 'light' | 'dark' | 'system';
type AccentColor =
    | '#6366f1' | '#f43f5e' | '#10b981' | '#f59e0b' | '#8b5cf6' // Standard
    | '#fda4af' | '#7dd3fc' | '#86efac' | '#d8b4fe' | '#fde047' | '#5eead4'; // Pastels

interface ThemeContextType {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    accentColor: string;
    setAccentColor: (color: AccentColor) => void;
    fontScale: number;
    setFontScale: (scale: number) => void;
    themeColors: typeof StaticColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [mode, setMode] = useState<ThemeMode>('system');
    const [accentColor, setAccentColor] = useState<AccentColor>('#6366f1');
    const [fontScale, setFontScale] = useState(1);

    useEffect(() => {
        // Load saved preferences
        const loadSettings = async () => {
            try {
                const savedMode = await AsyncStorage.getItem('themeMode');
                const savedAccent = await AsyncStorage.getItem('accentColor');
                const savedFontScale = await AsyncStorage.getItem('fontScale');

                if (savedMode) setMode(savedMode as ThemeMode);
                if (savedAccent) setAccentColor(savedAccent as AccentColor);
                if (savedFontScale) setFontScale(parseFloat(savedFontScale));
            } catch (e) {
                console.error('Failed to load theme settings', e);
            }
        };
        loadSettings();
    }, []);

    const saveSetting = async (key: string, value: string) => {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (e) {
            console.error('Failed to save setting', e);
        }
    };

    const handleSetMode = (m: ThemeMode) => {
        setMode(m);
        saveSetting('themeMode', m);
    };

    const handleSetAccentColor = (c: AccentColor) => {
        setAccentColor(c);
        saveSetting('accentColor', c);
    };

    const handleSetFontScale = (s: number) => {
        setFontScale(s);
        saveSetting('fontScale', s.toString());
    };

    const isDark = mode === 'system' ? systemColorScheme === 'dark' : mode === 'dark';
    const useSoftLight = mode === 'light';

    // Decide which color source to use
    // 1. Dark -> Use .dark (Pitch Black)
    // 2. Manual Light -> Use .softLight (Warm off-white)
    // 3. System (when light) -> Use root Colors (Pure White)
    const activePalette = isDark ? StaticColors.dark : (useSoftLight ? StaticColors.softLight : StaticColors);

    const themeColors = {
        ...StaticColors,
        primary: accentColor,
        background: activePalette.background,
        surface: activePalette.surface,
        text: activePalette.text,
        textMuted: activePalette.textMuted,
        border: activePalette.border,
        white: isDark ? StaticColors.dark.surface : StaticColors.white,
    };

    return (
        <ThemeContext.Provider value={{
            mode,
            setMode: handleSetMode,
            accentColor,
            setAccentColor: handleSetAccentColor,
            fontScale,
            setFontScale: handleSetFontScale,
            themeColors
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
