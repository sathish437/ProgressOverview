import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MotionWrapper } from '../components/ui/MotionWrapper';
import { User, Mail, Phone, GraduationCap, Building2, Calendar, Camera, Check, LogOut, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import defaultAvatar from './img/photo1.jpg';

export default function Profile() {
    const { user, updateProfile, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({ ...user });
    const [successMessage, setSuccessMessage] = useState('');

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
        <MotionWrapper className="max-w-4xl mx-auto space-y-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-surface border border-gray-800 p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

                <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl overflow-hidden bg-primary/10 border-2 border-primary/20 p-1 group-hover:border-primary/40 transition-all shadow-2xl">
                        <img
                            src={user?.avatarUrl || defaultAvatar}
                            alt={user?.fullName}
                            className="w-full h-full object-cover rounded-2xl"
                        />
                    </div>
                    {isEditing && (
                        <div className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="text-white" size={24} />
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-2 relative z-10">
                    <h1 className="text-4xl font-bold text-white">{user?.fullName}</h1>
                    <p className="text-muted flex items-center justify-center md:justify-start gap-2">
                        <Mail size={16} />
                        {user?.email}
                    </p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-wider">
                            {user?.department || "Department"}
                        </span>
                        <span className="px-3 py-1 bg-white/5 text-muted border border-gray-800 rounded-full text-xs font-bold uppercase tracking-wider">
                            {user?.year || "Year"}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-3 relative z-10 w-full md:w-auto">
                    {!isEditing ? (
                        <Button
                            onClick={() => setIsEditing(true)}
                            className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-xl"
                        >
                            Edit Profile
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(false)}
                            variant="secondary"
                            className="px-6 py-2 rounded-xl border border-gray-700"
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        onClick={logout}
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-6 py-2 rounded-xl flex items-center gap-2 justify-center"
                    >
                        <LogOut size={16} />
                        Logout
                    </Button>
                </div>
            </div>

            {successMessage && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <Check size={20} />
                    <span className="font-medium">{successMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Info Card */}
                <Card className="p-8 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <User className="text-primary" size={20} />
                        Personal Details
                    </h2>

                    <form className="space-y-4">
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
                            value={user?.createdAt ? format(new Date(user.createdAt), 'MMMM dd, yyyy') : '-'}
                            disabled={true}
                        />
                    </form>
                </Card>

                {/* Academic Info Card */}
                <Card className="p-8 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <GraduationCap className="text-primary" size={20} />
                        Academic Information
                    </h2>

                    <form className="space-y-4">
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
                <div className="flex justify-end pt-4">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-primary hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/20 min-w-[200px]"
                    >
                        {isSaving ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={20} />
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
        <div className="space-y-2">
            <label className="text-sm font-medium text-muted ml-0.5">{label}</label>
            <input
                type="text"
                value={value || ''}
                readOnly={disabled}
                onChange={onChange}
                className={`w-full bg-surface border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${disabled
                    ? "border-gray-800 text-muted cursor-not-allowed"
                    : "border-gray-700 focus:border-primary ring-2 ring-transparent focus:ring-primary/10"
                    }`}
            />
        </div>
    );
}
