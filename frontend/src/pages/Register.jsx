import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SiteNexLogo from '../assets/logo.png';
import VideoBackground from '../components/VideoBackground';
import { toast } from 'react-toastify';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        userRole: 'SITE_ENGINEER',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters!");
            return;
        }
        setLoading(true);
        try {
            const data = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                userRole: formData.userRole,
            });
            if (data.success) {
                toast.success("Account created successfully!");
                navigate('/');
            }
        } catch (error) {
            const msg = error.response?.data?.message || "Registration failed. Please try again.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <VideoBackground>
            {/* Header Section */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center flex-col items-center text-center">
                    <img
                        src={SiteNexLogo}
                        alt="SiteNex Logo"
                        className="h-24 w-auto mb-6 drop-shadow-2xl"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <h2 className="text-4xl font-bold text-white tracking-wide drop-shadow-lg">
                        Join SiteNex
                    </h2>
                    <p className="mt-3 text-gray-300 text-sm tracking-wide">
                        Create your account
                    </p>
                </div>
            </div>

            {/* Register Card */}
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
                    <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Create Account</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="John Doe"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-steel-blue/40 focus:border-steel-blue outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="your@email.com"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-steel-blue/40 focus:border-steel-blue outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
                            <select
                                name="userRole"
                                value={formData.userRole}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-steel-blue/40 focus:border-steel-blue outline-none transition-all"
                            >
                                <option value="PROJECT_MANAGER">Project Manager</option>
                                <option value="SITE_ENGINEER">Site Engineer</option>
                                <option value="ASSISTANT_ENGINEER">Assistant Engineer</option>
                                <option value="STORE_KEEPER">Store Keeper</option>
                                <option value="SAFETY_OFFICER">Safety Officer</option>
                                <option value="WORKER">Worker</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-steel-blue/40 focus:border-steel-blue outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-steel-blue/40 focus:border-steel-blue outline-none transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-steel-blue hover:bg-steel-blue/90 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-steel-blue hover:underline font-semibold">Sign In</Link>
                    </p>
                </div>
            </div>
        </VideoBackground>
    );
};

export default Register;
