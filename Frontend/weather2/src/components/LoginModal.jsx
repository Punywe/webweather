import React, { useState, useEffect } from 'react';
import { X, Lock, User, LogIn, RefreshCw, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LoginModal = ({ isOpen, onClose, onOpenRegister, onLoginSuccess }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({ username: '', password: '' });

    // Reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setError('');
                setSuccess(false);
                setForm({ username: '', password: '' });
                setShowPassword(false);
            }, 300);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleLogin = async () => {
        if (!form.username || !form.password) {
            setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:8000/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: form.username, password: form.password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'เกิดข้อผิดพลาด');
            setSuccess(true);
            if (data.user.role === 'admin') {
                // admin -> ไปหน้า addnode
                setTimeout(() => {
                    onClose();
                    navigate('/addnode');
                }, 1000);
            } else {
                // user ทั่วไป
                if (onLoginSuccess) onLoginSuccess(data.user);
                setTimeout(() => onClose(), 1800);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleLogin();
    };

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative bg-[#1E293B] border border-[#334155]/60 rounded-2xl shadow-2xl w-full max-w-sm z-10 overflow-hidden">

                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-blue-600/30 to-indigo-600/20 px-6 pt-6 pb-5 border-b border-[#334155]/50">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {success ? 'เข้าสู่ระบบสำเร็จ!' : 'เข้าสู่ระบบ'}
                            </h2>
                            <p className="text-gray-400 text-sm mt-0.5">
                                {success ? 'ยินดีต้อนรับกลับมา!' : 'กรอกข้อมูลเพื่อเข้าสู่ระบบ'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                    {/* SUCCESS STATE */}
                    {success && (
                        <div className="flex flex-col items-center justify-center py-6 gap-4">
                            <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <CheckCircle size={48} className="text-blue-400" />
                            </div>
                            <p className="text-gray-300 text-center">หน้าต่างนี้จะปิดโดยอัตโนมัติ...</p>
                        </div>
                    )}

                    {/* LOGIN FORM */}
                    {!success && (
                        <div className="flex flex-col gap-4">
                            {/* Username */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <User size={14} className="text-blue-400" />
                                    Username
                                </label>
                                <input
                                    id="login-username"
                                    name="username"
                                    type="text"
                                    value={form.username}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="กรอก Username"
                                    autoComplete="username"
                                    className="w-full bg-[#0F172A] text-white px-4 py-2.5 rounded-lg border border-[#334155] outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600 text-sm"
                                />
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Lock size={14} className="text-blue-400" />
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="login-password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="กรอก Password"
                                        autoComplete="current-password"
                                        className="w-full bg-[#0F172A] text-white px-4 py-2.5 pr-11 rounded-lg border border-[#334155] outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                                    {error}
                                </p>
                            )}

                            <button
                                id="login-submit"
                                onClick={handleLogin}
                                disabled={loading}
                                className="w-full mt-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-all shadow-md flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <RefreshCw size={18} className="animate-spin" />
                                ) : (
                                    <><LogIn size={16} /> เข้าสู่ระบบ</>
                                )}
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-3 my-1">
                                <div className="flex-1 h-px bg-[#334155]" />
                                <span className="text-gray-500 text-xs">หรือ</span>
                                <div className="flex-1 h-px bg-[#334155]" />
                            </div>

                            {/* Switch to Register */}
                            <p className="text-center text-sm text-gray-400">
                                ยังไม่มีบัญชี?{' '}
                                <button
                                    id="switch-to-register"
                                    onClick={() => { onClose(); onOpenRegister(); }}
                                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors underline underline-offset-2"
                                >
                                    สมัครสมาชิก
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
