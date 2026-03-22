import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const VerifyEmail: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || '';
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authService.verify({ email, code });
            setSuccess('Xác thực thành công! Đang chuyển hướng đến trang đăng nhập...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Mã xác nhận không hợp lệ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen font-sans">
            {/* Left Side - Image/Logo Area */}
            <div className="hidden w-1/2 bg-white lg:flex items-center justify-center relative p-12 overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <img 
                      src="/auth_left_bg.png" 
                      alt="Background" 
                      className="w-full h-full object-cover"
                    />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-8 uppercase tracking-widest">
                        <div className="w-10 h-10 bg-[#2c9b4e] rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                            <span className="text-white">S</span>
                        </div>
                        <span className="text-3xl font-bold text-[#1a4d2e] tracking-tight">SmartFarm</span>
                    </div>
                    <img 
                        src="/auth_left_bg.png" 
                        alt="Verification" 
                        className="max-w-md w-full rounded-2xl shadow-2xl transition-transform duration-500"
                    />
                </div>
            </div>

            {/* Right Side - Form Area */}
            <div className="w-full lg:w-1/2 bg-[#1a4d2e] flex flex-col justify-center px-8 lg:px-24 py-12 text-white">
                <div className="max-w-md w-full mx-auto space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
                            Xác thực địa chỉ Email.
                        </h1>
                        <p className="text-[#a8c69f] text-sm">
                            Chúng tôi đã gửi mã xác nhận 6 chữ số đến <b>{email}</b>.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">{error}</div>}
                        {success && <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-400">{success}</div>}
                        
                        <div>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full bg-[#2c5d3d] border-none rounded-lg px-4 py-4 text-white text-center text-2xl font-bold tracking-[0.5em] placeholder-[#5d6e7e] focus:ring-2 focus:ring-[#4ade80] outline-none transition-all"
                                placeholder="000000"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || !code}
                                className="w-full bg-white text-[#1a4d2e] font-bold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50"
                            >
                                {loading ? 'Đang xác thực...' : 'Xác thực Email'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
