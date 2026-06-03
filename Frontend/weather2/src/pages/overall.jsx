import { useState, useEffect, useMemo } from 'react';
import { Menu, X, ArrowLeft, Thermometer, Droplets, Wind, ArrowUpRight, ArrowDownRight, Minus, BarChart3, Database, CloudSun, Award, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoginModal } from '../components/LoginModal';
import { RegisterModal } from '../components/RegisterModal';
import { DownloadModal } from '../components/DownloadModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Helper function to calculate MAE & MAPE of forecast sources against real Node measurements
const computeErrors = (data, suffix) => {
    let tmdMaeSum = 0, tmdCount = 0;
    let msnMaeSum = 0, msnCount = 0;
    let weatherMaeSum = 0, weatherCount = 0;
    
    let tmdNodeSum = 0, msnNodeSum = 0, weatherNodeSum = 0;

    data.forEach(d => {
        const nodeVal = d[`Node${suffix}`] !== null && d[`Node${suffix}`] !== undefined ? Number(d[`Node${suffix}`]) : null;
        if (nodeVal === null || isNaN(nodeVal)) return;

        const tmdVal = d[`TMD${suffix}`] !== null && d[`TMD${suffix}`] !== undefined ? Number(d[`TMD${suffix}`]) : null;
        const msnVal = d[`MSN${suffix}`] !== null && d[`MSN${suffix}`] !== undefined ? Number(d[`MSN${suffix}`]) : null;
        const weatherVal = d[`Weather${suffix}`] !== null && d[`Weather${suffix}`] !== undefined ? Number(d[`Weather${suffix}`]) : null;

        if (tmdVal !== null && !isNaN(tmdVal)) {
            const err = Math.abs(nodeVal - tmdVal);
            tmdMaeSum += err;
            tmdNodeSum += Math.abs(nodeVal);
            tmdCount++;
        }

        if (msnVal !== null && !isNaN(msnVal)) {
            const err = Math.abs(nodeVal - msnVal);
            msnMaeSum += err;
            msnNodeSum += Math.abs(nodeVal);
            msnCount++;
        }

        if (weatherVal !== null && !isNaN(weatherVal)) {
            const err = Math.abs(nodeVal - weatherVal);
            weatherMaeSum += err;
            weatherNodeSum += Math.abs(nodeVal);
            weatherCount++;
        }
    });

    return {
        TMD: {
            MAE: tmdCount > 0 ? tmdMaeSum / tmdCount : null,
            MAPE: tmdCount > 0 && tmdNodeSum > 0 ? Math.min(100, Math.max(0, (tmdMaeSum / tmdNodeSum) * 100)) : null
        },
        MSN: {
            MAE: msnCount > 0 ? msnMaeSum / msnCount : null,
            MAPE: msnCount > 0 && msnNodeSum > 0 ? Math.min(100, Math.max(0, (msnMaeSum / msnNodeSum) * 100)) : null
        },
        Weather: {
            MAE: weatherCount > 0 ? weatherMaeSum / weatherCount : null,
            MAPE: weatherCount > 0 && weatherNodeSum > 0 ? Math.min(100, Math.max(0, (weatherMaeSum / weatherNodeSum) * 100)) : null
        }
    };
};

