import {
    CloudIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    MapPinIcon,
    CpuChipIcon,
    CalendarDaysIcon,
    SparklesIcon,
    SunIcon,
    Bars3Icon,
    EyeDropperIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ─── Types ─────────────────────────────────────────────────────────────────
interface WeatherCurrent {
    temperature_2m: number;
    precipitation_probability: number;
    weathercode: number;
    windspeed_10m: number;
    relative_humidity_2m: number;
    precipitation: number;
}

interface WeatherData {
    current: WeatherCurrent;
}

interface AlertDto {
    alertId: number;
    pBatchId: number;
    batchName: string;
    alertType: string;
    description: string;
    createdAt: string;
}

interface DashboardWeather {
    batchId: number;
    batchName: string;
    locationCoords: string;
    weather: WeatherData | null;
    recentAlerts: AlertDto[];
}

interface BatchDto {
    pBatchId: number;
    batchName: string;
    cropName: string;
    startDate: string;
}

interface AiAnalysisDto {
    analysisId: number;
    batchName: string;
    resultJson: string;
    createdAt: string;
}

// ─── Alert display config ───────────────────────────────────────────────────
const ALERT_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
    STORM: { icon: '⛈️', color: 'text-red-600 bg-red-50 border-red-200', label: 'Giông bão' },
    RAIN_RISK: { icon: '🌧️', color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'Nguy cơ mưa' },
    HIGH_TEMP: { icon: '🌡️', color: 'text-orange-600 bg-orange-50 border-orange-200', label: 'Nhiệt độ cao' },
    LOW_TEMP: { icon: '❄️', color: 'text-cyan-600 bg-cyan-50 border-cyan-200', label: 'Nhiệt độ thấp' },
    STRONG_WIND: { icon: '💨', color: 'text-purple-600 bg-purple-50 border-purple-200', label: 'Gió mạnh' },
    HIGH_HUMIDITY: { icon: '💧', color: 'text-teal-600 bg-teal-50 border-teal-200', label: 'Độ ẩm cao' },
};

/** Return WMO weather code as Vietnamese description */
function weatherCodeToText(code: number | undefined): string {
    if (code === undefined) return 'Không xác định';
    if (code === 0) return 'Trời quang';
    if (code <= 3) return 'Nhiều mây';
    if (code <= 9) return 'Sương mù nhẹ';
    if (code <= 19) return 'Mưa phùn';
    if (code <= 29) return 'Mưa rào';
    if (code <= 39) return 'Tuyết';
    if (code <= 49) return 'Sương mù';
    if (code <= 59) return 'Mưa phùn';
    if (code <= 69) return 'Mưa vừa đến to';
    if (code <= 79) return 'Tuyết';
    if (code <= 84) return 'Mưa rào';
    if (code <= 94) return 'Tuyết rào';
    return 'Giông bão';
}

/** Gradient color of weather widget based on conditions */
function weatherGradient(code: number | undefined, temp: number | undefined): string {
    if (code !== undefined && code >= 95) return 'from-slate-700 to-slate-900';
    if (code !== undefined && code >= 61) return 'from-blue-600 to-indigo-700';
    if (temp !== undefined && temp >= 35) return 'from-orange-500 to-rose-600';
    if (temp !== undefined && temp <= 15) return 'from-cyan-500 to-blue-600';
    return 'from-blue-500 to-blue-600';
}

