import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MotionWrapper } from '../components/ui/MotionWrapper';
import { User, Mail, GraduationCap, Camera, Check, LogOut, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import defaultAvatar from './img/photo1.jpg';

export default function Profile() {
    const { user, updateProfile, logout, isDemo } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || 'Alex Rivers',
        email: user?.email || 'alex.rivers@productivity.com',
        phone: user?.phone || '+1 (555) 019-2834',
        college: user?.college || 'Stanford University',
        department: user?.department || 'Computer Science & Engineering',
        year: user?.year || 'Senior (Year 4)'
    });
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || 'Alex Rivers',
                email: user.email || 'alex.rivers@productivity.com',
                phone: user.phone || '+1 (555) 019-2834',
                college: user.college || 'Stanford University',
                department: user.department || 'Computer Science & Engineering',
                year: user.year || 'Senior (Year 4)'
            });
        }
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const success = await updateProfile(formData);
        if (success) {
            setSuccessMessage("Profile updated successfully!");
            setIsEditing(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        }
        setIsSaving(false);
    };

    return (
        <MotionWrapper className="max-w-4xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 pb-12">
            {/* Demo Mode Badge Banner if active */}
            {isDemo && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 text-amber-300">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                        <Sparkles size={16} className="text-amber-400 shrink-0" />
                        <span>You are exploring in <strong>Demo Mode (Alex Rivers)</strong> with realistic sample productivity data.</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 shrink-0">
                        Demo Mode
                    </span>
                </div>
            )}

            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 md:gap-8 bg-surface border border-gray-800 p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <div className="relative group shrink-0">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl overflow-hidden bg-primary/10 border-2 border-primary/20 p-1 group-hover:border-primary/40 transition-all shadow-2xl">
                        <img
                            src={user?.avatarUrl || defaultAvatar}
                            alt={user?.fullName || 'Alex Rivers'}
                            className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                        />
                    </div>
                    {isEditing && (
                        <div className="absolute inset-0 bg-black/60 rounded-2xl sm:rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="text-white" size={22} />
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-1.5 sm:space-y-2 relative z-10 min-w-0">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white truncate">{user?.fullName || 'Alex Rivers'}</h1>
                    <p className="text-xs sm:text-sm text-muted flex items-center justify-center md:justify-start gap-1.5 truncate">
                        <Mail size={14} />
                        <span>{user?.email || 'alex.rivers@productivity.com'}</span>
                    </p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                        <span className="px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                            {user?.department || "Computer Science & Engineering"}
                        </span>
                        <span className="px-2.5 py-0.5 bg-white/5 text-muted border border-gray-800 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                            {user?.year || "Senior (Year 4)"}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-2.5 relative z-10 w-full md:w-auto shrink-0">
                    {!isEditing ? (
                        <Button
                            onClick={() => setIsEditing(true)}
                            className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold"
                        >
                            Edit Profile
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(false)}
                            variant="secondary"
                            className="px-5 py-2.5 rounded-xl border border-gray-700 text-xs sm:text-sm font-semibold"
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        onClick={logout}
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-5 py-2.5 rounded-xl flex items-center gap-1.5 justify-center text-xs sm:text-sm"
                    >
                        <LogOut size={15} />
                        Logout
                    </Button>
                </div>
            </div>

            {successMessage && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-medium animate-in fade-in">
                    <Check size={18} />
                    <span>{successMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {/* Personal Info Card */}
                <Card className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <User className="text-primary" size={18} />
                        Personal Details
                    </h2>

                    <form className="space-y-3.5">
                        <ProfileField
                            label="Full Name"
                            name="fullName"
                            value={formData.fullName}
                            disabled={!isEditing}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                        <ProfileField
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            disabled={!isEditing}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <ProfileField
                            label="Joined On"
                            name="createdAt"
                            value={user?.createdAt ? format(new Date(user.createdAt), 'MMMM dd, yyyy') : 'August 23, 2026'}
                            disabled={true}
                        />
                    </form>
                </Card>

                {/* Academic Info Card */}
                <Card className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <GraduationCap className="text-primary" size={18} />
                        Academic Information
                    </h2>

                    <form className="space-y-3.5">
                        <ProfileField
                            label="College Name"
                            name="college"
                            value={formData.college}
                            disabled={!isEditing}
                            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                        />
                        <ProfileField
                            label="Department"
                            name="department"
                            value={formData.department}
                            disabled={!isEditing}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        />
                        <ProfileField
                            label="Current Year"
                            name="year"
                            value={formData.year}
                            disabled={!isEditing}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        />
                    </form>
                </Card>
            </div>

            {isEditing && (
                <div className="flex justify-end pt-2">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full sm:w-auto bg-primary hover:bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-xl shadow-blue-500/20"
                    >
                        {isSaving ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin" size={16} />
                                Saving Changes...
                            </div>
                        ) : "Save Changes"}
                    </Button>
                </div>
            )}
        </MotionWrapper>
    );
}

function ProfileField({ label, value, disabled, onChange }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted ml-0.5">{label}</label>
            <input
                type="text"
                value={value || ''}
                readOnly={disabled}
                onChange={onChange}
                className={`w-full bg-surface border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-all ${disabled
                    ? "border-gray-800 text-muted cursor-not-allowed"
                    : "border-gray-700 focus:border-primary ring-2 ring-transparent focus:ring-primary/10"
                    }`}
            />
        </div>
    );
}
