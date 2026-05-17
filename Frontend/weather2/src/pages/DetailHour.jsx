import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ChevronLeft } from 'lucide-react';

const metrics = [
  { id: 'temp', label: 'อุณหภูมิ', unit: '°C', color: '#FCD34D', gradient: '#F59E0B' }, // Yellow/Orange
  { id: 'wind_speed', label: 'ความเร็วลม', unit: 'm/s', color: '#60A5FA', gradient: '#3B82F6' }, // Blue
  { id: 'humidity', label: 'ความชื้น', unit: '%', color: '#34D399', gradient: '#10B981' }, // Green
  { id: 'pressure', label: 'ความกดอากาศ', unit: 'hPa', color: '#A78BFA', gradient: '#8B5CF6' }, // Purple
  { id: 'light', label: 'แสงสว่าง', unit: 'lux', color: '#FBBF24', gradient: '#EAB308' }, // Yellow
];

const DetailHour = () => {
    const { node } = useParams();
    const [data, setData] = useState([]);
    const [currentData, setCurrentData] = useState(null);
    const [activeMetric, setActiveMetric] = useState('temp');
    const [loading, setLoading] = useState(true);

    // Calculate Heat Index (Feels Like)
    const calculateHeatIndex = (temp, humidity) => {
        if (!temp || !humidity) return temp;
        // Simple approximation for Heat Index in Celsius
        const c1 = -8.78469475556;
        const c2 = 1.61139411;
        const c3 = 2.33854883889;
        const c4 = -0.14611605;
        const c5 = -0.012308094;
        const c6 = -0.0164248277778;
        const c7 = 0.002211732;
        const c8 = 0.00072546;
        const c9 = -0.000003582;
        
        let hi = c1 + (c2 * temp) + (c3 * humidity) + (c4 * temp * humidity) + (c5 * temp * temp) + (c6 * humidity * humidity) + (c7 * temp * temp * humidity) + (c8 * temp * humidity * humidity) + (c9 * temp * temp * humidity * humidity);
        return Math.round(hi);
    };

    // Derived Data
    const feelsLike = currentData ? calculateHeatIndex(currentData.temp, currentData.humidity) : 0;
    const minTemp = data.length > 0 ? Math.min(...data.map(d => d.temp)) : 0;
    const maxTemp = data.length > 0 ? Math.max(...data.map(d => d.temp)) : 0;

    useEffect(() => {
        if (!node) return;
        setLoading(true);
        fetch(`/api/get24h/${node}`)
            .then(res => res.json())
            .then(result => {
                setData(result.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching hourly data:", err);
                setLoading(false);
            });

        // Fetch current data for the top card
        fetch(`/api/getDataNode/${node}`)
            .then(res => res.json())
            .then(result => {
                if (result.data && result.data.length > 0) {
                    setCurrentData(result.data[0]);
                }
            })
            .catch(err => console.error("Error fetching current data:", err));
    }, [node]);

    const currentMetric = metrics.find(m => m.id === activeMetric);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0F172A]/90 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-2xl min-w-[100px]">
                    <p className="text-gray-400 text-[10px] mb-1 font-bold uppercase tracking-widest">{label}</p>
                    <div className="flex items-end gap-1">
                        <p className="text-white font-bold text-2xl" style={{ color: currentMetric.color }}>
                            {payload[0].value}
                        </p>
                        <span className="text-sm font-bold text-gray-500 mb-1">{currentMetric.unit}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white font-outfit selection:bg-blue-500/30 overflow-x-hidden">
            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full"></div>
            </div>

            {/* Navbar */}
            <nav className="w-full h-20 border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-xl flex items-center px-8 sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </div>
                    <span className="font-bold uppercase tracking-widest text-xs hidden sm:block">Back to Dashboard</span>
                </Link>
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center max-w-[60%] sm:max-w-md pointer-events-none">
                    <h1 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 sm:gap-2">
                        <span className="hidden sm:inline">Station</span>
                        <span className="text-white bg-blue-500/20 px-2 sm:px-3 py-1 rounded-full border border-blue-500/20 truncate max-w-full pointer-events-auto">
                            {node}
                        </span>
                    </h1>
                </div>
            </nav>

            <main className="w-full max-w-6xl mx-auto px-4 py-8 relative z-10">
                {/* Current Weather Card */}
                {currentData && (
                    <div className="w-full bg-[#1E293B]/70 border border-white/5 rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-2xl backdrop-blur-xl">
                        {/* Top Header */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                            <div>
                                <h3 className="text-white font-bold text-lg sm:text-xl">สภาพอากาศปัจจุบัน</h3>
                                <p className="text-gray-400 text-sm font-semibold mt-1">
                                    {currentData.date_time ? currentData.date_time.split(' ')[1].substring(0, 5) : '--:--'}
                                </p>
                            </div>
                         
                        </div>

                        {/* Main Info */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-6 mb-8">
                            <div className="flex items-center gap-2 sm:gap-6 w-full sm:w-auto">
                                <div className="text-5xl sm:text-7xl drop-shadow-2xl">
                                    ⛅
                                </div>
                                <div className="flex items-start">
                                    <span className="text-5xl sm:text-7xl font-bold tracking-tighter text-white">{currentData.temp}</span>
                                    <span className="text-lg sm:text-3xl font-bold text-gray-300 mt-1 sm:mt-2 ml-1">°C</span>
                                </div>
                            </div>
                            <div className="flex flex-col ml-1 sm:ml-0 mt-2 sm:mt-0">
                                <span className="text-base sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">มีสภาพอากาศปกติ</span>
                                <span className="text-xs sm:text-sm font-bold text-gray-400">ราวๆ {Math.round(currentData.temp + 1)}°</span>
                            </div>
                        </div>

                        <p className="text-white font-bold text-sm sm:text-base mb-6">
                            ข้อมูลอ้างอิงจากสถานีตรวจวัด {node}. อุณหภูมิปัจจุบันคือ {currentData.temp}°C
                        </p>

                        {/* Divider */}
                        <div className="w-full h-px bg-white/10 mb-6"></div>

                        {/* Metrics Row */}
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    ลม ⓘ
                                </div>
                                <div className="flex items-center gap-2 text-white font-bold text-sm">
                                    {currentData.wind_speed} กม./ชม. 
                                    <span style={{ transform: `rotate(${currentData.wind_dir && currentData.wind_dir !== '--' ? currentData.wind_dir : 0}deg)` }} className="text-gray-400 text-xs inline-block">
                                        ➤
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    ความชื้น ⓘ
                                </div>
                                <div className="flex items-center gap-1 text-white font-bold text-sm">
                                    {currentData.humidity}%
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    ความกดอากาศ ⓘ
                                </div>
                                <div className="flex items-center gap-1 text-white font-bold text-sm">
                                    {currentData.pressure} hPa
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    แสงสว่าง ⓘ
                                </div>
                                <div className="flex items-center gap-1 text-white font-bold text-sm">
                                    {currentData.light} lux
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    ปริมาณฝน (1ชม.) ⓘ
                                </div>
                                <div className="flex items-center gap-1 text-white font-bold text-sm">
                                    {currentData.rain_1h} มม.
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    ลมกระโชก ⓘ
                                </div>
                                <div className="flex items-center gap-1 text-white font-bold text-sm">
                                    {currentData.wind_gust} m/s
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Title Section */}
                <div className="flex items-center gap-3 mb-8 px-2">
                    <div className="w-1.5 h-8 bg-[#FCD34D] rounded-full"></div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">รายชั่วโมง</h2>
                </div>

                {/* Main Card */}
                <div className="w-full msn-glass rounded-[2rem] p-6 sm:p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                    
                    {/* Tabs Area */}
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-6 mb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                        {metrics.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setActiveMetric(m.id)}
                                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                                    activeMetric === m.id
                                        ? 'bg-[#FCD34D] text-[#0F172A] shadow-[0_5px_15px_rgba(252,211,77,0.3)] scale-105'
                                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                                }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>

                    {/* Chart Container */}
                    <div className="w-full mt-4 bg-black/20 rounded-3xl p-2 pt-6 sm:p-6 sm:pt-10 border border-white/5 relative overflow-hidden">
                        
                        {/* Dynamic Background Glow based on active metric */}
                        <div 
                            className="absolute -top-32 -left-32 w-[500px] h-[500px] blur-[150px] rounded-full opacity-[0.15] pointer-events-none transition-colors duration-1000"
                            style={{ backgroundColor: currentMetric.gradient }}
                        ></div>

                        {loading ? (
                            <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
                                <div className="w-10 h-10 border-4 border-white/10 border-t-[#FCD34D] rounded-full animate-spin"></div>
                            </div>
                        ) : data.length === 0 ? (
                            <div className="h-[250px] sm:h-[300px] flex flex-col items-center justify-center text-gray-500 gap-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-2xl">
                                    ☁️
                                </div>
                                <span className="text-sm font-bold uppercase tracking-widest">ไม่มีข้อมูลสำหรับสถานีนี้</span>
                            </div>
                        ) : (
                            <div className="h-[250px] sm:h-[300px] w-full relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={data}
                                        margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id={`gradient-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={currentMetric.gradient} stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor={currentMetric.gradient} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                        
                                        <XAxis 
                                            dataKey="time" 
                                            stroke="rgba(255,255,255,0.3)" 
                                            fontSize={12}
                                            fontWeight={600}
                                            tickMargin={15} 
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis 
                                            stroke="rgba(255,255,255,0.3)" 
                                            fontSize={11} 
                                            fontWeight={600}
                                            tickFormatter={(value) => `${value}`}
                                            tickLine={false}
                                            axisLine={false}
                                            width={60}
                                        />
                                        <Tooltip 
                                            content={<CustomTooltip />} 
                                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }} 
                                        />
                                        
                                        <Area 
                                            type="monotone" 
                                            dataKey={activeMetric} 
                                            stroke={currentMetric.color} 
                                            strokeWidth={4}
                                            fillOpacity={1} 
                                            fill={`url(#gradient-${activeMetric})`}
                                            animationDuration={1500}
                                            activeDot={{ r: 8, fill: currentMetric.color, stroke: '#0F172A', strokeWidth: 4, shadow: '0 0 20px rgba(0,0,0,0.5)' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>

                {/* Weather Details Grid Section */}
                <div className="mt-12">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">รายละเอียดของสภาพอากาศ</h2>
                        <span className="text-gray-500 font-bold ml-2">
                            {currentData?.date_time ? currentData.date_time.split(' ')[1].substring(0, 5) : ''}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* 1. อุณหภูมิ (Temperature) */}
                        <div className="msn-glass bg-[#1E293B]/70 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 shadow-xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <h4 className="text-white font-bold text-sm mb-4">อุณหภูมิ</h4>
                            <div className="flex flex-col h-full justify-between">
                                <div className="flex justify-end items-end h-20 w-full relative mb-6">
                                    {/* Mock Trend Line */}
                                    <svg viewBox="0 0 100 40" className="w-full h-full absolute bottom-0 left-0" preserveAspectRatio="none">
                                        <path d="M0 30 Q 25 10 50 20 T 100 5" fill="none" stroke="#3B82F6" strokeWidth="3" className="drop-shadow-lg" />
                                        <circle cx="85" cy="8" r="4" fill="#0F172A" stroke="#3B82F6" strokeWidth="2" />
                                    </svg>
                                    <span className="text-3xl font-bold text-white z-10">{currentData?.temp}°</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 text-xs font-bold text-gray-300">
                                        สูงสุด {maxTemp}° <span className="text-gray-500 mx-1">•</span> ต่ำสุด {minTemp}°
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">คาดว่าอุณหภูมิวันนี้จะใกล้เคียงกับเมื่อวาน</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. รู้สึกเหมือน (Feels Like) */}
                        <div className="msn-glass bg-[#1E293B]/70 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 shadow-xl">
                            <h4 className="text-white font-bold text-sm mb-4">รู้สึกเหมือน</h4>
                            <div className="flex flex-col">
                                {/* Slider Mock */}
                                <div className="w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-rose-500 rounded-full my-6 relative">
                                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow border-2 border-[#1E293B]" style={{ left: '60%' }}></div>
                                </div>
                                <div className="flex justify-between items-end mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 font-semibold">รู้สึกเหมือน</span>
                                        <span className="text-3xl font-bold text-white">{feelsLike}°</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-gray-400 font-semibold">อุณหภูมิ</span>
                                        <span className="text-xl font-bold text-white">{currentData?.temp}°</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">รู้สึกอุ่นกว่าอุณหภูมิจริงเนื่องจากความชื้น</p>
                            </div>
                        </div>

                        {/* 3. ปริมาณฝน (Rain) */}
                        <div className="msn-glass bg-[#1E293B]/70 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 shadow-xl flex flex-col">
                            <h4 className="text-white font-bold text-sm mb-2">ปริมาณฝน</h4>
                            <div className="flex-1 flex items-center justify-center relative my-4">
                                {/* Circular Gauge */}
                                <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#60A5FA" strokeWidth="8" strokeDasharray="314" strokeDashoffset={currentData?.rain_24h > 0 ? 250 : 314} className="transition-all duration-1000" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-white">{currentData?.rain_24h || 0}</span>
                                    <span className="text-xs font-bold text-gray-400">มม.</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">{currentData?.rain_24h > 0 ? "มีฝนตกในช่วง 24 ชั่วโมงที่ผ่านมา" : "ไม่มีฝนใน 24 ชั่วโมงที่ผ่านมา"}</p>
                        </div>

                        {/* 4. ลม (Wind) */}
                        <div className="msn-glass bg-[#1E293B]/70 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 shadow-xl flex flex-col">
                            <h4 className="text-white font-bold text-sm mb-4">ลม</h4>
                            <div className="flex gap-4 items-center mb-4">
                                {/* Compass */}
                                <div className="relative w-24 h-24 rounded-full border-2 border-white/10 flex items-center justify-center bg-[#0F172A]/50">
                                    <span className="absolute top-1 text-[8px] font-bold text-gray-500">N</span>
                                    <span className="absolute bottom-1 text-[8px] font-bold text-gray-500">S</span>
                                    <span className="absolute right-2 text-[8px] font-bold text-gray-500">E</span>
                                    <span className="absolute left-2 text-[8px] font-bold text-gray-500">W</span>
                                    <div 
                                        className="absolute inset-0 flex items-center justify-center transition-transform duration-1000 ease-out"
                                        style={{ transform: `rotate(${currentData?.wind_dir && currentData?.wind_dir !== '--' ? currentData.wind_dir : 0}deg)` }}
                                    >
                                        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[30px] border-transparent border-b-blue-500 absolute top-[15px]"></div>
                                        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[30px] border-transparent border-t-blue-800 absolute bottom-[15px]"></div>
                                        <div className="w-3 h-3 bg-white rounded-full z-10 shadow-lg"></div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div>
                                        <span className="text-2xl font-bold text-white leading-none">{currentData?.wind_speed}</span>
                                        <span className="text-[10px] text-gray-400 ml-1 font-semibold">กม./ชม.</span>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">ความเร็วลม</p>
                                    </div>
                                    <div>
                                        <span className="text-lg font-bold text-white leading-none">{currentData?.wind_gust}</span>
                                        <span className="text-[10px] text-gray-400 ml-1 font-semibold">m/s</span>
                                        <p className="text-[10px] text-rose-400/70 uppercase tracking-widest mt-1">ลมกระโชกแรง</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-auto">ทิศทางลม: {currentData?.wind_dir !== '--' ? `${currentData?.wind_dir}°` : 'ไม่ระบุ'}</p>
                        </div>

                        {/* 5. ความชื้น (Humidity) */}
                        <div className="msn-glass bg-[#1E293B]/70 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 shadow-xl flex flex-col">
                            <h4 className="text-white font-bold text-sm mb-4">ความชื้น</h4>
                            <div className="flex items-center gap-6 my-4">
                                <div className="flex items-end gap-1.5 h-16">
                                    {[30, 50, 70, 90, 100, 80, 60].map((h, i) => (
                                        <div key={i} className="w-3 rounded-t-sm rounded-b-sm bg-white/5 relative h-full flex items-end overflow-hidden">
                                            <div 
                                                className="w-full bg-emerald-500 transition-all duration-1000" 
                                                style={{ height: `${currentData?.humidity ? currentData.humidity * (h/100) : 0}%` }}
                                            ></div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-4xl font-bold text-white">{currentData?.humidity}%</span>
                                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-1">ความชื้นสัมพัทธ์</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-auto">ระดับความชื้นปัจจุบัน {currentData?.humidity > 60 ? 'ค่อนข้างสูง' : 'ปกติ'}</p>
                        </div>

                        {/* 6. แสงสว่าง (Light) */}
                        <div className="msn-glass bg-[#1E293B]/70 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 shadow-xl flex flex-col">
                            <h4 className="text-white font-bold text-sm mb-2">ความเข้มแสง</h4>
                            <div className="flex-1 flex flex-col items-center justify-end relative my-4 min-h-[100px]">
                                {/* Semi Circle Gauge */}
                                <svg width="160" height="80" viewBox="0 0 160 80" className="mt-auto">
                                    <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" strokeLinecap="round" />
                                    {/* Gradient Path representing light intensity (mocked out of 100000 lux max roughly) */}
                                    <path 
                                        d="M 10 80 A 70 70 0 0 1 150 80" 
                                        fill="none" 
                                        stroke="url(#lightGradient)" 
                                        strokeWidth="12" 
                                        strokeLinecap="round"
                                        strokeDasharray="220"
                                        strokeDashoffset={220 - (220 * Math.min(currentData?.light / 100000, 1))}
                                        className="transition-all duration-1500"
                                    />
                                    <defs>
                                        <linearGradient id="lightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#8B5CF6" />
                                            <stop offset="50%" stopColor="#3B82F6" />
                                            <stop offset="100%" stopColor="#FCD34D" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute bottom-2 flex flex-col items-center">
                                    <span className="text-3xl font-bold text-white">{currentData?.light}</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-center">ระดับแสงสว่าง (Lux)</p>
                        </div>

                        {/* 7. ความกดอากาศ (Pressure) */}
                        <div className="msn-glass bg-[#1E293B]/70 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 shadow-xl flex flex-col justify-between">
                            <h4 className="text-white font-bold text-sm mb-4">ความกดอากาศ</h4>
                            <div className="my-6">
                                {/* Pressure Slider Mock */}
                                <div className="w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full relative">
                                    <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow border-4 border-[#1E293B]" style={{ left: '70%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-end gap-1">
                                    <span className="text-3xl font-bold text-white">{currentData?.pressure}</span>
                                    <span className="text-sm font-bold text-gray-400 mb-1">hPa</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">แนวโน้มความกดอากาศคงที่</p>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default DetailHour;
