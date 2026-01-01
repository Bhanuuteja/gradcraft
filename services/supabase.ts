
import { createClient } from '@supabase/supabase-js';
import { User, SavedResume, Application, ApplicationStatus, ResumeData } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key missing!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Auth ---

export const login = async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error("No user returned");

    // Fetch profile name
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', data.user.id).single();

    return {
        id: data.user.id,
        email: data.user.email!,
        name: profile?.full_name || data.user.email!,
        passwordHash: '' // Not needed/available in Supabase
    };
};

export const signup = async (email: string, password: string, name: string): Promise<User | null> => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: name }
        }
    });

    if (error) throw error;
    if (!data.user) throw new Error("No user created");

    // If email confirmation is enabled, session will be null
    if (!data.session) {
        return null;
    }

    return {
        id: data.user.id,
        email: data.user.email!,
        name: name,
        passwordHash: ''
    };
};

export const logout = async () => {
    await supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single();

    return {
        id: session.user.id,
        email: session.user.email!,
        name: profile?.full_name || session.user.email!,
        passwordHash: ''
    };
};

// --- Auth ---

export const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
    });
    if (error) throw error;
};

export const updateUserPassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
};

export const saveResume = async (userId: string, data: ResumeData, resumeId?: string, name?: string): Promise<SavedResume> => {
    const payload = {
        user_id: userId,
        name: name || 'Untitled Resume',
        content: data,
        last_modified: Date.now()
    };

    let result;
    if (resumeId) {
        const { data: saved, error } = await supabase
            .from('resumes')
            .update(payload)
            .eq('id', resumeId)
            .select()
            .single();
        if (error) throw error;
        result = saved;
    } else {
        const { data: saved, error } = await supabase
            .from('resumes')
            .insert(payload)
            .select()
            .single();
        if (error) throw error;
        result = saved;
    }

    return {
        id: result.id,
        userId: result.user_id,
        name: result.name,
        lastModified: result.last_modified,
        data: result.content
    };
};

export const getUserResumes = async (userId: string): Promise<SavedResume[]> => {
    const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('last_modified', { ascending: false });

    if (error) throw error;
    return data.map(r => ({
        id: r.id,
        userId: r.user_id,
        name: r.name,
        lastModified: r.last_modified,
        data: r.content
    }));
};

export const deleteResume = async (resumeId: string) => {
    const { error } = await supabase.from('resumes').delete().eq('id', resumeId);
    if (error) throw error;
};

// --- Applications ---

export const saveApplication = async (app: Omit<Application, 'id'>): Promise<Application> => {
    const payload = {
        user_id: app.userId,
        resume_id: app.resumeId,
        company: app.company,
        role: app.role,
        status: app.status,
        applied_date: app.appliedDate,
        job_description: app.jd
    };

    const { data, error } = await supabase.from('applications').insert(payload).select().single();
    if (error) throw error;

    return {
        id: data.id,
        userId: data.user_id,
        resumeId: data.resume_id,
        company: data.company,
        role: data.role,
        status: data.status as ApplicationStatus,
        appliedDate: data.applied_date,
        jd: data.job_description
    };
};

export const getApplications = async (userId: string): Promise<Application[]> => {
    const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .order('applied_date', { ascending: false });

    if (error) throw error;
    return data.map(a => ({
        id: a.id,
        userId: a.user_id,
        resumeId: a.resume_id,
        company: a.company,
        role: a.role,
        status: a.status as ApplicationStatus,
        appliedDate: a.applied_date,
        jd: a.job_description
    }));
};

export const updateApplicationStatus = async (appId: string, status: ApplicationStatus) => {
    const { error } = await supabase.from('applications').update({ status }).eq('id', appId);
    if (error) throw error;
};

export const deleteApplication = async (appId: string) => {
    const { error } = await supabase.from('applications').delete().eq('id', appId);
    if (error) throw error;
};
