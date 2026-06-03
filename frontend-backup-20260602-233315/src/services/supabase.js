import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || '';
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_KEY');
}
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export const supabaseAuthService = {
    async register(email, password, metadata) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                },
            });
            if (error)
                throw error;
            return data;
        }
        catch (error) {
            throw new Error(error.message || 'Registration failed');
        }
    },
    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error)
                throw error;
            return data;
        }
        catch (error) {
            throw new Error(error.message || 'Login failed');
        }
    },
    async logout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error)
                throw error;
        }
        catch (error) {
            throw new Error(error.message || 'Logout failed');
        }
    },
    async getCurrentUser() {
        try {
            const { data, error } = await supabase.auth.getUser();
            if (error)
                throw error;
            return data.user;
        }
        catch (error) {
            return null;
        }
    },
    async getSession() {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error)
                throw error;
            return data.session;
        }
        catch (error) {
            return null;
        }
    },
    async refreshSession() {
        try {
            const { data, error } = await supabase.auth.refreshSession();
            if (error)
                throw error;
            return data.session;
        }
        catch (error) {
            return null;
        }
    },
    async resetPassword(email) {
        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error)
                throw error;
            return data;
        }
        catch (error) {
            throw new Error(error.message || 'Password reset failed');
        }
    },
    async updatePassword(newPassword) {
        try {
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword,
            });
            if (error)
                throw error;
            return data;
        }
        catch (error) {
            throw new Error(error.message || 'Password update failed');
        }
    },
    async updateUserMetadata(metadata) {
        try {
            const { data, error } = await supabase.auth.updateUser({
                data: metadata,
            });
            if (error)
                throw error;
            return data;
        }
        catch (error) {
            throw new Error(error.message || 'Update failed');
        }
    },
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange((event, session) => {
            callback(session?.user || null, session);
        });
    },
};
