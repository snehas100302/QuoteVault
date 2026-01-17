import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { favoriteService } from '../../services/favoriteService';
import { QuoteCard } from '../../components/QuoteCard';
import { AddToCollectionModal } from '../../components/AddToCollectionModal';
import { QuoteExportModal } from '../../components/QuoteExportModal';
import { Colors, Spacing } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Quote } from '../../services/quoteService';

export default function FavoritesScreen() {
    const { user } = useAuth();
    const { themeColors, fontScale } = useTheme();
    const [favorites, setFavorites] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isCollectionModalVisible, setCollectionModalVisible] = useState(false);
    const [isExportModalVisible, setExportModalVisible] = useState(false);
    const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

    const fetchFavorites = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await favoriteService.getFavorites(user.id);
            setFavorites(data as Quote[]);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const handleToggleFavorite = async (quote: Quote) => {
        if (!user) return;
        try {
            // Optimistic update: remove from list immediately
            setFavorites(prev => prev.filter(f => f.id !== quote.id));
            await favoriteService.toggleFavorite(user.id, quote.id, true);
        } catch (error) {
            console.error('Error toggling favorite:', error);
            // Revert on error
            fetchFavorites();
        }
    };

    const handleAddToCollection = (quoteId: string) => {
        setSelectedQuoteId(quoteId);
        setCollectionModalVisible(true);
    };

    const handleExport = (quote: Quote) => {
        setSelectedQuote(quote);
        setExportModalVisible(true);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchFavorites();
    };

    const styles = createStyles(themeColors, fontScale);

    if (loading && !refreshing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Favorites</Text>
            </View>
            <FlatList
                data={favorites}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <QuoteCard
                        quote={item}
                        isFavorited={true}
                        onFavorite={() => handleToggleFavorite(item)}
                        onAddToCollection={() => handleAddToCollection(item.id)}
                        onExport={() => handleExport(item)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text style={styles.emptyText}>No favorite quotes yet.</Text>
                    </View>
                }
            />
            <AddToCollectionModal
                visible={isCollectionModalVisible}
                onClose={() => setCollectionModalVisible(false)}
                onSuccess={() => { }}
                quoteId={selectedQuoteId}
            />
            {selectedQuote && (
                <QuoteExportModal
                    visible={isExportModalVisible}
                    onClose={() => {
                        setExportModalVisible(false);
                        setSelectedQuote(null);
                    }}
                    quote={selectedQuote}
                />
            )}
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
    listContent: {
        padding: Spacing.lg,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16 * fontScale,
        color: colors.textMuted,
    },
});
