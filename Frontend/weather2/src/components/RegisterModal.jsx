import React, { useState, useRef, useEffect } from 'react';
import { X, Mail, Lock, User, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';

export const RegisterModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1); // 1 = form, 2 = otp
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setStep(1);
                setError('');
                setSuccess(false);
                setOtp(['', '', '', '', '', '']);
                setForm({ username: '', email: '', password: '', confirmPassword: '' });
            }, 300);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFormChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSendOTP = async () => {
        if (!form.username || !form.email || !form.password || !form.confirmPassword) {
            setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/register/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'เกิดข้อผิดพลาด');
            setStep(2);
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setError('');
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpValue = parseInt(otp.join(''), 10);
        if (otp.some(d => d === '')) {
            setError('กรุณากรอก OTP ให้ครบ 6 หลัก');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/register/verify-and-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: form.username,
                    password: form.password,
                    email: form.email,
                    otp: otpValue,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'เกิดข้อผิดพลาด');
            setSuccess(true);
            setTimeout(() => onClose(), 2500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setOtp(['', '', '', '', '', '']);
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/register/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'เกิดข้อผิดพลาด');
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative bg-[#1E293B] border border-[#334155]/60 rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
                
                {/* Gradient Header */}
                <div className="bg-linear-to-r from-blue-600/30 to-emerald-600/20 px-6 pt-6 pb-4 border-b border-[#334155]/50">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {success ? 'สมัครสมาชิกสำเร็จ!' : step === 1 ? 'สมัครสมาชิก' : 'ยืนยัน Email'}
                            </h2>
                            <p className="text-gray-400 text-sm mt-0.5">
                                {success ? 'ยินดีต้อนรับสู่ Weather Station!' : step === 1 ? 'กรอกข้อมูลเพื่อสร้างบัญชีใหม่' : `ส่ง OTP ไปยัง ${form.email}`}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Step indicator */}
                    {!success && (
                        <div className="flex gap-2 mt-4">
                            <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-blue-500' : 'bg-[#334155]'}`} />
                            <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-emerald-500' : 'bg-[#334155]'}`} />
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                    {/* SUCCESS STATE */}
                    {success && (
                        <div className="flex flex-col items-center justify-center py-6 gap-4">
                            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle size={48} className="text-emerald-400" />
                            </div>
                            <p className="text-gray-300 text-center">หน้าต่างนี้จะปิดโดยอัตโนมัติ...</p>
                        </div>
                    )}

                    {/* STEP 1 — FORM */}
                    {!success && step === 1 && (
                        <div className="flex flex-col gap-4">
                            {/* Username */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <User size={14} className="text-blue-400" />
                                    Username
                                </label>
                                <input
                                    name="username"
                                    type="text"
                                    value={form.username}
                                    onChange={handleFormChange}
                                    placeholder="กรอก Username"
                                    className="w-full bg-[#0F172A] text-white px-4 py-2.5 rounded-lg border border-[#334155] outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600 text-sm"
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Mail size={14} className="text-blue-400" />
                                    Email
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleFormChange}
                                    placeholder="กรอก Email"
                                    className="w-full bg-[#0F172A] text-white px-4 py-2.5 rounded-lg border border-[#334155] outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600 text-sm"
                                />
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Lock size={14} className="text-blue-400" />
                                    Password
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    value={form.password}
                                    onChange={handleFormChange}
                                    placeholder="กรอก Password"
                                    className="w-full bg-[#0F172A] text-white px-4 py-2.5 rounded-lg border border-[#334155] outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600 text-sm"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Lock size={14} className="text-emerald-400" />
                                    ยืนยัน Password
                                </label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    value={form.confirmPassword}
                                    onChange={handleFormChange}
                                    placeholder="กรอก Password อีกครั้ง"
                                    className="w-full bg-[#0F172A] text-white px-4 py-2.5 rounded-lg border border-[#334155] outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600 text-sm"
                                />
                            </div>

                            {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{error}</p>}

                            <button
                                onClick={handleSendOTP}
                                disabled={loading}
                                className="w-full mt-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-all shadow-md flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <RefreshCw size={18} className="animate-spin" />
                                ) : (
                                    <>ส่ง OTP <ArrowRight size={16} /></>
                                )}
                            </button>
                        </div>
                    )}

                    {/* STEP 2 — OTP */}
                    {!success && step === 2 && (
                        <div className="flex flex-col gap-6">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                                    <Mail size={32} className="text-blue-400" />
                                </div>
                                <p className="text-gray-300 text-sm">กรุณาตรวจสอบอีเมลและกรอกรหัส OTP 6 หลัก</p>
                            </div>

                            {/* OTP Input boxes */}
                            <div className="flex justify-center gap-3">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={el => otpRefs.current[index] = el}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        className="w-11 h-13 text-center text-xl font-bold bg-[#0F172A] text-white border border-[#334155] rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                ))}
                            </div>

                            {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 text-center">{error}</p>}

                            <button
                                onClick={handleVerify}
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-all shadow-md flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <RefreshCw size={18} className="animate-spin" />
                                ) : (
                                    <>ยืนยันและสมัครสมาชิก <CheckCircle size={16}/></>
                                )}
                            </button>

                            <div className="flex items-center justify-between text-sm">
                                <button
                                    onClick={() => { setStep(1); setError(''); setOtp(['','','','','','']); }}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    ← แก้ไขข้อมูล
                                </button>
                                <button
                                    onClick={handleResendOTP}
                                    disabled={loading}
                                    className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    <RefreshCw size={13} /> ส่ง OTP อีกครั้ง
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
