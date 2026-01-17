import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { Spacing, BorderRadius } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function SignUpScreen() {
    const { signUp } = useAuth();
    const { themeColors, fontScale } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const styles = createStyles(themeColors, fontScale);

    const handleSignUp = async () => {
        if (!email || !password || !fullName) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { error: signUpError } = await signUp(email, password, fullName);
            if (signUpError) throw signUpError;
            // Success: Root layout effect handles navigation
            router.replace('/(tabs)');
        } catch (e: any) {
            setError(e.message || 'Failed to sign up');
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join QuoteVault to save and organize quotes</Text>
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        value={fullName}
                        onChangeText={setFullName}
                        placeholderTextColor={themeColors.textMuted}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor={themeColors.textMuted}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor={themeColors.textMuted}
                    />
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSignUp}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color={themeColors.white} /> : <Text style={styles.buttonText}>Sign Up</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => router.push('/login')}
                        disabled={loading}
                    >
                        <Text style={styles.secondaryButtonText}>Already have an account? Log In</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </KeyboardAvoidingView>
    );
}

const createStyles = (colors: any, fontScale: number) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        padding: Spacing.xl,
        justifyContent: 'center',
    },
    header: {
        marginBottom: Spacing.xxl,
        alignItems: 'center',
    },
    title: {
        fontSize: 32 * fontScale,
        fontWeight: 'bold',
        color: colors.text,
    },
    subtitle: {
        fontSize: 16 * fontScale,
        color: colors.textMuted,
        marginTop: Spacing.xs,
    },
    form: {
        gap: Spacing.md,
    },
    input: {
        backgroundColor: colors.surface,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        fontSize: 16 * fontScale,
        color: colors.text,
    },
    button: {
        backgroundColor: colors.primary,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        marginTop: Spacing.sm,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    secondaryButtonText: {
        color: colors.primary,
        fontSize: 16 * fontScale,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: colors.white,
        fontSize: 16 * fontScale,
        fontWeight: 'bold',
    },
    errorText: {
        color: colors.error,
        fontSize: 14 * fontScale,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.xl,
    },
    footerText: {
        fontSize: 14 * fontScale,
        color: colors.textMuted,
    },
    linkText: {
        fontSize: 14 * fontScale,
        color: colors.primary,
        fontWeight: 'bold',
    },
});