const Overall = () => {
    const [averages, setAverages] = useState({ temp: 0, humidity: 0, wind_speed: 0 });
    const [tmdData, setTmdData] = useState({ temp: 0, humidity: 0, wind_speed: 0 });
    const [msnData, setMsnData] = useState({ temp: 0, humidity: 0, wind_speed: 0 });
    const [weatherData, setWeatherData] = useState({ temp: 0, humidity: 0, wind_speed: 0 });
    const [overall24hData, setOverall24hData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);

    // States for MAE / MAPE calculations and UI toggles
    const [errorMetricType, setErrorMetricType] = useState('MAE'); // 'MAE' or 'MAPE'
    const [showEnsemble, setShowEnsemble] = useState(true); // Toggle to show/hide the MAE Ensemble line

    useEffect(() => {
        try {
            const data = JSON.parse(localStorage.getItem('weather_user'));
            if (data) {
                // If it has loginTime, check if 30 mins (1800000 ms) passed
                if (data.loginTime) {
                    if (new Date().getTime() - data.loginTime > 30 * 60 * 1000) {
                        localStorage.removeItem('weather_user');
                        setLoggedInUser(null);
                        return;
                    }
                    setLoggedInUser(data.user);
                } else {
                    // Fallback for old format
                    setLoggedInUser(data);
                }
            }
        } catch (e) {
            console.error("Error reading session", e);
        }
    }, []);

    const handleLoginSuccess = (user) => {
        const sessionData = { user: user, loginTime: new Date().getTime() };
        localStorage.setItem('weather_user', JSON.stringify(sessionData));
        setLoggedInUser(user);
        setIsLoginOpen(false);
    };

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // 1. Fetch all Node Names
                const nameRes = await fetch('/api/getNameNode/');
                const nameData = await nameRes.json();
                const nodes = nameData.nodes;

                // 2. Fetch all Node Data
                const nodePromises = nodes.map(node => fetch(`/api/getDataNode/${node.node_name}`).then(res => res.json()));
                const nodeResults = await Promise.all(nodePromises);

                const temps = [];
                const hums = [];
                const winds = [];

                nodeResults.forEach(res => {
                    const data = res.data && res.data[0];
                    if (data) {
                        if (data.temp > 0) temps.push(data.temp);
                        if (data.humidity > 0) hums.push(data.humidity);
                        if (data.wind_speed > 0) winds.push(data.wind_speed);
                    }
                });

                const getMedian = (arr) => {
                    if (arr.length === 0) return 0;
                    arr.sort((a, b) => a - b);
                    const mid = Math.floor(arr.length / 2);
                    return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
                };

                setAverages({
                    temp: getMedian(temps),
                    humidity: getMedian(hums),
                    wind_speed: getMedian(winds)
                });

                // 3. Fetch TMD Data
                const tmdRes = await fetch('/api/getCurrentTMD/');
                const tmdResult = await tmdRes.json();
                if (tmdResult.data && tmdResult.data.length > 0) {
                    const tmd = tmdResult.data[0];
                    setTmdData({
                        temp: tmd.temperature_tdm || 0,
                        humidity: tmd.humidity_tdm || 0,
                        wind_speed: tmd.wind_speed_tdm || 0
                    });
                }

                // 4. Fetch MSN Data
                const msnRes = await fetch('/api/getDataMSN/');
                const msnResult = await msnRes.json();
                if (msnResult.data && msnResult.data.length > 0) {
                    const msn = msnResult.data[0];
                    setMsnData({
                        temp: msn.temperature_msn || 0, 
                        humidity: msn.humidity_msn || 0, 
                        wind_speed: msn.wind_speed_msn || 0, 
                    });
                }

                // 5. Fetch Weather.com Data
                const weatherRes = await fetch('/api/getCurrentWeather/');
                const weatherResult = await weatherRes.json();
                if (weatherResult.data) {
                    const weather = weatherResult.data;
                    setWeatherData({
                        temp: weather.temperature_w || 0,
                        humidity: weather.humidity_w || 0,
                        wind_speed: weather.wind_w || 0,
                    });
                }

                // 6. Fetch 24h Overall Data
                const hours = loggedInUser ? 24 : 7;
                const overallRes = await fetch(`/api/get24hOverall/?limit_hours=${hours}`);
                const overallResult = await overallRes.json();
                if (overallResult.data) {
                    setOverall24hData(overallResult.data);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [loggedInUser]);

    const formatValue = (val) => Number(val).toFixed(2);

    // Compute MAE & MAPE for the 24h data
    const maeData = useMemo(() => {
        if (!overall24hData || overall24hData.length === 0) {
            return {
                temp: { TMD: { MAE: 0, MAPE: 0 }, MSN: { MAE: 0, MAPE: 0 }, Weather: { MAE: 0, MAPE: 0 } },
                hum: { TMD: { MAE: 0, MAPE: 0 }, MSN: { MAE: 0, MAPE: 0 }, Weather: { MAE: 0, MAPE: 0 } },
                wind: { TMD: { MAE: 0, MAPE: 0 }, MSN: { MAE: 0, MAPE: 0 }, Weather: { MAE: 0, MAPE: 0 } }
            };
        }

        const metrics = ['_temp', '_hum', '_wind'];
        const keys = { _temp: 'temp', _hum: 'hum', _wind: 'wind' };
        const results = {};

        metrics.forEach(m => {
            const key = keys[m];
            results[key] = computeErrors(overall24hData, m);
        });

        return results;
    }, [overall24hData]);

    const MetricLineChart = ({ title, data, dataKeySuffix, unit }) => (
        <div className="msn-glass bg-[#1E293B]/70 border border-white/5 rounded-3xl p-6 flex flex-col h-[350px] hover:scale-[1.02] transition-transform duration-300 shadow-xl">
            <h3 className="text-white font-bold text-lg mb-4">{title}</h3>
            <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} fontWeight="bold" />
                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} width={40} fontWeight="bold" />
                        <Tooltip 
                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }}
                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                            formatter={(value, name) => [value != null ? `${formatValue(value)} ${unit}` : '-', name]}
                            labelFormatter={(label) => `เวลา: ${label} น.`}
                        />
                        <Line name="Node" type="monotone" dataKey={`Node${dataKeySuffix}`} stroke="#3B82F6" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} connectNulls />
                        <Line name="TMD" type="monotone" dataKey={`TMD${dataKeySuffix}`} stroke="#F97316" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} connectNulls />
                        <Line name="MSN" type="monotone" dataKey={`MSN${dataKeySuffix}`} stroke="#10B981" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} connectNulls />
                        <Line name="Weather.com" type="monotone" dataKey={`Weather${dataKeySuffix}`} stroke="#06B6D4" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} connectNulls />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></div><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Node</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></div><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">TMD</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">MSN</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]"></div><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Weather.com</span></div>
            </div>
        </div>
    );

    const OverviewItem = ({ title, unit, icon: Icon, colorClass, tmdErr, msnErr, weatherErr, nodeVal, tmdVal, msnVal, weatherVal }) => {
        const showValues = tmdErr === undefined && tmdVal !== undefined;

        const renderMetricCard = (label, err, borderHoverClass) => (
            <div className={`flex flex-col bg-[#1E293B]/60 p-4 rounded-xl border border-[#334155]/60 hover:${borderHoverClass} transition-colors`}>
                <span className="text-xs text-gray-400 mb-2 font-medium">{label}</span>
                <div className="flex justify-between items-center">
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-gray-100">
                            {err && err.MAE !== null ? `${formatValue(err.MAE)}` : 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500">{unit}</span>
                    </div>
                    {err && err.MAPE !== null && (
                        <div className="flex items-center gap-1 text-gray-300 bg-white/5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 border border-white/10">
                            <span className="text-gray-400">({formatValue(err.MAPE)}%)</span>
                        </div>
                    )}
                </div>
            </div>
        );

        const renderValueCard = (label, val, borderHoverClass) => {
            const diff = nodeVal != null && val != null ? Math.abs(nodeVal - val) : null;
            return (
                <div className={`flex flex-col bg-[#1E293B]/60 p-4 rounded-xl border border-[#334155]/60 hover:${borderHoverClass} transition-colors`}>
                    <span className="text-xs text-gray-400 mb-2 font-medium">{label}</span>
                    <div className="flex justify-between items-center">
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-gray-100">
                                {val != null && val !== 0 ? formatValue(val) : 'N/A'}
                            </span>
                            <span className="text-xs text-gray-500">{unit}</span>
                        </div>
                        {diff !== null && nodeVal != null && val != null && val !== 0 && (
                            <div className="flex items-center gap-1 text-gray-300 bg-white/5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 border border-white/10">
                                <span className="text-gray-400">±{formatValue(diff)}</span>
                            </div>
                        )}
                    </div>
                </div>
            );
        };

        return (
            <div className="flex flex-col xl:flex-row xl:items-center justify-between p-5 border-b border-[#334155]/40 last:border-0 hover:bg-[#0F172A]/40 transition-colors">
                <div className="flex items-center gap-3 mb-4 xl:mb-0 w-48">
                    <div className={`p-2 rounded-lg bg-[#1E293B] ${colorClass}`}>
                       <Icon size={20} />
                    </div>
                    <span className="font-semibold text-gray-200">{title}</span>
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {showValues ? (
                        <>
                            {renderValueCard('กรมอุตุฯ (TMD)', tmdVal, 'border-blue-500/30')}
                            {renderValueCard('MSN', msnVal, 'border-emerald-500/30')}
                            {renderValueCard('Weather.com', weatherVal, 'border-cyan-500/30')}
                        </>
                    ) : (
                        <>
                            {renderMetricCard('ค่าคลาดเคลื่อน กรมอุตุฯ (TMD)', tmdErr, 'border-blue-500/30')}
                            {renderMetricCard('ค่าคลาดเคลื่อน MSN', msnErr, 'border-emerald-500/30')}
                            {renderMetricCard('ค่าคลาดเคลื่อน Weather.com', weatherErr, 'border-cyan-500/30')}
                        </>
                    )}
                </div>
            </div>
        );
    };


    const tempChartData = [
        { name: 'Node', value: averages.temp, color: '#3B82F6' },
        { name: 'TMD', value: tmdData.temp, color: '#F97316' },
        { name: 'MSN', value: msnData.temp, color: '#10B981' },
        { name: 'Weather', value: weatherData.temp, color: '#06B6D4' }
    ];
    const humChartData = [
        { name: 'Node', value: averages.humidity, color: '#3B82F6' },
        { name: 'TMD', value: tmdData.humidity, color: '#F97316' },
        { name: 'MSN', value: msnData.humidity, color: '#10B981' },
        { name: 'Weather', value: weatherData.humidity, color: '#06B6D4' }
    ];
    const windChartData = [
        { name: 'Node', value: averages.wind_speed, color: '#3B82F6' },
        { name: 'TMD', value: tmdData.wind_speed, color: '#F97316' },
        { name: 'MSN', value: msnData.wind_speed, color: '#10B981' },
        { name: 'Weather', value: weatherData.wind_speed, color: '#06B6D4' }
    ];

    return (
        <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center pb-20 relative font-outfit selection:bg-blue-500/30">
            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full"></div>
            </div>

            {/* Floating Glass Navbar */}
            <nav className='fixed top-6 z-50 msn-glass w-[90%] max-w-6xl rounded-2xl flex flex-col px-6 transition-all duration-500 hover:border-white/20'>
                <div className="w-full flex justify-between items-center h-16">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <Link to="/" className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:rotate-12 transition-transform">
                             <ArrowLeft size={18} className="text-white" />
                        </Link>
                        <div className="text-lg font-bold tracking-tight text-white">
                            LookData <span className="text-blue-400">Overall</span>
                        </div>
                    </div>

                    <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-10 text-[13px] font-bold uppercase tracking-widest text-gray-400">
                        <Link to="/" className="cursor-pointer hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-blue-500 after:transition-all hover:after:w-full">DASHBOARD</Link>
                        <span className="text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-blue-500">OVERALL</span>
                    </div>

                    <div className='hidden md:flex items-center gap-4'>
                        <button 
                            onClick={() => loggedInUser ? setIsDownloadOpen(true) : setIsLoginOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-300 transition-all active:scale-95"
                        >
                            <span>DOWNLOAD</span>
                            {!loggedInUser ? <span className="text-yellow-500">🔒</span> : <span className="text-blue-400">↓</span>}
                        </button>
                        <div className="px-4 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-[10px] font-bold uppercase tracking-widest text-blue-400">
                            Global Comparisons
                        </div>
                    </div>

                    <button className="md:hidden text-gray-400 p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden flex flex-col gap-6 pb-8 pt-4 border-t border-white/5 animate-msn-in">
                        <div className="flex flex-col gap-4 text-sm font-bold uppercase tracking-widest text-gray-400 pl-2">
                            <Link to="/" className="hover:text-white transition-colors">DASHBOARD</Link>
                            <span className="text-white">OVERALL</span>
                        </div>

                        <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
                            <button 
                                onClick={() => { loggedInUser ? setIsDownloadOpen(true) : setIsLoginOpen(true); setIsMobileMenuOpen(false); }}
                                className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-white transition-all active:scale-95"
                            >
                                <span>DOWNLOAD DATA</span>
                                {!loggedInUser ? <span className="text-yellow-500">🔒</span> : <span className="text-blue-400 text-lg">↓</span>}
                            </button>

                            {loggedInUser ? (
                                <div className="flex items-center justify-between px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-xs">👤</div>
                                        <span className="text-xs font-bold text-gray-200">{loggedInUser.username}</span>
                                    </div>
                                    <button onClick={() => { localStorage.removeItem('weather_user'); window.location.reload(); }} className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">LOGOUT</button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => { setIsLoginOpen(true); setIsMobileMenuOpen(false); }}
                                    className="w-full px-6 py-4 rounded-2xl bg-blue-600 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-600/20">
                                    SIGN IN
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <main className="w-full max-w-7xl px-4 mt-32 relative z-10">
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6 mb-16 animate-msn-in">
                    <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">Data Intelligence</span>
                    <h1 className='text-5xl md:text-6xl font-bold tracking-tighter text-white drop-shadow-sm'>เปรียบเทียบข้อมูล <span className="text-blue-500">ภาพรวม</span></h1>
                    <p className="text-gray-400 text-lg font-medium leading-relaxed">
                        วิเคราะห์ค่าเฉลี่ยจากทุกสถานีตรวจวัด เปรียบเทียบกับข้อมูลพยากรณ์อากาศจากหน่วยงานระดับโลกแบบ Real-time
                    </p>
                </div>

                {loading ? (
                    <div className="w-full h-96 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-bold tracking-widest text-xs uppercase">Analyzing data pools...</p>
                    </div>
                ) : (
                    <div className="space-y-12 animate-msn-in" style={{ animationDelay: '0.2s' }}>
                        
                        {/* Comparison Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <MetricLineChart title="อุณหภูมิ (°C)" data={overall24hData} dataKeySuffix="_temp" unit="°C" />
                            <MetricLineChart title="ความชื้น (%)" data={overall24hData} dataKeySuffix="_hum" unit="%" />
                            <MetricLineChart title="ความเร็วลม (km/h)" data={overall24hData} dataKeySuffix="_wind" unit="km/h" />
                        </div>

                        {/* Detailed Comparison Table-like Section */}
                        <div className="msn-glass rounded-[2.5rem] overflow-hidden p-2">
                            <div className="w-full bg-blue-600 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[2rem]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <BarChart3 size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white tracking-tight">ภาพรวมความคลาดเคลื่อนสะสม (MAE / MAPE)</h3>
                                        <p className="text-blue-100 text-xs font-medium">วิเคราะห์จากข้อมูลสภาพอากาศในช่วง 24 ชั่วโมงที่ผ่านมาเทียบกับสถานีตรวจวัดจริง</p>
                                    </div>
                                </div>
                                <div className="px-4 py-2 bg-black/20 rounded-xl border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                                    Last Analysis: {new Date().toLocaleTimeString()}
                                </div>
                            </div>

                            <div className="mt-4 px-2 sm:px-6 divide-y divide-white/5">
                                <OverviewItem 
                                    title="อุณหภูมิ" 
                                    unit="°C"
                                    icon={Thermometer} 
                                    colorClass="text-rose-400"
                                    tmdErr={maeData.temp.TMD} 
                                    msnErr={maeData.temp.MSN} 
                                    weatherErr={maeData.temp.Weather}
                                />
                                <OverviewItem 
                                    title="ความชื้น" 
                                    unit="%"
                                    icon={Droplets} 
                                    colorClass="text-blue-400"
                                    tmdErr={maeData.hum.TMD} 
                                    msnErr={maeData.hum.MSN} 
                                    weatherErr={maeData.hum.Weather}
                                />
                                <OverviewItem 
                                    title="ความเร็วลม"  
                                    unit="km/h"
                                    icon={Wind} 
                                    colorClass="text-teal-400"
                                    tmdErr={maeData.wind.TMD} 
                                    msnErr={maeData.wind.MSN} 
                                    weatherErr={maeData.wind.Weather}
                                />
                            </div>
                        </div>

                        {/* Detailed Comparison Table-like Section */}
                        <div className="msn-glass rounded-[2.5rem] overflow-hidden p-2">
                            <div className="w-full bg-blue-600 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[2rem]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <BarChart3 size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white tracking-tight">ภาพรวมส่วนต่างเทียบข้อมูลล่าสุด</h3>
                                        <p className="text-blue-100 text-xs font-medium">เปรียบเทียบค่าเฉลี่ยสถานี เทียบกับ API ภายนอก</p>
                                    </div>
                                </div>
                                <div className="px-4 py-2 bg-black/20 rounded-xl border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                                    Last Analysis: {new Date().toLocaleTimeString()}
                                </div>
                            </div>

                            <div className="mt-4 px-2 sm:px-6 divide-y divide-white/5">
                                <OverviewItem 
                                    title="อุณหภูมิ" 
                                    unit="°C"
                                    icon={Thermometer} 
                                    colorClass="text-rose-400"
                                    nodeVal={averages.temp} 
                                    tmdVal={tmdData.temp} 
                                    msnVal={msnData.temp} 
                                    weatherVal={weatherData.temp}
                                />
                                <OverviewItem 
                                    title="ความชื้น" 
                                    unit="%"
                                    icon={Droplets} 
                                    colorClass="text-blue-400"
                                    nodeVal={averages.humidity} 
                                    tmdVal={tmdData.humidity} 
                                    msnVal={msnData.humidity} 
                                    weatherVal={weatherData.humidity}
                                />
                                <OverviewItem 
                                    title="ความเร็วลม"  
                                    unit="km/h"
                                    icon={Wind} 
                                    colorClass="text-teal-400"
                                    nodeVal={averages.wind_speed} 
                                    tmdVal={tmdData.wind_speed} 
                                    msnVal={msnData.wind_speed} 
                                    weatherVal={weatherData.wind_speed}
                                />
                            </div>
                        </div>

                    </div>
                )}
            </main>

            {/* Modals */}
            <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
            <LoginModal
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onOpenRegister={() => setIsRegisterOpen(true)}
                onLoginSuccess={handleLoginSuccess}
            />
            <DownloadModal isOpen={isDownloadOpen} onClose={() => setIsDownloadOpen(false)} selectedNode="AVERAGE" />
        </div>
    );
};

export default Overall;
