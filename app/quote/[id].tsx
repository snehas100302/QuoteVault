import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { QuoteCard } from '../../components/QuoteCard';
import { useTheme } from '../../context/ThemeContext';
import { Quote, quoteService } from '../../services/quoteService';
import { Spacing } from '../../styles/theme';

export default function QuoteScreen() {
    const params = useLocalSearchParams();
    const id = typeof params.id === 'string' ? params.id : '';
    const quoteParam = typeof params.quote === 'string' ? JSON.parse(params.quote) : null;
    const { themeColors } = useTheme();
    const navigation = useNavigation();

    const [quote, setQuote] = useState<Quote | null>(quoteParam);
    const [loading, setLoading] = useState(!quoteParam);

    useFocusEffect(
        React.useCallback(() => {
            navigation.setOptions({
                headerTitle: 'Quote',
            });
        }, [navigation])
    );

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const q = await quoteService.getQuote(id);
                if (mounted) setQuote(q);
            } catch (e) {
                console.error('Failed to load quote', e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [id]);

    if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>;
    if (!quote) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>No quote found.</Text></View>;

    return (
        <View style={{ flex: 1, backgroundColor: themeColors.background, padding: Spacing.lg }}>
            <QuoteCard quote={quote} centered onPress={() => {}} />
        </View>
    );
}
