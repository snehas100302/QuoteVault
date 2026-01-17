import { useFocusEffect, useRouter } from 'expo-router';
import { Folder, Heart, LogOut, Palette, Sun, Type, User } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { collectionService, favoriteService } from '../../services/favoriteService';
import { BorderRadius, Spacing } from '../../styles/theme';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const { mode, setMode, accentColor, setAccentColor, fontScale, setFontScale, themeColors } = useTheme();
    const [stats, setStats] = useState({ favorites: 0, collections: 0 });

    const ACCENT_COLORS: any[] = [
        '#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', // Standard
        '#fda4af', '#7dd3fc', '#86efac', '#d8b4fe', '#fde047', '#5eead4' // Pastels
    ];

    const styles = createStyles(themeColors, fontScale);

    useFocusEffect(
        useCallback(() => {
            if (user) {
                fetchStats();
            }
        }, [user])
    );

    const fetchStats = async () => {
        try {
            if (!user) return;
            const [favs, totalQuotes] = await Promise.all([
                favoriteService.getFavorites(user.id),
                // collectionService.getTotalQuotesCount(user.id)
                collectionService.getCollections(user.id)
            ]);
            setStats({
                favorites: favs.length,
                collections: totalQuotes.length
            });
        } catch (error) {
            console.error('Error fetching profile stats:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <User size={40} color={themeColors.white} />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user?.user_metadata?.full_name || 'QuoteVault User'}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Appearance</Text>
                    <View style={styles.settingsGrid}>
                        <View style={styles.settingItem}>
                            <View style={styles.settingLabel}>
                                <Sun size={20} color={themeColors.text} />
                                <Text style={styles.settingText}>Theme Mode</Text>
                            </View>
                            <View style={styles.modeToggle}>
                                {(['system', 'light', 'dark'] as const).map((m) => (
                                    <TouchableOpacity
                                        key={m}
                                        style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
                                        onPress={() => setMode(m)}
                                    >
                                        <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
                                            {m.charAt(0).toUpperCase() + m.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.settingItem}>
                            <View style={styles.settingLabel}>
                                <Palette size={20} color={themeColors.text} />
                                <Text style={styles.settingText}>Accent Color</Text>
                            </View>
                            <View style={styles.colorPalette}>
                                {ACCENT_COLORS.map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[styles.colorCircle, { backgroundColor: color }, accentColor === color && styles.colorCircleActive]}
                                        onPress={() => setAccentColor(color)}
                                    />
                                ))}
                            </View>
                        </View>

                        <View style={styles.settingItem}>
                            <View style={styles.settingLabel}>
                                <Type size={20} color={themeColors.text} />
                                <Text style={styles.settingText}>Font Size</Text>
                            </View>
                            <View style={styles.fontControls}>
                                {[0.8, 1, 1.2, 1.4].map((s) => (
                                    <TouchableOpacity
                                        key={s}
                                        style={[styles.fontBtn, fontScale === s && styles.fontBtnActive]}
                                        onPress={() => setFontScale(s)}
                                    >
                                        <Text style={[styles.fontBtnText, fontScale === s && styles.fontBtnTextActive, { fontSize: 14 * s }]}>A</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Activity</Text>
                    <View style={styles.statsContainer}>
                        <TouchableOpacity
                            style={styles.statBox}
                            onPress={() => router.push('/(tabs)/favorites')}
                        >
                            <Heart size={20} color={themeColors.secondary} />
                            <Text style={styles.statLabel}>Favorites</Text>
                            <Text style={styles.statValue}>{stats.favorites}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.statBox}
                            onPress={() => router.push('/(tabs)/collections')}
                        >
                            <Folder size={20} color={themeColors.primary} />
                            <Text style={styles.statLabel}>Collections</Text>
                            <Text style={styles.statValue}>{stats.collections}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
                    <LogOut size={20} color={themeColors.error} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const createStyles = (colors: any, fontScale: number) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    header: {
        paddingTop: 60,
        backgroundColor: colors.white,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: 24 * fontScale,
        fontWeight: 'bold',
        color: colors.text,
    },
    content: {
        padding: Spacing.lg,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: Spacing.xl,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.lg,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 20 * fontScale,
        fontWeight: 'bold',
        color: colors.text,
    },
    userEmail: {
        fontSize: 14 * fontScale,
        color: colors.textMuted,
        marginTop: 2,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 18 * fontScale,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: Spacing.md,
    },
    settingsGrid: {
        backgroundColor: colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        gap: Spacing.lg,
    },
    settingItem: {
        gap: Spacing.sm,
    },
    settingLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    settingText: {
        fontSize: 14 * fontScale,
        fontWeight: '600',
        color: colors.text,
    },
    modeToggle: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: BorderRadius.md,
        padding: 4,
    },
    modeBtn: {
        flex: 1,
        paddingVertical: Spacing.xs,
        alignItems: 'center',
        borderRadius: BorderRadius.sm,
    },
    modeBtnActive: {
        backgroundColor: colors.primary,
    },
    modeBtnText: {
        fontSize: 12 * fontScale,
        color: colors.textMuted,
        fontWeight: '600',
    },
    modeBtnTextActive: {
        color: colors.white,
    },
    colorPalette: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        paddingVertical: Spacing.xs,
    },
    colorCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorCircleActive: {
        borderColor: colors.text,
        transform: [{ scale: 1.1 }],
    },
    fontControls: {
        flexDirection: 'row',
        gap: Spacing.md,
        alignItems: 'center',
    },
    fontBtn: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    fontBtnActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    fontBtnText: {
        color: colors.text,
        fontWeight: 'bold',
    },
    fontBtnTextActive: {
        color: colors.white,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    statBox: {
        flex: 1,
        backgroundColor: colors.white,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    statLabel: {
        fontSize: 12 * fontScale,
        color: colors.textMuted,
        marginTop: Spacing.xs,
    },
    statValue: {
        fontSize: 18 * fontScale,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 2,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: colors.error,
        marginTop: Spacing.xl,
    },
    logoutText: {
        color: colors.error,
        fontWeight: 'bold',
        fontSize: 16 * fontScale,
        marginLeft: Spacing.sm,
    },
});
