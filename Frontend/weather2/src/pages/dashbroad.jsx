import sun from "../images/sun.png"
import { CardToDay } from '../components/CardToDay'
import MapComponent from '../components/Map'
import { Card7day } from '../components/Card7day'
import { ChartWidget } from '../components/ChartWidget'
import { useState, useEffect } from 'react'
import { CardAllDataNode } from '../components/CardAllDataNode'
import { CardPre7day } from '../components/CardPre7day'
import { ChartWidgetTMD } from '/src/components/ChartWidgetTMD.jsx'
import { ChartWidgetMSN } from '/src/components/ChartWidgetMSN.jsx'
import { CardCurrentMSN } from '/src/components/CardCurrentMSN.jsx'
import { CardCurrentWeather } from '/src/components/CardCurrentWeather.jsx'
import { ChartWidgetWeather } from '/src/components/ChartWidgetWeather.jsx'
import { Menu, X, Lock, User, Download, ArrowDown } from 'lucide-react'
import { RegisterModal } from '/src/components/RegisterModal.jsx'
import { LoginModal } from '/src/components/LoginModal.jsx'
import { DownloadModal } from '/src/components/DownloadModal.jsx'
import { Link, useLocation } from 'react-router-dom'


const Dashboard = () => {
    const location = useLocation()
    const [node, setNode] = useState([])
    const [selectedNode, setSelectedNode] = useState("สวนทุเรียนแม่แจ๋ว")
    const [dataNode, setDataNode] = useState([])
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isStationDropdownOpen, setIsStationDropdownOpen] = useState(false)
    const [isRegisterOpen, setIsRegisterOpen] = useState(false)
    const [isDownloadOpen, setIsDownloadOpen] = useState(false)
    const [isLoginOpen, setIsLoginOpen] = useState(false)
    const [loggedInUser, setLoggedInUser] = useState(() => {
        try { 
            const data = JSON.parse(localStorage.getItem('weather_user'));
            if (data) {
                if (data.loginTime) {
                    if (new Date().getTime() - data.loginTime > 30 * 60 * 1000) {
                        localStorage.removeItem('weather_user');
                        return null;
                    }
                    return data.user;
                } else {
                    return data; // Fallback
                }
            }
            return null;
        } catch { return null }
    })

    const [timeMode, setTimeMode] = useState(loggedInUser ? '24h' : '7h');

    const handleLoginSuccess = (user) => {
        const sessionData = { user: user, loginTime: new Date().getTime() };
        localStorage.setItem('weather_user', JSON.stringify(sessionData))
        setLoggedInUser(user)
    }
    const handleLogout = () => {
        localStorage.removeItem('weather_user')
        setLoggedInUser(null)
    }

    useEffect(() => {
        setTimeMode(loggedInUser ? '24h' : '7h');
    }, [loggedInUser]);

    useEffect(() => {
        if (location.state?.openLogin) {
            setIsLoginOpen(true);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        fetch('/api/getNameNode/')
            .then(res => {
                return res.json()
            })
            .then(data => {
                setNode(data.nodes)
                if (data.nodes.length > 0) {
                    setSelectedNode(prev => prev ?? data.nodes[0].node_name)
                }
            })
    }, [])

    useEffect(() => {
        if (!selectedNode) return;
        
        let queryParams = '';
        if (timeMode === '5m') queryParams = '?minutes=5';
        else if (timeMode === '30m') queryParams = '?minutes=30';
        else if (timeMode === '1h') queryParams = '?minutes=60';
        else if (timeMode === '3h') queryParams = '?minutes=180';
        else if (timeMode === '7h') queryParams = '?hours=7';
        else if (timeMode === '24h') queryParams = '?hours=24';
        else if (timeMode === '7d') queryParams = '?days=7';

        fetch(`/api/getDataNodeSummary/${selectedNode}${queryParams}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Summary API returned status ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                setDataNode(data.data?.[0] ?? null);
            })
            .catch(err => {
                console.warn("getDataNodeSummary failed, falling back to getDataNode:", err);
                fetch(`/api/getDataNode/${selectedNode}`)
                    .then(res => res.json())
                    .then(data => {
                        setDataNode(data.data?.[0] ?? null);
                    })
                    .catch(e => console.error("Error in fallback getDataNode:", e));
            });
    }, [selectedNode, timeMode])

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const timeOptions = [
        { mode: '5m', label: '5 นาที' },
        { mode: '30m', label: '30 นาที' },
        { mode: '1h', label: '1 ชม.' },
        { mode: '3h', label: '3 ชม.' },
        { mode: '24h', label: '24 ชม.' },
        { mode: '7d', label: '7 วัน' }
    ];

    const renderTimeButtons = () => {
        if (loggedInUser) {
            return (
                <div className="flex overflow-x-auto no-scrollbar bg-black/20 backdrop-blur-md rounded-xl p-1 border border-white/5 gap-1 w-full max-w-full lg:w-auto lg:self-auto">
                    {timeOptions.map((opt) => (
                        <button
                            key={opt.mode}
                            onClick={() => setTimeMode(opt.mode)}
                            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-300 shrink-0 ${
                                timeMode === opt.mode
                                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            );
        } else {
            return (
                <div className="flex overflow-x-auto no-scrollbar bg-black/20 backdrop-blur-md rounded-xl p-1 border border-white/5 gap-1 w-full max-w-full lg:w-auto lg:self-auto">
                    {timeOptions.slice(0, 4).map((opt) => (
                        <button
                            key={opt.mode}
                            onClick={() => setIsLoginOpen(true)}
                            className="whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 hover:text-slate-300 hover:bg-white/5 flex items-center gap-1 transition-all duration-300 shrink-0"
                        >
                            <span>{opt.label}</span>
                            <Lock size={10} className="text-yellow-500/70" />
                        </button>
                    ))}
                    <button
                        className="whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-bold bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] shrink-0"
                        disabled
                    >
                        7 ชม.
                    </button>
                    {timeOptions.slice(4).map((opt) => (
                        <button
                            key={opt.mode}
                            onClick={() => setIsLoginOpen(true)}
                            className="whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 hover:text-slate-300 hover:bg-white/5 flex items-center gap-1 transition-all duration-300 shrink-0"
                        >
                            <span>{opt.label}</span>
                            <Lock size={10} className="text-yellow-500/70" />
                        </button>
                    ))}
                </div>
            );
        }
    };

    return (
        <div id="home" className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center pb-20 relative font-outfit selection:bg-blue-500/30">
            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full"></div>
            </div>

            {/* Floating Glass Navbar */}
            <nav className='fixed top-6 z-50 msn-glass w-[90%] max-w-6xl rounded-2xl flex flex-col px-6 transition-all duration-500 hover:border-white/20'>
                <div className="w-full flex justify-between items-center h-16">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:rotate-12 transition-transform">
                            <span className="font-bold text-white">L</span>
                        </div>
                        <div className="text-lg font-bold tracking-tight text-white">
                            LookData <span className="text-blue-400">Weather</span>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-6 text-[12px] font-bold uppercase tracking-widest text-gray-400">
                        <p onClick={() => scrollToSection('home')} className="cursor-pointer hover:text-white transition-colors">หน้าแรก</p>
                        <p onClick={() => scrollToSection('tmd')} className="cursor-pointer hover:text-white transition-colors">กรมอุตุนิยมวิทยา</p>
                        <p onClick={() => scrollToSection('weather')} className="cursor-pointer hover:text-white transition-colors">WEATHER</p>
                        <p onClick={() => scrollToSection('msn')} className="cursor-pointer hover:text-white transition-colors">MSN</p>
                        <Link to="/overall" className="hover:text-white transition-colors">ภาพรวม</Link>
                        <Link to="/about-us" className="hover:text-white transition-colors">เกี่ยวกับโครงการ</Link>
                    </div>

                    <div className='hidden md:flex items-center gap-6'>
                        <button 
                            onClick={() => loggedInUser ? setIsDownloadOpen(true) : setIsLoginOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-300 transition-all active:scale-95"
                        >
                            <span>DOWNLOAD</span>
                            {!loggedInUser ? <Lock size={12} className="text-yellow-500/80" /> : <ArrowDown size={12} className="text-blue-400" />}
                        </button>
                        
                        {loggedInUser?.role === 'admin' && (
                            <Link to="/addnode" className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest hover:bg-emerald-500/20 transition-all">ADMIN</Link>
                        )}
                        
                        {loggedInUser ? (
                            <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                                <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center"><User size={12} className="text-emerald-400" /></div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-gray-200 leading-none">{loggedInUser.username}</span>
                                    <button onClick={() => handleLogout()} className="text-[8px] text-gray-500 hover:text-red-400 font-bold uppercase mt-0.5 text-left">LOGOUT</button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsLoginOpen(true)}
                                className='bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-[0_10px_20px_rgba(37,99,235,0.2)]'>
                                SIGN IN
                            </button>
                        )}
                    </div>

                    <button className="md:hidden text-gray-400 p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden flex flex-col gap-6 pb-8 pt-4 border-t border-white/5 animate-msn-in">
                        <div className="flex flex-col gap-4 text-sm font-bold uppercase tracking-widest text-gray-200 pl-2">
                            <p onClick={() => { scrollToSection('home'); setIsMobileMenuOpen(false); }} className="hover:text-white transition-colors cursor-pointer">หน้าแรก</p>
                            <p onClick={() => { scrollToSection('tmd'); setIsMobileMenuOpen(false); }} className="hover:text-white transition-colors cursor-pointer">กรมอุตุนิยมวิทยา</p>
                            <p onClick={() => { scrollToSection('weather'); setIsMobileMenuOpen(false); }} className="hover:text-white transition-colors cursor-pointer">Weather.com</p>
                            <p onClick={() => { scrollToSection('msn'); setIsMobileMenuOpen(false); }} className="hover:text-white transition-colors cursor-pointer">MSN Weather</p>
                            <Link to="/overall" className="hover:text-white transition-colors">ภาพรวม</Link>
                            <Link to="/about-us" className="hover:text-white transition-colors">เกี่ยวกับโครงการ</Link>
                            {loggedInUser?.role === 'admin' && (
                                <Link to="/addnode" className="text-emerald-400 hover:text-emerald-300 transition-colors">ADMIN</Link>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
                            <button 
                                onClick={() => { loggedInUser ? setIsDownloadOpen(true) : setIsLoginOpen(true); setIsMobileMenuOpen(false); }}
                                className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-white transition-all active:scale-95"
                            >
                                <span>DOWNLOAD DATA</span>
                                {!loggedInUser ? <Lock size={14} className="text-yellow-500/80" /> : <ArrowDown size={16} className="text-blue-400" />}
                            </button>

                            {loggedInUser ? (
                                <div className="flex items-center justify-between px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center"><User size={14} className="text-emerald-400" /></div>
                                        <span className="text-xs font-bold text-gray-200">{loggedInUser.username}</span>
                                    </div>
                                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">LOGOUT</button>
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

            {/* Main Content Area */}
            <main className="w-full max-w-6xl px-4 mt-32 relative z-10">
                
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-[400px]">
                    {/* Map & Station Selection */}
                    <div className="lg:col-span-8 flex flex-col gap-4">
                        {/* Station Dropdown */}
                        <div className="relative group w-full lg:w-1/2">
                            <div 
                                onClick={() => setIsStationDropdownOpen(!isStationDropdownOpen)}
                                className="bg-white/5 hover:bg-white/10 msn-glass text-white px-6 py-3 rounded-2xl border border-white/10 transition-all cursor-pointer flex items-center gap-3 w-full shadow-lg"
                            >
                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                                    📍
                                </div>
                                <div className="flex flex-col flex-1 text-left">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Current Station</span>
                                    <span className="text-sm font-bold truncate">{selectedNode || "SELECT STATION"}</span>
                                </div>
                                <span className={`text-[12px] text-gray-400 transition-transform duration-300 ${isStationDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                            </div>
                            {isStationDropdownOpen && (
                                <div className="absolute top-full mt-2 left-0 w-full msn-glass rounded-xl shadow-2xl z-[100] flex flex-col overflow-hidden py-2 border border-white/10 max-h-[300px] overflow-y-auto">
                                    {node.map((item, index) => (
                                        <div 
                                            key={index}
                                            onClick={() => { setSelectedNode(item.node_name); setIsStationDropdownOpen(false); }}
                                            className={`px-4 py-3 cursor-pointer text-sm font-medium transition-all text-left ${selectedNode === item.node_name ? 'bg-blue-600/40 text-white border-l-4 border-blue-500' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            {item.node_name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Map Card */}
                        <div className="flex-1 min-h-[250px] lg:min-h-[420px] msn-glass rounded-[2rem] overflow-hidden group border border-white/5 relative z-10">
                            <MapComponent
                                nodes={node}
                                selectedNode={selectedNode}
                                onNodeSelect={(nodeName) => setSelectedNode(nodeName)}
                                zoom={6}
                            />
                            {/* Map Overlay for Dark Mode Feel */}
                            <div className="absolute inset-0 pointer-events-none border-[6px] border-[#0F172A] rounded-[2rem] z-20"></div>
                        </div>
                    </div>

                    {/* Today Card - Reduced height on mobile */}
                    <div className="lg:col-span-4 h-[320px] lg:h-auto msn-glass rounded-[2rem] p-6 flex items-center justify-center relative overflow-hidden group border border-white/5">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
                         <div className="w-full h-full flex items-center justify-center">
                            <CardToDay node={dataNode} />
                         </div>
                    </div>
                </div>

                {/* 7-Day Forecast Section */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">7 วันย้อนหลัง</h3>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                        </div>
                    </div>
                    <Card7day node={selectedNode} />
                </div>

                {/* Main Data & Chart Section */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-12 msn-glass rounded-[2rem] p-8">
                        <div className="flex items-center gap-3 mb-6 ">
                            <div className="w-1 h-6 bg-blue-500 rounded-full "></div>
                            <div className="flex w-full flex-col lg:flex-row lg:items-center justify-between gap-4">                            
                                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                                    ข้อมูลทั้งหมดของสถานี <span className="text-blue-500 ml-1">{selectedNode}</span>
                                </h3>
                                <div className="flex flex-wrap items-center gap-3">
                                    {renderTimeButtons()}
                                    {loggedInUser ? (
                                        <Link to={`/detail-hour/${selectedNode}`} className="self-start lg:self-auto shrink-0">
                                            <button className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] whitespace-nowrap">
                                                <span>รายละเอียดเพิ่มเติม</span>
                                                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                            </button>
                                        </Link>
                                    ) : (
                                        <button 
                                            onClick={() => setIsLoginOpen(true)}
                                            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.1)] whitespace-nowrap self-start lg:self-auto"
                                        >
                                            <span>รายละเอียดเพิ่มเติม</span>
                                            <Lock size={14} className="text-yellow-500/80" />
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                        <CardAllDataNode node={dataNode} />
                    </div>

                    {/* Row 1: Big Chart */}
                    <div className="lg:col-span-12 h-[400px] sm:h-[450px]">
                        <ChartWidget node={selectedNode} metric="temp" loggedInUser={loggedInUser} onRequireLogin={() => setIsLoginOpen(true)} timeMode={timeMode} />
                    </div>

                    {/* Row 2+: Other Charts - Horizontal Scroll on Mobile */}
                    <div className="lg:col-span-12 flex lg:grid lg:grid-cols-2 gap-6 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 snap-x snap-mandatory no-scrollbar">
                        <div className="min-w-[85vw] lg:min-w-0 h-[380px] lg:h-[400px] snap-center shrink-0">
                            <ChartWidget node={selectedNode} metric="humidity" loggedInUser={loggedInUser} onRequireLogin={() => setIsLoginOpen(true)} timeMode={timeMode} />
                        </div>
                        <div className="min-w-[85vw] lg:min-w-0 h-[380px] lg:h-[400px] snap-center shrink-0">
                            <ChartWidget node={selectedNode} metric="wind_speed" loggedInUser={loggedInUser} onRequireLogin={() => setIsLoginOpen(true)} timeMode={timeMode} />
                        </div>
                        <div className="min-w-[85vw] lg:min-w-0 h-[380px] lg:h-[400px] snap-center shrink-0">
                            <ChartWidget node={selectedNode} metric="pressure" loggedInUser={loggedInUser} onRequireLogin={() => setIsLoginOpen(true)} timeMode={timeMode} />
                        </div>
                        <div className="min-w-[85vw] lg:min-w-0 h-[380px] lg:h-[400px] snap-center shrink-0">
                            <ChartWidget node={selectedNode} metric="light" loggedInUser={loggedInUser} onRequireLogin={() => setIsLoginOpen(true)} timeMode={timeMode} />
                        </div>
                    </div>
                </div>

                {/* Secondary Sources Sections */}
                <div id="tmd" className="mt-24 space-y-8 pb-10">
                    <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
                        <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">Official Source</span>
                        <h2 className='text-4xl font-bold tracking-tighter text-white'>กรมอุตุนิยมวิทยา ตาก</h2>
                        <p className="text-gray-500 text-sm">ข้อมูลอ้างอิงโดยตรงจากสถานีตรวจวัดอากาศหลักประจำจังหวัดตาก</p>
                    </div>
                    
                    <div className="msn-glass rounded-[2.5rem] p-8">
                        <CardPre7day />
                        <div className="flex md:grid md:grid-cols-2 gap-6 mt-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory no-scrollbar">
                            <div className="min-w-[85vw] md:min-w-0 h-80 snap-center shrink-0"><ChartWidgetTMD metric="temp"/></div>
                            <div className="min-w-[85vw] md:min-w-0 h-80 snap-center shrink-0"><ChartWidgetTMD metric="humidity"/></div>
                            <div className="min-w-[85vw] md:min-w-0 h-80 snap-center shrink-0"><ChartWidgetTMD metric="wind_speed"/></div>
                            <div className="min-w-[85vw] md:min-w-0 h-80 snap-center shrink-0"><ChartWidgetTMD metric="rain"/></div>
                        </div>
                    </div>
                </div>

                {/* Weather.com Section */}
                <div id="weather" className="mt-24 space-y-8">
                    <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
                        <span className="px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-bold uppercase tracking-widest border border-orange-500/20">Global Source</span>
                        <h2 className='text-4xl font-bold tracking-tighter text-white'>Weather.com</h2>
                        <p className="text-gray-500 text-sm">ข้อมูลพยากรณ์อากาศระดับโลกจาก Weather Channel</p>
                    </div>
                    
                    <div className="msn-glass rounded-[2.5rem] p-8">
                        <CardCurrentWeather />
                        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory no-scrollbar">
                            <div className="min-w-[85vw] md:min-w-0 h-80 snap-center shrink-0"><ChartWidgetWeather metric="temp"/></div>
                            <div className="min-w-[85vw] md:min-w-0 h-80 snap-center shrink-0"><ChartWidgetWeather metric="humidity"/></div>
                            <div className="min-w-[85vw] md:min-w-0 h-80 snap-center shrink-0"><ChartWidgetWeather metric="wind"/></div>
                            <div className="min-w-[85vw] md:min-w-0 h-80 snap-center shrink-0"><ChartWidgetWeather metric="pressure"/></div>
                        </div>
                    </div>
                </div>

                {/* MSN Section */}
                <div id="msn" className="mt-24 space-y-8">
                    <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
                        <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">Microsoft Partner</span>
                        <h2 className='text-4xl font-bold tracking-tighter text-white'>MSN Weather</h2>
                        <p className="text-gray-500 text-sm">การพยากรณ์อากาศที่แม่นยำและละเอียดที่สุดจาก Microsoft</p>
                    </div>
                    
                    <div className="msn-glass rounded-[2.5rem] p-8">
                        <CardCurrentMSN />
                        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory no-scrollbar">
                            <div className="min-w-[85vw] md:min-w-0 h-80 snap-center shrink-0"><ChartWidgetMSN metric="temp"/></div>
                            <div className="min-w-[85vw] md:min-w-0 h-80 snap-center shrink-0"><ChartWidgetMSN metric="humidity"/></div>
                            <div className="min-w-[85vw] md:min-w-0 h-80 snap-center shrink-0"><ChartWidgetMSN metric="wind_speed"/></div>
                            <div className="min-w-[85vw] md:min-w-0 h-80 snap-center shrink-0"><ChartWidgetMSN metric="pm25"/></div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
            <LoginModal
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onOpenRegister={() => setIsRegisterOpen(true)}
                onLoginSuccess={(user) => handleLoginSuccess(user)}
            />
            <DownloadModal isOpen={isDownloadOpen} onClose={() => setIsDownloadOpen(false)} selectedNode={selectedNode} />
        </div>
    )
}

export default Dashboard