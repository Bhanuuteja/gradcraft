
import { User, SavedResume, ResumeData, Application, ApplicationStatus } from '../types';
import { generateId } from '../utils';
import emailjs from '@emailjs/browser';

// Global declaration for sql.js loaded via script tag
declare var window: any;

const DB_STORAGE_KEY = 'ats_sqlite_v2.db';
const SESSION_KEY = 'ats_session';

let db: any = null;

const saveDatabase = () => {
    if (!db) return;
    const data = db.export();
    let binary = '';
    const len = data.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(data[i]);
    }
    const base64 = btoa(binary);
    localStorage.setItem(DB_STORAGE_KEY, base64);
};

const loadDatabase = () => {
    const base64 = localStorage.getItem(DB_STORAGE_KEY);
    if (!base64) return null;
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
};

export const initBackend = async (): Promise<void> => {
    if (db) return;
    if (!window.initSqlJs) throw new Error("SQL.js not loaded.");

    const SQL = await window.initSqlJs({
        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });

    const existingData = loadDatabase();
    if (existingData) {
        db = new SQL.Database(existingData);
    } else {
        db = new SQL.Database();
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE,
                name TEXT,
                password_hash TEXT
            );
            
            CREATE TABLE IF NOT EXISTS resumes (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                name TEXT,
                last_modified INTEGER,
                data TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS applications (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                resume_id TEXT,
                company TEXT,
                role TEXT,
                status TEXT,
                applied_date INTEGER,
                jd TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(resume_id) REFERENCES resumes(id)
            );

            CREATE TABLE IF NOT EXISTS otp_codes (
                email TEXT PRIMARY KEY,
                code TEXT,
                expires_at INTEGER
            );
        `);
        saveDatabase();
    }
};

// Auth & Session
export const login = async (email: string, password: string): Promise<User> => {
    const stmt = db.prepare("SELECT * FROM users WHERE email = :email AND password_hash = :pass");
    const result = stmt.getAsObject({ ':email': email, ':pass': password });
    stmt.free();
    if (!result || !result.id) throw new Error("Invalid credentials");
    const user = { id: result.id, email: result.email, name: result.name, passwordHash: result.password_hash };
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
};

export const signup = async (email: string, password: string, name: string): Promise<User> => {
    const id = generateId();
    db.run("INSERT INTO users (id, email, name, password_hash) VALUES (:id, :email, :name, :pass)", {
        ':id': id, ':email': email, ':name': name, ':pass': password
    });
    saveDatabase();
    return login(email, password);
};

// Password Reset (Mocked)
// Add missing password reset functionality for Auth.tsx
export const requestPasswordResetOtp = async (email: string): Promise<string | null> => {
    const stmt = db.prepare("SELECT * FROM users WHERE email = :email");
    const result = stmt.getAsObject({ ':email': email });
    stmt.free();
    if (!result || !result.id) throw new Error("User with this email does not exist");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    db.run("INSERT OR REPLACE INTO otp_codes (email, code, expires_at) VALUES (:email, :code, :exp)", {
        ':email': email, ':code': otp, ':exp': expiresAt
    });
    saveDatabase();
    
    // Auth.tsx logic expects null for success
    console.log(`[MOCK EMAIL] OTP for ${email}: ${otp}`);
    return null; 
};

// Update password using verified OTP
export const confirmPasswordReset = async (email: string, otp: string, newPassword: string): Promise<void> => {
    const stmt = db.prepare("SELECT * FROM otp_codes WHERE email = :email");
    const result = stmt.getAsObject({ ':email': email });
    stmt.free();

    if (!result || result.code !== otp) throw new Error("Invalid verification code");
    if (Date.now() > result.expires_at) throw new Error("Code has expired");

    db.run("UPDATE users SET password_hash = :pass WHERE email = :email", {
        ':pass': newPassword, ':email': email
    });
    db.run("DELETE FROM otp_codes WHERE email = :email", { ':email': email });
    saveDatabase();
};

export const logout = () => localStorage.removeItem(SESSION_KEY);
export const getCurrentUser = () => JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');

// Resume Management
export const saveResume = (userId: string, data: ResumeData, resumeId?: string, name?: string): SavedResume => {
    const finalId = resumeId || generateId();
    const finalName = name || 'Untitled Resume';
    const ts = Date.now();
    db.run("INSERT OR REPLACE INTO resumes (id, user_id, name, last_modified, data) VALUES (:id, :uid, :name, :ts, :data)", {
        ':id': finalId, ':uid': userId, ':name': finalName, ':ts': ts, ':data': JSON.stringify(data)
    });
    saveDatabase();
    return { id: finalId, userId, name: finalName, lastModified: ts, data };
};

export const getUserResumes = (userId: string): SavedResume[] => {
    const stmt = db.prepare("SELECT * FROM resumes WHERE user_id = :uid ORDER BY last_modified DESC");
    stmt.bind({ ':uid': userId });
    const results = [];
    while (stmt.step()) {
        const r = stmt.getAsObject();
        results.push({ id: r.id, userId: r.user_id, name: r.name, lastModified: r.last_modified, data: JSON.parse(r.data) });
    }
    stmt.free();
    return results;
};

export const deleteResume = (userId: string, id: string) => {
    db.run("DELETE FROM resumes WHERE id = :id AND user_id = :uid", { ':id': id, ':uid': userId });
    db.run("DELETE FROM applications WHERE resume_id = :id", { ':id': id });
    saveDatabase();
};

// Application Tracker
export const saveApplication = (app: Omit<Application, 'id'>): Application => {
    const id = generateId();
    db.run(`
        INSERT INTO applications (id, user_id, resume_id, company, role, status, applied_date, jd)
        VALUES (:id, :uid, :rid, :comp, :role, :stat, :date, :jd)
    `, {
        ':id': id, ':uid': app.userId, ':rid': app.resumeId, ':comp': app.company, 
        ':role': app.role, ':stat': app.status, ':date': app.appliedDate, ':jd': app.jd || ''
    });
    saveDatabase();
    return { ...app, id };
};

export const getApplications = (userId: string): Application[] => {
    const stmt = db.prepare("SELECT * FROM applications WHERE user_id = :uid ORDER BY applied_date DESC");
    stmt.bind({ ':uid': userId });
    const results = [];
    while (stmt.step()) {
        const r = stmt.getAsObject();
        results.push({ 
            id: r.id, userId: r.user_id, resumeId: r.resume_id, company: r.company, 
            role: r.role, status: r.status as ApplicationStatus, appliedDate: r.applied_date, jd: r.jd 
        });
    }
    stmt.free();
    return results;
};

export const updateApplicationStatus = (appId: string, status: ApplicationStatus) => {
    db.run("UPDATE applications SET status = :stat WHERE id = :id", { ':stat': status, ':id': appId });
    saveDatabase();
};

export const deleteApplication = (appId: string) => {
    db.run("DELETE FROM applications WHERE id = :id", { ':id': appId });
    saveDatabase();
};

// Admin Functions
// Add missing admin functions used by AdminDashboard.tsx
export const getAllUsers = (): User[] => {
    const stmt = db.prepare("SELECT * FROM users");
    const results: User[] = [];
    while (stmt.step()) {
        const u = stmt.getAsObject();
        results.push({ 
            id: u.id as string, 
            email: u.email as string, 
            name: u.name as string, 
            passwordHash: u.password_hash as string 
        });
    }
    stmt.free();
    return results;
};

export const getAllResumes = (): SavedResume[] => {
    const stmt = db.prepare("SELECT * FROM resumes ORDER BY last_modified DESC");
    const results: SavedResume[] = [];
    while (stmt.step()) {
        const r = stmt.getAsObject();
        results.push({ 
            id: r.id as string, 
            userId: r.user_id as string, 
            name: r.name as string, 
            lastModified: r.last_modified as number, 
            data: JSON.parse(r.data as string) 
        });
    }
    stmt.free();
    return results;
};

export const getSystemStats = () => {
    const usersExec = db.exec("SELECT COUNT(*) FROM users");
    const resumesExec = db.exec("SELECT COUNT(*) FROM resumes");
    const usersCount = usersExec.length > 0 ? usersExec[0].values[0][0] : 0;
    const resumesCount = resumesExec.length > 0 ? resumesExec[0].values[0][0] : 0;
    return { users: Number(usersCount), resumes: Number(resumesCount) };
};

export const deleteUserFull = (userId: string) => {
    db.run("DELETE FROM applications WHERE user_id = :uid", { ':uid': userId });
    db.run("DELETE FROM resumes WHERE user_id = :uid", { ':uid': userId });
    db.run("DELETE FROM users WHERE id = :uid", { ':uid': userId });
    saveDatabase();
};

export const adminDeleteResume = (resumeId: string) => {
    db.run("DELETE FROM applications WHERE resume_id = :id", { ':id': resumeId });
    db.run("DELETE FROM resumes WHERE id = :id", { ':id': resumeId });
    saveDatabase();
};
