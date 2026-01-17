import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, TextInput, ScrollView } from 'react-native';
import { Search, LogOut, Sparkles, Sun, Moon, Sunrise, Shuffle, TrendingUp, Trophy } from 'lucide-react-native';
import { quoteService, Quote, Category } from '../../services/quoteService';
import { favoriteService } from '../../services/favoriteService';
import { QuoteCard } from '../../components/QuoteCard';
import { AddToCollectionModal } from '../../components/AddToCollectionModal';
import { QuoteExportModal } from '../../components/QuoteExportModal';
import { ScratchCardModal } from '../../components/ScratchCardModal';
import { Colors, Spacing, BorderRadius } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { widgetService } from '../../services/widgetService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const { signOut, user } = useAuth();
  const { themeColors, fontScale } = useTheme();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quoteOfTheDay, setQuoteOfTheDay] = useState<Quote | null>(null);
  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isCollectionModalVisible, setCollectionModalVisible] = useState(false);
  const [isExportModalVisible, setExportModalVisible] = useState(false);
  const [isScratchModalVisible, setScratchModalVisible] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [greeting, setGreeting] = useState({ text: 'Hello', icon: <Sunrise size={20} color={themeColors.textMuted} /> });
  const [dailyGoal, setDailyGoal] = useState({ current: 0, target: 15 });
  const [hasScratchedToday, setHasScratchedToday] = useState(false);

  useEffect(() => {
    updateGreeting();
    loadDailyGoal();
  }, []);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting({ text: 'Good Morning', icon: <Sunrise size={24} color="#f59e0b" /> });
    else if (hour < 18) setGreeting({ text: 'Good Afternoon', icon: <Sun size={24} color="#f59e0b" /> });
    else setGreeting({ text: 'Good Evening', icon: <Moon size={24} color="#6366f1" /> });
  };

  const loadDailyGoal = async () => {
    try {
      const today = new Date().toDateString();
      const saved = await AsyncStorage.getItem(`daily_goal_${today}`);
      if (saved) {
        setDailyGoal(prev => ({ ...prev, current: parseInt(saved) }));
      }
    } catch (e) {
      console.error('Failed to load goal', e);
    }
  };

  const incrementGoal = async () => {
    const newVal = dailyGoal.current + 1;
    if (newVal > dailyGoal.target) return;
    setDailyGoal(prev => ({ ...prev, current: newVal }));
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem(`daily_goal_${today}`, newVal.toString());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchQuotes = useCallback(async (pageNum: number, categoryId?: string, isRefresh = false) => {
    try {
      if (pageNum === 0) setLoading(true);
      const data = await quoteService.getQuotes(pageNum, 10, categoryId);

      if (isRefresh || pageNum === 0) {
        setQuotes(data);
      } else {
        setQuotes(prev => {
          const combined = [...prev, ...data];
          // Deduplicate by ID
          return combined.filter((item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
          );
        });
      }

      setHasMore(data.length === 10);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await quoteService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    try {
      const favorites = await favoriteService.getFavorites(user.id);
      setFavoriteIds(new Set(favorites.map(f => f.id)));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }, [user]);

  const fetchQOTD = async () => {
    try {
      const [q, recent] = await Promise.all([
        quoteService.getQuoteOfTheDay(),
        quoteService.getRecentQuotes(5)
      ]);
      setQuoteOfTheDay(q);
      setRecentQuotes(recent);
      // Update widget data whenever we get a new QOTD
      await widgetService.updateWidgetData();
    } catch (error) {
      console.error('Error fetching dynamic data:', error);
    }
  };

  const checkScratchStatus = async () => {
    try {
      const today = new Date().toDateString();
      const lastScratch = await AsyncStorage.getItem('last_scratch_date');
      setHasScratchedToday(lastScratch === today);
    } catch (e) {
      console.error('Error checking scratch status', e);
    }
  };

  const handleShuffle = async () => {
    // Check if already scratched today
    const today = new Date().toDateString();
    try {
      const lastScratch = await AsyncStorage.getItem('last_scratch_date');
      if (lastScratch === today) {
        setHasScratchedToday(true);
        setScratchModalVisible(true);
        return;
      }

      setShuffling(true);
      setHasScratchedToday(false);

      // Attempt to get a random quote
      const random = await quoteService.getRandomQuote();
      if (random) {
        setSelectedQuote(random);
        setScratchModalVisible(true);
      } else {
        // Fallback: use QOTD if random fails
        if (quoteOfTheDay) {
          setSelectedQuote(quoteOfTheDay);
          setScratchModalVisible(true);
        }
      }
    } catch (e) {
      console.error('Shuffle error:', e);
    } finally {
      setShuffling(false);
    }
  };

  const handleRevealComplete = async () => {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem('last_scratch_date', today);
      setHasScratchedToday(true);
      incrementGoal(); // Also increment goal when scratched
    } catch (e) {
      console.error('Error saving scratch date', e);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchQuotes(0);
    fetchFavorites();
    fetchQOTD();
    checkScratchStatus();
  }, [fetchQuotes, fetchFavorites]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(0);
    fetchQuotes(0, selectedCategory, true);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore && !searchQuery) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchQuotes(nextPage, selectedCategory);
    }
  };

  const handleCategorySelect = (categoryId?: string) => {
    setSelectedCategory(categoryId);
    setPage(0);
    fetchQuotes(0, categoryId);
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length > 2) {
      setLoading(true);
      const results = await quoteService.searchQuotes(text);
      setQuotes(results);
      setHasMore(false);
      setLoading(false);
    } else if (text.length === 0) {
      setPage(0);
      fetchQuotes(0, selectedCategory);
    }
  };
  const handleToggleFavorite = async (quote: Quote) => {
    if (!user) return;
    const isFavorited = favoriteIds.has(quote.id);
    try {
      // Optimistic update
      const newFavoriteIds = new Set(favoriteIds);
      if (isFavorited) {
        newFavoriteIds.delete(quote.id);
      } else {
        newFavoriteIds.add(quote.id);
      }
      setFavoriteIds(newFavoriteIds);
      incrementGoal();

      await favoriteService.toggleFavorite(user.id, quote.id, isFavorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert if API fails
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
    incrementGoal();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.topBar}>
        <View style={styles.greetingHeader}>
          <View style={styles.greetingTitleRow}>
            {greeting.icon}
            <Text style={styles.greeting}>{greeting.text},</Text>
          </View>
          <Text style={styles.userName}>{user?.user_metadata?.full_name?.split(' ')[0] || 'User'}</Text>
        </View>
        <TouchableOpacity style={styles.shuffleBtn} onPress={handleShuffle} disabled={shuffling}>
          {shuffling ? <ActivityIndicator size="small" color={themeColors.primary} /> : <Shuffle size={20} color={themeColors.primary} />}
        </TouchableOpacity>
      </View>

      <View style={styles.dailyGoalCard}>
        <View style={styles.goalInfo}>
          <View style={styles.goalIconContainer}>
            <Trophy size={18} color={themeColors.white} />
          </View>
          <View>
            <Text style={styles.goalTitle}>Daily Reading Goal</Text>
            <Text style={styles.goalSubtitle}>{dailyGoal.current} of {dailyGoal.target} quotes explored</Text>
          </View>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${(dailyGoal.current / dailyGoal.target) * 100}%` }]} />
        </View>
      </View>

      {recentQuotes.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={18} color={themeColors.primary} />
            <Text style={styles.sectionTitle}>New Arrivals</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentList}>
            {recentQuotes.map(quote => (
              <TouchableOpacity
                key={quote.id}
                style={styles.recentCard}
                onPress={() => handleExport(quote)}
              >
                <Text style={styles.recentQuoteText} numberOfLines={3}>"{quote.content}"</Text>
                <Text style={styles.recentAuthorText} numberOfLines={1}>— {quote.author}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.searchContainer}>
        <Search size={20} color={themeColors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search all quotes..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={themeColors.textMuted}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesList} contentContainerStyle={{ paddingBottom: Spacing.sm }}>
        <TouchableOpacity
          style={[styles.categoryBtn, !selectedCategory && styles.categoryBtnActive]}
          onPress={() => handleCategorySelect(undefined)}
        >
          <Text style={[styles.categoryBtnText, !selectedCategory && styles.categoryBtnTextActive]}>All Topics</Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryBtn, selectedCategory === cat.id && styles.categoryBtnActive]}
            onPress={() => handleCategorySelect(cat.id)}
          >
            <Text style={[styles.categoryBtnText, selectedCategory === cat.id && styles.categoryBtnTextActive]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const styles = createStyles(themeColors, fontScale);

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={<>{renderHeader()}</>}
        data={quotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <QuoteCard
            quote={item}
            isFavorited={favoriteIds.has(item.id)}
            onFavorite={() => handleToggleFavorite(item)}
            onAddToCollection={() => handleAddToCollection(item.id)}
            onExport={() => handleExport(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[themeColors.primary]} />
        }
        ListFooterComponent={
          loadingMore ? <ActivityIndicator style={{ margin: Spacing.md }} color={themeColors.primary} /> : null
        }
        ListEmptyComponent={
          loading && page === 0 ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
          ) : (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No quotes found</Text>
            </View>
          )
        }
      />
      <AddToCollectionModal
        visible={isCollectionModalVisible}
        onClose={() => setCollectionModalVisible(false)}
        onSuccess={() => {
          incrementGoal();
          // Refresh if we were displaying collection-specific data
        }}
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
      <ScratchCardModal
        visible={isScratchModalVisible}
        onClose={() => setScratchModalVisible(false)}
        quote={selectedQuote}
        isFavorited={selectedQuote ? favoriteIds.has(selectedQuote.id) : false}
        onFavorite={() => selectedQuote && handleToggleFavorite(selectedQuote)}
        onAddToCollection={() => selectedQuote && handleAddToCollection(selectedQuote.id)}
        onExport={() => selectedQuote && handleExport(selectedQuote)}
        onReveal={handleRevealComplete}
        isLimitReached={hasScratchedToday}
      />
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greetingHeader: {
    flex: 1,
  },
  greetingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  greeting: {
    fontSize: 14 * fontScale,
    color: colors.textMuted,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24 * fontScale,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: -2,
  },
  shuffleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dailyGoalCard: {
    backgroundColor: colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  goalIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 14 * fontScale,
    fontWeight: 'bold',
    color: colors.text,
  },
  goalSubtitle: {
    fontSize: 12 * fontScale,
    color: colors.textMuted,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: Spacing.md,
  },
  recentSection: {
    marginBottom: Spacing.lg,
  },
  recentList: {
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  recentCard: {
    width: 280,
    backgroundColor: colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    height: 160,
    justifyContent: 'center',
  },
  recentQuoteText: {
    fontSize: 12 * fontScale,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 18,
    textAlign: 'center',
  },
  recentAuthorText: {
    fontSize: 10 * fontScale,
    color: colors.textMuted,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 16 * fontScale,
    fontWeight: 'bold',
    color: colors.text,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16 * fontScale,
    color: colors.text,
  },
  categoriesList: {
    marginTop: Spacing.sm,
  },
  categoryBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: colors.surface,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryBtnText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 13 * fontScale,
  },
  categoryBtnTextActive: {
    color: colors.white,
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
  },
});
