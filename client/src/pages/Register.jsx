import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MotionWrapper } from '../components/ui/MotionWrapper';
import { UserPlus, Mail, Lock, Phone, GraduationCap, Building2, Calendar, User, AlertCircle, Camera } from 'lucide-react';
import defaultAvatar from './img/photo1.jpg';

export default function Register() {
    const { register, error, loading } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        college: '',
        department: '',
        year: '',
        avatarUrl: ''
    });

    const [localError, setLocalError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setLocalError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setLocalError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setLocalError("Password must be at least 6 characters");
            return;
        }

        const { confirmPassword, ...registerData } = formData;
        const finalData = {
            ...registerData,
            avatarUrl: registerData.avatarUrl || defaultAvatar
        };

        const success = await register(finalData);
        if (success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-background p-6 flex items-center justify-center py-12">
            <MotionWrapper className="w-full max-w-2xl">
                <Card className="p-8 space-y-8">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <UserPlus size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Create Account</h1>
                        <p className="text-muted">Join the community and start tracking your success.</p>
                    </div>

                    {(error || localError) && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 text-sm">
                            <AlertCircle size={18} />
                            <span>{localError || error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Details */}
                            <div className="space-y-4 col-span-full">
                                <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">Personal Information</h3>
                            </div>

                            <Field label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} icon={<User size={18} />} placeholder="Durai" required />
                            <Field label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} icon={<Mail size={18} />} placeholder="your@email.com" required />
                            <Field label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} icon={<Phone size={18} />} placeholder="9876543210" required />
                            <Field label="Avatar URL (Optional)" name="avatarUrl" value={formData.avatarUrl} onChange={handleChange} icon={<Camera size={18} />} placeholder="https://..." />

                            {/* Academic Details */}
                            <div className="space-y-4 col-span-full pt-4">
                                <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">Academic Details</h3>
                            </div>

                            <Field label="College Name" name="college" value={formData.college} onChange={handleChange} icon={<GraduationCap size={18} />} placeholder="Example University" required />
                            <Field label="Department" name="department" value={formData.department} onChange={handleChange} icon={<Building2 size={18} />} placeholder="Computer Science" required />
                            <Field label="Current Year" name="year" value={formData.year} onChange={handleChange} icon={<Calendar size={18} />} placeholder="4th Year" required />

                            {/* Security */}
                            <div className="space-y-4 col-span-full pt-4">
                                <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">Security</h3>
                            </div>

                            <Field label="Password" name="password" type="password" value={formData.password} onChange={handleChange} icon={<Lock size={18} />} placeholder="••••••••" required />
                            <Field label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} icon={<Lock size={18} />} placeholder="••••••••" required />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                        >
                            {loading ? "Creating Account..." : "Join Now"}
                        </Button>
                    </form>

                    <div className="text-center">
                        <p className="text-muted text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:underline font-medium">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </Card>
            </MotionWrapper>
        </div>
    );
}

function Field({ label, name, icon, type = "text", ...props }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-muted ml-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                    {icon}
                </div>
                <input
                    name={name}
                    type={type}
                    className="w-full bg-surface border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                    {...props}
                />
            </div>
        </div>
    )
}
