import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { collectionService, favoriteService } from '../services/favoriteService';
import { QuoteCard } from '../components/QuoteCard';
import { AddToCollectionModal } from '../components/AddToCollectionModal';
import { QuoteExportModal } from '../components/QuoteExportModal';
import { Colors, Spacing } from '../styles/theme';
import { Quote } from '../services/quoteService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function CollectionDetailsScreen() {
    const { user } = useAuth();
    const { themeColors, fontScale } = useTheme();
    const { id, name } = useLocalSearchParams<{ id: string, name: string }>();
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [isCollectionModalVisible, setCollectionModalVisible] = useState(false);
    const [isExportModalVisible, setExportModalVisible] = useState(false);
    const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

    const fetchCollectionQuotes = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await collectionService.getCollectionQuotes(id);
            setQuotes(data as unknown as Quote[]);
        } catch (error) {
            console.error('Error fetching collection quotes:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    const fetchFavorites = useCallback(async () => {
        if (!user) return;
        try {
            const favorites = await favoriteService.getFavorites(user.id);
            setFavoriteIds(new Set(favorites.map(f => f.id)));
        } catch (error) {
            console.error(error);
        }
    }, [user]);

    useEffect(() => {
        fetchCollectionQuotes();
        fetchFavorites();
    }, [fetchCollectionQuotes, fetchFavorites]);

    const handleToggleFavorite = async (quote: Quote) => {
        if (!user) return;
        const isFavorited = favoriteIds.has(quote.id);
        try {
            const newFavoriteIds = new Set(favoriteIds);
            if (isFavorited) newFavoriteIds.delete(quote.id);
            else newFavoriteIds.add(quote.id);
            setFavoriteIds(newFavoriteIds);
            await favoriteService.toggleFavorite(user.id, quote.id, isFavorited);
        } catch (error) {
            console.error(error);
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

    const handleRemoveFromCollection = async (quoteId: string) => {
        if (!id) return;
        try {
            // Optimistic update
            setQuotes(prev => prev.filter(q => q.id !== quoteId));
            await collectionService.removeQuoteFromCollection(id, quoteId);
        } catch (error) {
            console.error('Error removing quote:', error);
            fetchCollectionQuotes();
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchCollectionQuotes();
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
            <Stack.Screen options={{ title: name || 'Collection' }} />
            <FlatList
                data={quotes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <QuoteCard
                        quote={item}
                        isFavorited={favoriteIds.has(item.id)}
                        onFavorite={() => handleToggleFavorite(item)}
                        onAddToCollection={() => handleAddToCollection(item.id)}
                        onRemove={() => handleRemoveFromCollection(item.id)}
                        onExport={() => handleExport(item)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[themeColors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text style={styles.emptyText}>No quotes in this collection yet.</Text>
                    </View>
                }
            />
            <AddToCollectionModal
                visible={isCollectionModalVisible}
                onClose={() => setCollectionModalVisible(false)}
                onSuccess={fetchCollectionQuotes}
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
    listContent: {
        padding: Spacing.lg,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emptyText: {
        fontSize: 16 * fontScale,
        color: colors.textMuted,
        textAlign: 'center',
    },
});
