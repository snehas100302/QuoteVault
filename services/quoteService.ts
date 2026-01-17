import { supabase } from '../lib/supabase';

export interface Quote {
    id: string;
    content: string;
    author: string;
    category_id: string;
    created_at: string;
    categories?: {
        name: string;
    };
}

export interface Category {
    id: string;
    name: string;
}

export const quoteService = {
    async getQuotes(page = 0, pageSize = 10, categoryId?: string) {
        let query = supabase
            .from('quotes')
            .select('*, categories(name)')
            .order('created_at', { ascending: false })
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Quote[];
    },

    async getCategories() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (error) throw error;
        return data as Category[];
    },

    async searchQuotes(searchTerm: string) {
        const { data, error } = await supabase
            .from('quotes')
            .select('*, categories(name)')
            .or(`content.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`)
            .limit(20);

        if (error) throw error;
        return data as Quote[];
    },

    async getQuoteOfTheDay() {
        // Get total count of quotes
        const { count, error: countError } = await supabase
            .from('quotes')
            .select('*', { count: 'exact', head: true });

        if (countError || !count) throw countError || new Error('No quotes found');

        // Deterministic index based on date (YYYYMMDD)
        const date = new Date();
        const dateString = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`;
        const index = parseInt(dateString) % count;

        const { data, error } = await supabase
            .from('quotes')
            .select('*, categories(name)')
            .range(index, index)
            .single();

        if (error) throw error;
        return data as Quote;
    },

    async getRandomQuote() {
        const { count, error: countError } = await supabase
            .from('quotes')
            .select('*', { count: 'exact', head: true });

        if (countError || !count) return null;

        const randomIndex = Math.floor(Math.random() * count);
        const { data, error } = await supabase
            .from('quotes')
            .select('*, categories(name)')
            .range(randomIndex, randomIndex)
            .single();

        if (error) throw error;
        return data as Quote;
    },

    async getRecentQuotes(limit = 5) {
        const { data, error } = await supabase
            .from('quotes')
            .select('*, categories(name)')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data as Quote[];
    }
,

    async getQuote(id: string) {
        const { data, error } = await supabase
            .from('quotes')
            .select('*, categories(name)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Quote;
    }
};
