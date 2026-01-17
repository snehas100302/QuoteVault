import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { Copy, Download, FolderPlus, Heart, Share2, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Animated, Pressable, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Quote } from '../services/quoteService';
import { BorderRadius, Spacing } from '../styles/theme';

interface QuoteCardProps {
    quote: Quote;
    onFavorite?: () => void;
    isFavorited?: boolean;
    onAddToCollection?: () => void;
    onRemove?: () => void;
    onExport?: () => void;
    centered?: boolean;
    onPress?: () => void;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
    quote,
    onFavorite,
    isFavorited = false,
    onAddToCollection,
    onRemove,
    onExport,
    centered = false,
    onPress
}) => {
    const { themeColors, fontScale } = useTheme();
    const styles = createStyles(themeColors, fontScale);
    const router = useRouter();

    const scale = React.useRef(new Animated.Value(1)).current;
    const borderAnim = React.useRef(new Animated.Value(0)).current;
    const shadowAnim = React.useRef(new Animated.Value(0)).current;
    const [pressed, setPressed] = React.useState(false);

    const onShare = async () => {
        try {
            await Share.share({
                message: `"${quote.content}" - ${quote.author}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(`"${quote.content}" - ${quote.author}`);
    };

    const handlePressIn = () => {
        setPressed(true);
        Animated.parallel([
            Animated.timing(scale, { toValue: 0.985, duration: 140, useNativeDriver: false }),
            Animated.timing(borderAnim, { toValue: 1, duration: 140, useNativeDriver: false }),
            Animated.timing(shadowAnim, { toValue: 1, duration: 180, useNativeDriver: false }),
        ]).start();
    };

    const handlePressOut = () => {
        setPressed(false);
        Animated.parallel([
            Animated.timing(scale, { toValue: 1, duration: 180, useNativeDriver: false }),
            Animated.timing(borderAnim, { toValue: 0, duration: 180, useNativeDriver: false }),
            Animated.timing(shadowAnim, { toValue: 0, duration: 220, useNativeDriver: false }),
        ]).start();
    };

    const animatedBorderWidth = borderAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 3] });
    const animatedShadowOpacity = shadowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.32] });
    const animatedShadowRadius = shadowAnim.interpolate({ inputRange: [0, 1], outputRange: [6, 20] });
    const animatedElevation = shadowAnim.interpolate({ inputRange: [0, 1], outputRange: [2, 14] });
    const animatedShadowOffset = shadowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 10] });

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => {
                if (onPress) return onPress();
                router.push({
                    pathname: '/quote/[id]',
                    params: { id: quote.id, quote: JSON.stringify(quote) }
                });
            }}
        >
            <Animated.View
                style={[
                    styles.card,
                    { transform: [{ scale }] },
                    {
                        borderWidth: animatedBorderWidth,
                        borderColor: pressed ? themeColors.primary : themeColors.border,
                        shadowOpacity: animatedShadowOpacity,
                        shadowRadius: animatedShadowRadius,
                        shadowOffset: { width: 0, height: animatedShadowOffset },
                        elevation: animatedElevation,
                    },
                ]}
            >
                <Animated.View pointerEvents="none" style={[{ backgroundColor: themeColors.primary, opacity: shadowAnim }]} />
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{quote.categories?.name || 'General'}</Text>
                </View>

                <Text style={[styles.content, centered && { textAlign: 'center' }]}>{"\"" + quote.content + "\""}</Text>
                <Text style={[styles.author, centered && { textAlign: 'center' }]}>— {quote.author}</Text>

                <View style={styles.footer}>
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={onFavorite} style={styles.actionBtn}>
                            <Heart size={20} color={isFavorited ? themeColors.secondary : themeColors.textMuted} fill={isFavorited ? themeColors.secondary : 'transparent'} />
                        </TouchableOpacity>

                        {onAddToCollection && (
                            <TouchableOpacity onPress={onAddToCollection} style={styles.actionBtn}>
                                <FolderPlus size={20} color={themeColors.textMuted} />
                            </TouchableOpacity>
                        )}

                        {onRemove && (
                            <TouchableOpacity onPress={onRemove} style={styles.actionBtn}>
                                <Trash2 size={20} color={themeColors.error} />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity onPress={onShare} style={styles.actionBtn}>
                            <Share2 size={20} color={themeColors.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={copyToClipboard} style={styles.actionBtn}>
                            <Copy size={20} color={themeColors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.downloadBtn} onPress={onExport}>
                        <Download size={20} color={themeColors.primary} />
                        <Text style={styles.downloadText}>Export</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Pressable>
    );
};

const createStyles = (colors: any, fontScale: number) => StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.surface,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        marginBottom: Spacing.md,
    },
    categoryText: {
        fontSize: 12 * fontScale,
        fontWeight: '600',
        color: colors.primary,
        textTransform: 'uppercase',
    },
    content: {
        fontSize: 20 * fontScale,
        fontWeight: '500',
        color: colors.text,
        lineHeight: 28 * fontScale,
        fontStyle: 'italic',
    },
    author: {
        fontSize: 16 * fontScale,
        color: colors.textMuted,
        marginTop: Spacing.md,
        textAlign: 'right',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.lg,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    actions: {
        flexDirection: 'row',
    },
    actionBtn: {
        marginRight: Spacing.md,
    },
    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    downloadText: {
        marginLeft: Spacing.xs,
        color: colors.primary,
        fontWeight: '600',
        fontSize: 14 * fontScale,
    },
});
