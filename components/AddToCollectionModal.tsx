import { Folder, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { collectionService } from '../services/favoriteService';
import { BorderRadius, Spacing } from '../styles/theme';

interface AddToCollectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    quoteId: string | null;
}

export const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({
    visible,
    onClose,
    onSuccess,
    quoteId
}) => {
    const { user } = useAuth();
    const { themeColors, fontScale } = useTheme();
    const insets = useSafeAreaInsets();
    const [collections, setCollections] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState<string | null>(null);

    const styles = createStyles(themeColors, fontScale);

    useEffect(() => {
        if (visible && user) {
            fetchCollections();
        }
    }, [visible, user]);

    const fetchCollections = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await collectionService.getCollections(user.id);
            setCollections(data);
        } catch (error) {
            console.error('Error fetching collections:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCollection = async (collectionId: string) => {
        if (!quoteId) return;
        try {
            setAdding(collectionId);
            await collectionService.addQuoteToCollection(collectionId, quoteId);
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error adding to collection:', error);
            // Could show a toast here
            alert('Quote already in this collection or an error occurred. Have you run the SQL RLS policies?');
        } finally {
            setAdding(null);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={[styles.content, { paddingBottom: (insets.bottom || 0) + 12 }]} onStartShouldSetResponder={() => true}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Add to Collection</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={themeColors.text} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator style={styles.loader} color={themeColors.primary} />
                    ) : (
                        <FlatList
                            data={collections}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.item}
                                    onPress={() => handleAddToCollection(item.id)}
                                    disabled={adding !== null}
                                >
                                    <Folder size={20} color={themeColors.textMuted} style={styles.icon} />
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    {adding === item.id && <ActivityIndicator size="small" color={themeColors.primary} />}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No collections found. Create one in the Collections tab!</Text>
                            }
                        />
                    )}
                </View>
            </Pressable>
        </Modal>
    );
};

const createStyles = (colors: any, fontScale: number) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.xl,
        maxHeight: '70%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: 20 * fontScale,
        fontWeight: 'bold',
        color: colors.text,
    },
    loader: {
        padding: Spacing.xl,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    icon: {
        marginRight: Spacing.md,
    },
    itemName: {
        flex: 1,
        fontSize: 16 * fontScale,
        color: colors.text,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.textMuted,
        padding: Spacing.xl,
        fontSize: 14 * fontScale,
    },
});
