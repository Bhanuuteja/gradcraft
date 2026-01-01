import React, { useEffect, useState } from 'react';
import { User, SavedResume } from '../types';
import { getAllUsers, getAllResumes, getSystemStats, deleteUserFull, adminDeleteResume } from '../services/mockBackend';
import { Users, FileText, Trash2, Shield, Activity, Search, RefreshCw, XCircle } from 'lucide-react';

interface AdminDashboardProps {
    currentUser: User;
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onLogout }) => {
    const [stats, setStats] = useState({ users: 0, resumes: 0 });
    const [users, setUsers] = useState<User[]>([]);
    const [resumes, setResumes] = useState<SavedResume[]>([]);
    const [activeTab, setActiveTab] = useState<'users' | 'resumes'>('users');
    const [searchTerm, setSearchTerm] = useState('');

    const refreshData = () => {
        setStats(getSystemStats());
        setUsers(getAllUsers());
        setResumes(getAllResumes());
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleDeleteUser = (id: string) => {
        if (id === currentUser.id) {
            alert("You cannot delete yourself.");
            return;
        }
        if (confirm("Are you sure? This will delete the user and all their resumes.")) {
            deleteUserFull(id);
            refreshData();
        }
    };

    const handleDeleteResume = (id: string) => {
        if (confirm("Are you sure you want to delete this resume?")) {
            adminDeleteResume(id);
            refreshData();
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredResumes = resumes.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-black p-8 text-slate-900 dark:text-white">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-600 rounded-lg shadow-lg shadow-red-900/20">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                        <p className="text-slate-500 text-sm">System Overview & Management</p>
                    </div>
                </div>
                <button onClick={onLogout} className="px-4 py-2 bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors">
                    Log Out
                </button>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 flex items-center gap-4">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Users</p>
                        <h3 className="text-3xl font-bold">{stats.users}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 flex items-center gap-4">
                    <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full text-green-600">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Resumes</p>
                        <h3 className="text-3xl font-bold">{stats.resumes}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 flex items-center gap-4">
                    <div className="p-4 bg-purple-100 dark:bg-purple-900/20 rounded-full text-purple-600">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">System Status</p>
                        <h3 className="text-lg font-bold text-green-500 flex items-center gap-2">Online <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span></h3>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2 bg-slate-100 dark:bg-neutral-800 p-1 rounded-lg">
                        <button 
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white dark:bg-neutral-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            Users
                        </button>
                        <button 
                            onClick={() => setActiveTab('resumes')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'resumes' ? 'bg-white dark:bg-neutral-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            Resumes
                        </button>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    
                    <button onClick={refreshData} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-colors" title="Refresh Data">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-neutral-950 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-neutral-800">
                            <tr>
                                {activeTab === 'users' ? (
                                    <>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-4">Resume Name</th>
                                        <th className="px-6 py-4">Owner ID</th>
                                        <th className="px-6 py-4">Last Modified</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                            {activeTab === 'users' ? (
                                filteredUsers.length > 0 ? filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-400">{user.id.substring(0, 8)}...</td>
                                        <td className="px-6 py-4 font-medium">{user.name}</td>
                                        <td className="px-6 py-4 text-slate-500">{user.email}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No users found.</td></tr>
                                )
                            ) : (
                                filteredResumes.length > 0 ? filteredResumes.map(resume => (
                                    <tr key={resume.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">{resume.name}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-400">{resume.userId}</td>
                                        <td className="px-6 py-4 text-slate-500">{new Date(resume.lastModified).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDeleteResume(resume.id)}
                                                className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                                title="Delete Resume"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No resumes found.</td></tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
