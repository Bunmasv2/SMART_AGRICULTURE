import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await authService.login({ email, password });
            localStorage.setItem('user', JSON.stringify(data.data));
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại');
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
                        alt="Desktop view" 
                        className="max-w-md w-full rounded-2xl shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500"
                    />
                </div>
            </div>

            {/* Right Side - Form Area */}
            <div className="w-full lg:w-1/2 bg-[#1a4d2e] flex flex-col justify-center px-8 lg:px-24 py-12 text-white">
                <div className="max-w-md w-full mx-auto space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
                            Hệ thống quản lý nông trại thông minh.
                        </h1>
                        <p className="text-[#a8c69f] text-sm">
                            Giải pháp công nghệ tiên tiến cho nông nghiệp hiện đại.
                        </p>
                    </div>

                    <div className="flex gap-8 border-b border-[#2c5d3d] pb-2 text-sm font-medium">
                        <Link to="/login" className="text-white border-b-2 border-white pb-2">Đăng nhập</Link>
                        <Link to="/register" className="text-[#a8c69f] hover:text-white pb-2">Đăng ký</Link>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">{error}</div>}
                        
                        <div className="space-y-4">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#2c5d3d] border-none rounded-lg px-4 py-3 text-white placeholder-[#a8c69f] focus:ring-2 focus:ring-[#4ade80] outline-none transition-all"
                                placeholder="Địa chỉ Email"
                            />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#2c5d3d] border-none rounded-lg px-4 py-3 text-white placeholder-[#a8c69f] focus:ring-2 focus:ring-[#4ade80] outline-none transition-all"
                                placeholder="Mật khẩu"
                            />
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-[#2c5d3d] bg-[#2c5d3d] text-[#4ade80] focus:ring-0 focus:ring-offset-0" />
                                <span className="text-[#a8c69f]">Ghi nhớ đăng nhập</span>
                            </label>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-[#1a4d2e] font-bold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50"
                            >
                                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </button>
                        </div>
                    </form>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-4 text-xs font-semibold text-[#a0acb9]">
                            <span>Or login with</span>
                            <div className="flex gap-4">
                                <a href="#" className="hover:text-white">Facebook</a>
                                <a href="#" className="hover:text-white">Google</a>
                                <a href="#" className="hover:text-white">Linkedin</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
