import * as Haptics from 'expo-haptics';
import { Sparkles, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Quote } from '../services/quoteService';
import { BorderRadius, Spacing } from '../styles/theme';
import { QuoteCard } from './QuoteCard';

const { width, height } = Dimensions.get('window');
const GRID_SIZE = 6; // 6x6 grid of tiles
const TILE_COUNT = GRID_SIZE * GRID_SIZE;

// Responsive sizing: Use 90% of screen width or max 450
const MODAL_WIDTH = Math.min(width - Spacing.lg * 2, 500);
const CARD_WIDTH = MODAL_WIDTH - Spacing.lg * 2;
// Height based on aspect ratio or percentage of screen height
const CARD_HEIGHT = Math.min(height * 0.45, 400);

const TILE_WIDTH = CARD_WIDTH / GRID_SIZE;
const TILE_HEIGHT = CARD_HEIGHT / GRID_SIZE;

interface ScratchCardModalProps {
    visible: boolean;
    onClose: () => void;
    quote: Quote | null;
    isFavorited: boolean;
    onFavorite: () => void;
    onAddToCollection: () => void;
    onExport: () => void;
    onReveal?: () => void;
    isLimitReached?: boolean;
}

export const ScratchCardModal: React.FC<ScratchCardModalProps> = ({
    visible,
    onClose,
    quote,
    isFavorited,
    onFavorite,
    onAddToCollection,
    onExport,
    onReveal,
    isLimitReached = false
}) => {
    const { themeColors, fontScale } = useTheme();
    const insets = useSafeAreaInsets();
    const [scratchedTiles, setScratchedTiles] = useState<Set<number>>(new Set());
    const [isRevealed, setIsRevealed] = useState(false);
    const styles = createStyles(themeColors, fontScale);

    useEffect(() => {
        if (!visible) {
            setScratchedTiles(new Set());
            setIsRevealed(false);
        }
    }, [visible]);

    const handleScratch = useCallback((x: number, y: number) => {
        if (isRevealed) return;

        const col = Math.floor(x / TILE_WIDTH);
        const row = Math.floor(y / TILE_HEIGHT);

        if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
            const index = row * GRID_SIZE + col;
            setScratchedTiles(prev => {
                if (prev.has(index)) return prev;
                const newSet = new Set(prev);
                newSet.add(index);

                if (newSet.size === 1 || newSet.size % 3 === 0) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }

                if (newSet.size > TILE_COUNT * 0.65) {
                    setIsRevealed(true);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    onReveal?.();
                }
                return newSet;
            });
        }
    }, [isRevealed]);

    const onGestureEvent = (event: any) => {
        const { x, y } = event.nativeEvent;
        handleScratch(x, y);
    };

    if (!quote && !isLimitReached) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Pressable style={styles.modalOverlay} onPress={onClose}>
                    <View
                        style={[styles.modalContent, { marginBottom: insets.bottom ? insets.bottom + 8 : 16 }]}
                        onStartShouldSetResponder={() => true}
                    >
                        <View style={styles.modalHeader}>
                            <View style={styles.headerTitleRow}>
                                <Sparkles size={20} color={themeColors.primary} />
                                <Text style={styles.modalTitle}>Random Quote for You</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X size={24} color={themeColors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.cardContainer}>
                            {isLimitReached && !isRevealed ? (
                                <View style={styles.limitContainer}>
                                    <View style={styles.limitIconCircle}>
                                        <Sparkles size={40} color={themeColors.white} />
                                    </View>
                                    <Text style={styles.limitTitle}>Come back tomorrow! ✨</Text>
                                    <Text style={styles.limitSubtitle}>You've already revealed your daily surprise. We'll have a new one ready for you soon.</Text>
                                    <TouchableOpacity style={styles.limitCloseBtn} onPress={onClose}>
                                        <Text style={styles.limitCloseBtnText}>See you then!</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    {/* The Actual Quote Card */}
                                    <View style={styles.quoteWrapper}>
                                        {quote ? (
                                            <QuoteCard
                                                quote={quote}
                                                isFavorited={isFavorited}
                                                onFavorite={onFavorite}
                                                onAddToCollection={onAddToCollection}
                                                onExport={onExport}
                                                centered
                                            />
                                        ) : null}
                                    </View>

                                    {/* The Scratch Overlay */}
                                    {!isRevealed && (
                                        <PanGestureHandler
                                            onGestureEvent={onGestureEvent}
                                            onHandlerStateChange={(e) => {
                                                if (e.nativeEvent.state === State.ACTIVE) {
                                                    handleScratch(e.nativeEvent.x, e.nativeEvent.y);
                                                }
                                            }}
                                            activeOffsetX={[-10, 10]}
                                            activeOffsetY={[-10, 10]}
                                        >
                                            <View style={styles.scratchOverlay}>
                                                {Array.from({ length: TILE_COUNT }).map((_, i) => (
                                                    <View
                                                        key={i}
                                                        style={[
                                                            styles.tile,
                                                            scratchedTiles.has(i) && styles.scratchedTile
                                                        ]}
                                                    />
                                                ))}
                                                <View style={styles.instructionContainer}>
                                                    <Text style={styles.instructionText}>Scratch to reveal</Text>
                                                </View>
                                            </View>
                                        </PanGestureHandler>
                                    )}
                                </>
                            )}
                        </View>
                    </View>
                </Pressable>
            </GestureHandlerRootView>
        </Modal>
    );
};

const createStyles = (colors: any, fontScale: number) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: MODAL_WIDTH,
        backgroundColor: colors.surface,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    modalTitle: {
        fontSize: 20 * fontScale,
        fontWeight: 'bold',
        color: colors.text,
    },
    closeButton: {
        padding: Spacing.xs,
    },
    cardContainer: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        position: 'relative',
    },
    quoteWrapper: {
        flex: 1,
        justifyContent: 'center',
        padding: Spacing.md,
    },
    scratchOverlay: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: colors.border,
    },
    tile: {
        width: `${100 / GRID_SIZE}%`,
        height: `${100 / GRID_SIZE}%`,
        backgroundColor: colors.textMuted,
        borderWidth: 0.5,
        borderColor: colors.border,
    },
    scratchedTile: {
        opacity: 0,
    },
    instructionContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        pointerEvents: 'none',
    },
    instructionText: {
        fontSize: 18 * fontScale,
        fontWeight: '600',
        color: colors.white,
        textAlign: 'center',
        paddingHorizontal: Spacing.xl,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    limitContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.surface,
        paddingHorizontal: Spacing.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    limitIconCircle: {
        width: Math.min(CARD_HEIGHT * 0.2, 80),
        height: Math.min(CARD_HEIGHT * 0.2, 80),
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    limitTitle: {
        fontSize: Math.min(24 * fontScale, CARD_HEIGHT * 0.08),
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: Spacing.xs,
        textAlign: 'center',
        width: '100%',
    },
    limitSubtitle: {
        fontSize: 16 * fontScale,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        lineHeight: 22,
        width: '100%',
    },
    limitCloseBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.full,
    },
    limitCloseBtnText: {
        color: colors.white,
        fontSize: 16 * fontScale,
        fontWeight: 'bold',
    },
});