const API_BASE = 'http://localhost:8080/api';

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export default function SmartFarmDashboard() {
    const navigate = useNavigate();
    const [dashData, setDashData] = useState<DashboardWeather | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const [batches, setBatches] = useState<BatchDto[]>([]);
    const [taskCount, setTaskCount] = useState<number>(0);
    const [analyses, setAnalyses] = useState<AiAnalysisDto[]>([]);

    const fetchWeather = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`${API_BASE}/weather-alerts/latest-weather`);
            const json = await res.json();
            if (res.ok && json.data) {
                console.log(json.data)
                setDashData(json.data as DashboardWeather);
            } else {
                setError(json.message ?? 'Không lấy được dữ liệu thời tiết');
            }
        } catch (e) {
            setError('Không kết nối được với server. Vui lòng kiểm tra backend.');
        } finally {
            setLoading(false);
            setLastRefresh(new Date());
        }
    };

    const fetchOtherData = async () => {
        try {
            const [bRes, tRes, aRes] = await Promise.all([
                axios.get(`${API_BASE}/planting-batches?status=ACTIVE`),
                axios.get(`${API_BASE}/tasks?status=PENDING`),
                axios.get(`${API_BASE}/ai-analyses`)
            ]);
            setBatches(bRes.data?.data || []);
            setTaskCount((tRes.data?.data || []).length);
            const rawAnalyses = aRes.data?.data || [];
            rawAnalyses.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setAnalyses(rawAnalyses.slice(0, 2));
        } catch (e) {
            console.error("Fetch other data error", e);
        }
    };

    useEffect(() => {
        fetchWeather();
        fetchOtherData();
        // Refresh mỗi 30 phút (khớp với scheduler backend)
        const interval = setInterval(() => {
            fetchWeather();
            fetchOtherData();
        }, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // WebSocket Connection
    useEffect(() => {
        const client = new Client({
            brokerURL: 'ws://localhost:8080/ws',
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('🟢 Đã kết nối STOMP WebSocket!');
                // Subscribe channel cảnh báo thời tiết
                client.subscribe('/topic/weather-alerts', (message) => {
                    if (message.body) {
                        const newAlert: AlertDto = JSON.parse(message.body);
                        console.log('🔔 Có cảnh báo thời tiết mới nhất:', newAlert);

                        setDashData((prevData) => {
                            if (!prevData) return prevData;

                            // Kiểm tra xem Id alert này đã tồn tại chưa để tránh bị duplicate
                            const isExisting = prevData.recentAlerts.some(a => a.alertId === newAlert.alertId);
                            if (isExisting) return prevData;

                            return {
                                ...prevData,
                                recentAlerts: [newAlert, ...prevData.recentAlerts].slice(0, 15) // Lưu trữ tối đa 15 cảnh báo mới
                            };
                        });
                    }
                });
            },
            onStompError: (frame) => {
                console.error('❌ STOMP error', frame);
            },
            onWebSocketError: (event) => {
                console.error('❌ WebSocket error', event);
            }
        });

        client.activate();

        return () => {
            console.log('🔴 Ngắt kết nối STOMP Websocket...');
            client.deactivate();
        };
    }, []);

    const w = dashData?.weather?.current;
    const alerts = dashData?.recentAlerts ?? [];
    const grad = weatherGradient(w?.weathercode, w?.temperature_2m);

    return (
        <div className="min-h-screen bg-[#f8faf7] p-4 md:p-8 text-slate-900 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-lime-500 w-2 h-2 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold uppercase tracking-wider text-lime-700">Live Farm Data</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-800">
                            Citus<span className="text-[#2c9b4e]">Hub</span>
                        </h1>
                        <p className="text-slate-500 font-medium">Hệ thống quản trị vườn Chanh Không Hạt • Niên vụ 2026</p>
                    </div>

                    <div className="flex gap-3 items-center">
                        <span className="text-xs text-slate-400">
                            Cập nhật: {lastRefresh.toLocaleTimeString('vi-VN')}
                        </span>
                        <button
                            onClick={fetchWeather}
                            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                            title="Làm mới thời tiết"
                        >
                            <CalendarDaysIcon className="h-6 w-6 text-slate-600" />
                        </button>
                        <button
                            onClick={() => navigate('/crops')}
                            className="bg-[#2c9b4e] hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-green-200 flex items-center gap-2 active:scale-95">
                            <span>+ Thêm Giống Cây</span>
                        </button>
                    </div>
                </header>

                {/* Main Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Weather Widget */}
                    <div className={`md:col-span-8 bg-gradient-to-br ${grad} rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-100 transition-all duration-700`}>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between h-full gap-6">
                            {/* Left: current weather */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 bg-white/20 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/30">
                                    <MapPinIcon className="h-4 w-4" />
                                    <span className="text-sm font-semibold uppercase tracking-wide">
                                        {loading
                                            ? 'Đang tải...'
                                            : dashData
                                                ? `Lô: ${dashData.batchName}`
                                                : 'Chưa có dữ liệu'}
                                    </span>
                                </div>

                                {loading ? (
                                    <div className="flex items-center gap-4 animate-pulse">
                                        <div className="w-32 h-20 bg-white/20 rounded-2xl" />
                                    </div>
                                ) : error ? (
                                    <div className="bg-white/10 rounded-2xl p-4">
                                        <p className="text-red-200 font-semibold">⚠️ {error}</p>
                                    </div>
                                ) : w ? (
                                    <>
                                        <div>
                                            <div className="flex items-center gap-4">
                                                <h2 className="text-7xl font-black">{Math.round(w.temperature_2m)}°C</h2>
                                                {w.weathercode >= 95 ? <span className="text-6xl">⛈️</span>
                                                    : w.weathercode >= 61 ? <CloudIcon className="h-16 w-16 opacity-80" />
                                                        : w.temperature_2m >= 35 ? <SunIcon className="h-16 w-16 opacity-80" />
                                                            : <CloudIcon className="h-16 w-16 opacity-80" />}
                                            </div>
                                            <p className="text-blue-100 text-lg font-medium mt-2">
                                                {weatherCodeToText(w.weathercode)} • Độ ẩm: {w.relative_humidity_2m}%
                                            </p>
                                        </div>

                                        {/* Stats row */}
                                        <div className="flex gap-4 flex-wrap">
                                            <WeatherStat icon={<Bars3Icon className="h-4 w-4" />} label="Gió" value={`${Math.round(w.windspeed_10m ?? 0)} km/h`} />
                                            <WeatherStat icon={<EyeDropperIcon className="h-4 w-4" />} label="Xác suất mưa" value={`${w.precipitation_probability ?? 0}%`} />
                                            <WeatherStat icon={<CloudIcon className="h-4 w-4" />} label="Lượng mưa" value={`${w.precipitation ?? 0} mm`} />
                                        </div>
                                    </>
                                ) : null}
                            </div>

                            {/* Right: Alert panel */}
                            <div className="md:w-1/2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col justify-start gap-3 overflow-y-auto max-h-72">
                                {loading ? (
                                    <p className="text-white/60 text-sm animate-pulse">Đang tải cảnh báo...</p>
                                ) : alerts.length === 0 ? (
                                    <div className="flex items-start gap-3 h-full items-center">
                                        <CheckCircleIcon className="h-6 w-6 text-green-300 shrink-0" />
                                        <div>
                                            <p className="font-bold text-white">Thời tiết ổn định</p>
                                            <p className="text-sm text-blue-100 mt-1">
                                                Không có cảnh báo thời tiết nào trong 30 phút gần nhất.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    alerts.map((alert) => {
                                        const cfg = ALERT_CONFIG[alert.alertType] ?? {
                                            icon: '⚠️', color: '', label: alert.alertType,
                                        };
                                        return (
                                            <div key={alert.alertId} className="flex items-start gap-2">
                                                <span className="text-lg mt-0.5 shrink-0">{cfg.icon}</span>
                                                <div>
                                                    <p className="font-bold text-white text-sm">{cfg.label}</p>
                                                    <p className="text-xs text-blue-100 leading-relaxed mt-0.5 line-clamp-3">
                                                        {alert.description}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                    </div>

                    {/* Quick Stats */}
                    <div className="md:col-span-4 grid grid-cols-2 gap-4">
                        <QuickStat value={batches.length < 10 ? '0' + batches.length : String(batches.length)} label="Lô Trồng" icon={<MapPinIcon />} color="green" />
                        <QuickStat value={taskCount < 10 ? '0' + taskCount : String(taskCount)} label="Nhiệm vụ" icon={<CheckCircleIcon />} color="blue" />
                        <QuickStat
                            value={alerts.length > 0 ? String(alerts.length) : '0'}
                            label="Cảnh báo TT"
                            icon={<ExclamationTriangleIcon />}
                            color={alerts.length > 0 ? 'red' : 'green'}
                        />
                        <QuickStat value={analyses.length > 0 ? String(analyses.length) : '0'} label="Báo cáo AI" icon={<CpuChipIcon />} color="red" />
                    </div>

                    {/* Plots Progress */}
                    <div className="md:col-span-7 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Trạng thái Sinh trưởng</h3>
                            <button className="text-sm font-bold text-[#2c9b4e] hover:underline">Chi tiết tất cả</button>
                        </div>
                        <div className="space-y-6">
                            {batches.length > 0 ? batches.slice(0, 4).map(b => {
                                const start = new Date(b.startDate);
                                const current = new Date();
                                const days = Math.floor((current.getTime() - start.getTime()) / (1000 * 3600 * 24));
                                const progress = Math.min(Math.max((days / 90) * 100, 5), 100);
                                return (
                                    <PlotItem
                                        key={b.pBatchId}
                                        name={`Lô ${b.pBatchId < 10 ? '0' + b.pBatchId : b.pBatchId} - ${b.batchName}`}
                                        stage={`${days > 0 ? days : 0} ngày tuổi`}
                                        progress={progress}
                                        health={progress > 80 ? 'medium' : 'high'}
                                        onClick={() => navigate(`/batches/${b.pBatchId}`)}
                                    />
                                );
                            }) : (
                                <p className="text-sm text-slate-400 font-medium italic">Không có Lô trồng nào đang hoạt động</p>
                            )}
                        </div>
                    </div>

                    {/* AI Insights Card */}
                    <div className="md:col-span-5 bg-[#1a2e1d] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-lime-400 mb-6">
                                <SparklesIcon className="h-6 w-6" />
                                <h3 className="text-lg font-bold tracking-tight italic">AI Assistant Insight</h3>
                            </div>
                            <div className="space-y-5">
                                {analyses.length > 0 ? analyses.map(ai => {
                                    let msg: React.ReactNode = <span className="underline decoration-lime-500">{ai.resultJson || 'Đã phân tích'}</span>;
                                    try {
                                        const parsed = JSON.parse(ai.resultJson);
                                        // Attempt to extract helpful properties
                                        if (parsed.disease_class || parsed.care_recommendation) {
                                            msg = (
                                                <div className="mt-1">
                                                    {parsed.disease_class && <span className="text-lime-300 font-bold bg-lime-900/40 px-2 py-0.5 rounded-md inline-block mb-1">{parsed.disease_class}</span>}
                                                    {parsed.care_recommendation && <span className="block text-xs text-lime-200/80 italic line-clamp-2">{parsed.care_recommendation}</span>}
                                                </div>
                                            );
                                        } else {
                                            const txt = parsed.disease || parsed.label || parsed.analysis || parsed.recommendation || ai.resultJson;
                                            msg = <span className="underline decoration-lime-500">{String(txt)}</span>;
                                        }
                                    } catch (e) {
                                        // Just use string if not json
                                    }

                                    const d = new Date(ai.createdAt);
                                    return (
                                        <div key={ai.analysisId} onClick={() => navigate('/ai-assistant')} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                                            <div className="text-sm text-lime-100 leading-relaxed font-medium">
                                                <span className="text-lime-400 font-bold group-hover:text-lime-300">● Lô: {ai.batchName}</span> <span className="text-xs opacity-70">({d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})</span>
                                                {msg}
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer">
                                        <p className="text-sm text-lime-100 leading-relaxed font-medium">
                                            Chưa có dữ liệu phân tích sức khỏe cho vườn của bạn.
                                        </p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => navigate('/ai-assistant')}
                                className="mt-6 w-full py-3 bg-lime-500 hover:bg-lime-400 text-green-950 rounded-xl font-black transition-all shadow-lg shadow-lime-900/20 active:scale-95">
                                XEM CHIẾN LƯỢC CHĂM SÓC
                            </button>
                        </div>
                        {/* Matrix-like decorative bg */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                            <div className="text-[10px] font-mono leading-none break-all">
                                {Array(20).fill("0101110010101010111010").join(" ")}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function WeatherStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
            <span className="opacity-80">{icon}</span>
            <span className="text-xs font-semibold">{label}:</span>
            <span className="text-xs font-bold">{value}</span>
        </div>
    );
}

interface QuickStatProps {
    value: string;
    label: string;
    icon: React.ReactElement<{ className?: string }>;
    color: 'green' | 'blue' | 'yellow' | 'red';
}

function QuickStat({ value, label, icon, color }: QuickStatProps) {
    const colors = {
        green: "bg-green-50 text-green-600 border-green-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        yellow: "bg-orange-50 text-orange-600 border-orange-100",
        red: "bg-red-50 text-red-600 border-red-100",
    };

    return (
        <div className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-${color}-200 transition-all hover:shadow-lg`}>
            <div className={`p-3 rounded-2xl mb-3 transition-transform group-hover:scale-110 ${colors[color]}`}>
                {React.cloneElement(icon, { className: "h-6 w-6" })}
            </div>
            <p className="text-2xl font-black text-slate-800">{value}</p>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">{label}</p>
        </div>
    );
}

interface PlotItemProps {
    name: string;
    stage: string;
    progress: number;
    health: 'high' | 'medium' | string;
    onClick?: () => void;
}

function PlotItem({ name, stage, progress, health, onClick }: PlotItemProps) {
    return (
        <div className="group cursor-pointer" onClick={onClick}>
            <div className="flex justify-between items-end mb-2 px-1">
                <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-[#2c9b4e] transition-colors">{name}</h4>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">Giai đoạn: {stage}</p>
                </div>
                <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${health === 'high' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {health === 'high' ? '• Ổn định' : '• Cần chú ý'}
                </div>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner border border-slate-50">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${health === 'high' ? 'bg-gradient-to-r from-green-400 to-[#2c9b4e]' : 'bg-gradient-to-r from-yellow-300 to-orange-400'}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
}