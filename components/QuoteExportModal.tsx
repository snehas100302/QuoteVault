import * as Sharing from 'expo-sharing';
import { Check, Share2, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import { useTheme } from '../context/ThemeContext';
import { Quote } from '../services/quoteService';
import { BorderRadius, Spacing } from '../styles/theme';

interface QuoteExportModalProps {
    visible: boolean;
    onClose: () => void;
    quote: Quote;
}

type ExportStyle = 'minimal' | 'vibrant' | 'classic';

export const QuoteExportModal: React.FC<QuoteExportModalProps> = ({ visible, onClose, quote }) => {
    const { themeColors, fontScale } = useTheme();
    const insets = useSafeAreaInsets();
    const [selectedStyle, setSelectedStyle] = useState<ExportStyle>('minimal');
    const [exporting, setExporting] = useState(false);
    const viewShotRef = useRef<ViewShot>(null);

    const styles = createStyles(themeColors, fontScale);

    const handleExport = async () => {
        if (!viewShotRef.current?.capture) return;

        try {
            setExporting(true);
            const uri = await viewShotRef.current.capture();

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            }
        } catch (error) {
            console.error('Error exporting image:', error);
        } finally {
            setExporting(false);
        }
    };

    const renderPreview = () => {
        let cardStyle = {};
        let textStyle = {};
        let authorStyle = {};

        switch (selectedStyle) {
            case 'minimal':
                cardStyle = styles.minimalCard;
                textStyle = styles.minimalText;
                authorStyle = styles.minimalAuthor;
                break;
            case 'vibrant':
                cardStyle = [styles.vibrantCard, { backgroundColor: themeColors.primary }];
                textStyle = styles.vibrantText;
                authorStyle = styles.vibrantAuthor;
                break;
            case 'classic':
                cardStyle = styles.classicCard;
                textStyle = styles.classicText;
                authorStyle = styles.classicAuthor;
                break;
        }

        return (
            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
                <View style={[styles.cardPreview, cardStyle]}>
                    <Text style={[styles.quoteText, textStyle]}>"{quote.content}"</Text>
                    <Text style={[styles.authorText, authorStyle]}>— {quote.author}</Text>
                    <Text style={[styles.brandText, selectedStyle === 'vibrant' && { color: 'rgba(255,255,255,0.4)' }]}>QuoteVault</Text>
                </View>
            </ViewShot>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <View style={[styles.modalContainer, { paddingBottom: (insets.bottom || 0) + 12 }]} onStartShouldSetResponder={() => true}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Export Quote</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={themeColors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.content}>
                        <View style={styles.previewContainer}>
                            {renderPreview()}
                        </View>

                        <Text style={styles.sectionTitle}>Select Style</Text>
                        <View style={styles.styleSelector}>
                            {(['minimal', 'vibrant', 'classic'] as ExportStyle[]).map((style) => (
                                <TouchableOpacity
                                    key={style}
                                    style={[styles.styleBtn, selectedStyle === style && styles.styleBtnActive]}
                                    onPress={() => setSelectedStyle(style)}
                                >
                                    <View style={[styles.styleDot, style === 'vibrant' ? { backgroundColor: themeColors.primary } : style === 'classic' ? styles.classicDot : styles.minimalDot]} />
                                    <Text style={styles.styleBtnText}>{style.charAt(0).toUpperCase() + style.slice(1)}</Text>
                                    {selectedStyle === style && <Check size={16} color={themeColors.primary} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.exportBtn}
                            onPress={handleExport}
                            disabled={exporting}
                        >
                            {exporting ? (
                                <ActivityIndicator color={themeColors.white} />
                            ) : (
                                <>
                                    <Share2 size={20} color={themeColors.white} />
                                    <Text style={styles.exportBtnText}>Share Image</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
};

const { width } = Dimensions.get('window');
const PREVIEW_WIDTH = width - Spacing.xl * 4;

const createStyles = (colors: any, fontScale: number) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        height: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: 18 * fontScale,
        fontWeight: 'bold',
        color: colors.text,
    },
    content: {
        padding: Spacing.xl,
    },
    previewContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    cardPreview: {
        width: PREVIEW_WIDTH,
        height: PREVIEW_WIDTH, // Square
        padding: Spacing.xl,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: BorderRadius.md,
        backgroundColor: colors.white,
    },
    quoteText: {
        fontSize: 20 * fontScale,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    authorText: {
        fontSize: 16 * fontScale,
        fontWeight: '600',
    },
    brandText: {
        position: 'absolute',
        bottom: Spacing.md,
        fontSize: 12 * fontScale,
        color: 'rgba(0,0,0,0.2)',
        fontWeight: 'bold',
    },
    // Styles
    minimalCard: {
        borderWidth: 2,
        borderColor: colors.text,
    },
    minimalText: {
        color: colors.text,
        fontWeight: '500',
    },
    minimalAuthor: {
        color: colors.textMuted,
    },
    vibrantCard: {
        // backgroundColor is set dynamically in the component
    },
    vibrantText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 22 * fontScale,
    },
    vibrantAuthor: {
        color: 'rgba(255,255,255,0.8)',
    },
    classicCard: {
        backgroundColor: '#F5F5DC', // Beige/Cream
        borderWidth: 1,
        borderColor: '#D2B48C',
    },
    classicText: {
        color: '#2F4F4F',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        fontStyle: 'italic',
    },
    classicAuthor: {
        color: '#2F4F4F',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    // Selector
    sectionTitle: {
        fontSize: 16 * fontScale,
        fontWeight: 'bold',
        marginBottom: Spacing.md,
        color: colors.text,
    },
    styleSelector: {
        gap: Spacing.sm,
    },
    styleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: colors.surface,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    styleBtnActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '08',
    },
    styleDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: Spacing.md,
    },
    minimalDot: { backgroundColor: colors.text },
    classicDot: { backgroundColor: '#D2B48C' },
    styleBtnText: {
        flex: 1,
        fontSize: 14 * fontScale,
        color: colors.text,
    },
    footer: {
        padding: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    exportBtn: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },
    exportBtnText: {
        color: colors.white,
        fontSize: 16 * fontScale,
        fontWeight: 'bold',
    },
});
