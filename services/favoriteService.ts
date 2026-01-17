import { supabase } from '../lib/supabase';

export const favoriteService = {
    async toggleFavorite(userId: string, quoteId: string, isFavorited: boolean) {
        if (isFavorited) {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .match({ user_id: userId, quote_id: quoteId });
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('favorites')
                .insert([{ user_id: userId, quote_id: quoteId }]);
            if (error) throw error;
        }
    },

    async getFavorites(userId: string) {
        const { data, error } = await supabase
            .from('favorites')
            .select('*, quotes(*, categories(name))')
            .eq('user_id', userId);

        if (error) throw error;
        return data.map(f => f.quotes);
    },

    async isQuoteFavorited(userId: string, quoteId: string) {
        const { data, error } = await supabase
            .from('favorites')
            .select('quote_id')
            .match({ user_id: userId, quote_id: quoteId })
            .maybeSingle();

        if (error) throw error;
        return !!data;
    }
};

export const collectionService = {
    async getCollections(userId: string) {
        const { data, error } = await supabase
            .from('collections')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    },

    async createCollection(userId: string, name: string) {
        const { data, error } = await supabase
            .from('collections')
            .insert([{ user_id: userId, name }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async addQuoteToCollection(collectionId: string, quoteId: string) {
        const { error } = await supabase
            .from('collection_quotes')
            .insert([{ collection_id: collectionId, quote_id: quoteId }]);

        if (error) throw error;
    },

    async getCollectionQuotes(collectionId: string) {
        const { data, error } = await supabase
            .from('collection_quotes')
            .select('quotes(*, categories(name))')
            .eq('collection_id', collectionId);

        if (error) throw error;
        return data.map(cq => cq.quotes);
    },

    async removeQuoteFromCollection(collectionId: string, quoteId: string) {
        const { error } = await supabase
            .from('collection_quotes')
            .delete()
            .match({ collection_id: collectionId, quote_id: quoteId });

        if (error) throw error;
    },

    async getTotalQuotesCount(userId: string) {
        const { count, error } = await supabase
            .from('collection_quotes')
            .select('collection_id!inner(user_id)', { count: 'exact', head: true })
            .eq('collection_id.user_id', userId);

        if (error) throw error;
        return count || 0;
    }
};
