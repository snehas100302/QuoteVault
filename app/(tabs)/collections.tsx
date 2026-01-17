import { router } from 'expo-router';
import { Folder, Plus } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { collectionService } from '../../services/favoriteService';
import { BorderRadius, Spacing } from '../../styles/theme';

export default function CollectionsScreen() {
    const { user } = useAuth();
    const { themeColors, fontScale } = useTheme();
    const [collections, setCollections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [creating, setCreating] = useState(false);

    const fetchCollections = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await collectionService.getCollections(user.id);
            setCollections(data);
        } catch (error) {
            console.error('Error fetching collections:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCollections();
    }, [fetchCollections]);

    const handleCreateCollection = async () => {
        if (!user || !newCollectionName.trim()) return;
        try {
            setCreating(true);
            const newCol = await collectionService.createCollection(user.id, newCollectionName.trim());
            setCollections(prev => [...prev, newCol]);
            setNewCollectionName('');
            setModalVisible(false);
        } catch (error) {
            console.error('Error creating collection:', error);
        } finally {
            setCreating(false);
        }
    };

    const styles = createStyles(themeColors, fontScale);
    const insets = useSafeAreaInsets();

    const onRefresh = () => {
        setRefreshing(true);
        fetchCollections();
    };

    const renderCollectionItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.collectionCard}
            onPress={() => router.push({ pathname: '/collection-details', params: { id: item.id, name: item.name } })}
        >
            <View style={styles.collectionIcon}>
                <Folder size={24} color={themeColors.primary} />
            </View>
            <View style={styles.collectionInfo}>
                <Text style={styles.collectionName}>{item.name}</Text>
                <Text style={styles.collectionDate}>Created {new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
        </TouchableOpacity>
    );

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
                <Text style={styles.title}>Collections</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
                    <Plus size={24} color={themeColors.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={collections}
                keyExtractor={(item) => item.id}
                renderItem={renderCollectionItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[themeColors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text style={styles.emptyText}>No collections yet.</Text>
                        <TouchableOpacity style={styles.createBtn} onPress={() => setModalVisible(true)}>
                            <Text style={styles.createBtnText}>Create your first collection</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.modalBg} onPress={() => setModalVisible(false)}>
                    <View style={[styles.modalContent, { paddingBottom: (insets.bottom || 0) + 12 }]} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>New Collection</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Collection Name"
                            value={newCollectionName}
                            onChangeText={setNewCollectionName}
                            placeholderTextColor={themeColors.textMuted}
                            autoFocus
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleCreateCollection}
                                style={[styles.saveBtn, !newCollectionName.trim() && styles.saveBtnDisabled]}
                                disabled={!newCollectionName.trim() || creating}
                            >
                                {creating ? <ActivityIndicator size="small" color={themeColors.white} /> : <Text style={styles.saveBtnText}>Create</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Modal>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: 24 * fontScale,
        fontWeight: 'bold',
        color: colors.text,
    },
    addBtn: {
        padding: Spacing.sm,
    },
    listContent: {
        padding: Spacing.lg,
    },
    collectionCard: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    collectionIcon: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    collectionInfo: {
        flex: 1,
    },
    collectionName: {
        fontSize: 18 * fontScale,
        fontWeight: '600',
        color: colors.text,
    },
    collectionDate: {
        fontSize: 12 * fontScale,
        color: colors.textMuted,
        marginTop: 2,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xxl,
    },
    emptyText: {
        fontSize: 16 * fontScale,
        color: colors.textMuted,
        textAlign: 'center',
    },
    createBtn: {
        marginTop: Spacing.lg,
        backgroundColor: colors.primary,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    createBtnText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    modalBg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
    },
    modalTitle: {
        fontSize: 20 * fontScale,
        fontWeight: 'bold',
        marginBottom: Spacing.lg,
        textAlign: 'center',
        color: colors.text,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        fontSize: 16 * fontScale,
        marginBottom: Spacing.xl,
        color: colors.text,
        backgroundColor: colors.surface,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    cancelBtn: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        marginRight: Spacing.md,
    },
    cancelBtnText: {
        color: colors.textMuted,
        fontWeight: '600',
    },
    saveBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        minWidth: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnDisabled: {
        backgroundColor: colors.border,
    },
    saveBtnText: {
        color: colors.white,
        fontWeight: 'bold',
    },
});
