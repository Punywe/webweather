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
import { Menu, X } from 'lucide-react'
import { RegisterModal } from '/src/components/RegisterModal.jsx'
import { LoginModal } from '/src/components/LoginModal.jsx'
import { DownloadModal } from '/src/components/DownloadModal.jsx'
import { Link } from 'react-router-dom'


const Dashboard = () => {
    const [node, setNode] = useState([])
    const [selectedNode, setSelectedNode] = useState(null)
    const [dataNode, setDataNode] = useState([])
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isStationDropdownOpen, setIsStationDropdownOpen] = useState(false)
    const [isRegisterOpen, setIsRegisterOpen] = useState(false)
    const [isDownloadOpen, setIsDownloadOpen] = useState(false)
    const [isLoginOpen, setIsLoginOpen] = useState(false)
    const [loggedInUser, setLoggedInUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('weather_user')) ?? null } catch { return null }
    })

    const handleLoginSuccess = (user) => {
        localStorage.setItem('weather_user', JSON.stringify(user))
        setLoggedInUser(user)
    }
    const handleLogout = () => {
        localStorage.removeItem('weather_user')
        setLoggedInUser(null)
    }

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
        if (!selectedNode) return
        fetch(`/api/getDataNode/${selectedNode}`)
            .then(res => {
                return res.json()
            })
            .then(data => {
                setDataNode(data.data?.[0] ?? null)
            })
    }, [selectedNode])

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div id="home" className="bg-[#0F172A] text-white w-full min-h-screen flex flex-col items-center pb-8 relative font-outfit ">

            {/* Navbar */}
            <div className='sticky top-4 z-50 bg-[#1E293B]/80 backdrop-blur-md border border-[#334155]/50 shadow-lg w-[95%] rounded-xl flex flex-col px-4 md:px-6 transition-all duration-300'>
                <div className="w-full flex justify-between items-center h-14">
                    <div className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-emerald-400 tracking-wide">
                        สถานีตรวจสภาพอากาศ
                    </div>

                    <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-8 text-sm font-medium text-gray-300 w-auto">
                        <p onClick={() => scrollToSection('home')} className='cursor-pointer hover:text-blue-400 transition-colors'>หน้าแรก</p>
                        <p onClick={() => scrollToSection('tmd')} className='cursor-pointer hover:text-blue-400 transition-colors'>กรมอุตุ</p>
                        <p onClick={() => scrollToSection('msn')} className='cursor-pointer hover:text-blue-400 transition-colors'>MSN</p>
                        <Link to="/overall" className='cursor-pointer hover:text-blue-400 transition-colors'>ภาพรวม</Link>
                    </div>

                    <div className='hidden md:flex items-center gap-6 text-sm font-medium'>
                        <div className="relative">
                            <div 
                                onClick={() => setIsStationDropdownOpen(!isStationDropdownOpen)}
                                className="bg-[#0F172A]/80 text-white px-4 py-1.5 rounded-lg border border-[#334155] hover:border-blue-500 transition-colors cursor-pointer flex justify-between items-center min-w-35 select-none"
                            >
                                <span>{selectedNode || "เลือก..."}</span>
                                <span className="text-gray-400 text-xs ml-3">{isStationDropdownOpen ? '▲' : '▼'}</span>
                            </div>
                            {isStationDropdownOpen && !isMobileMenuOpen && (
                                <div className="absolute top-full mt-1 left-0 w-full bg-[#1E293B] border border-[#334155] rounded-lg shadow-xl z-50 flex flex-col overflow-hidden max-h-48 overflow-y-auto">
                                    {node.map((item, index) => (
                                        <div 
                                            key={index}
                                            onClick={() => { setSelectedNode(item.node_name); setIsStationDropdownOpen(false); }}
                                            className={`px-4 py-2 cursor-pointer transition-colors ${selectedNode === item.node_name ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-[#0F172A] hover:text-white'}`}
                                        >
                                            {item.node_name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p 
                            onClick={() => loggedInUser ? setIsDownloadOpen(true) : setIsLoginOpen(true)}
                            className='cursor-pointer text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-1'
                        >
                            ดาวน์โหลด{!loggedInUser && <span className="text-yellow-500 text-xs">🔒</span>}
                        </p>
                        {loggedInUser ? (
                            <div className="flex items-center gap-2 bg-[#0F172A]/80 px-3 py-1.5 rounded-lg border border-[#334155]">
                                <span className="text-emerald-400 text-sm font-medium">👤 {loggedInUser.username}</span>
                                <button
                                    onClick={() => handleLogout()}
                                    className="text-gray-500 hover:text-red-400 text-xs transition-colors"
                                >ออก</button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsLoginOpen(true)}
                                className='cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg transition-all shadow hover:shadow-blue-500/20'>
                                เข้าสู่ระบบ
                            </button>
                        )}
                    </div>

                    {/* Mobile Hamburger Button */}
                    <button 
                        className="md:hidden text-gray-300 hover:text-white p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden flex flex-col gap-4 pb-5 pt-2 border-t border-[#334155]/50 mt-1">
                        <div className="flex flex-col gap-4 text-[15px] font-medium text-gray-300 pl-2">
                            <p onClick={() => { scrollToSection('home'); setIsMobileMenuOpen(false); }} className='cursor-pointer hover:text-blue-400 transition-colors inline-block'>หน้าแรก</p>
                            <p onClick={() => { scrollToSection('tmd'); setIsMobileMenuOpen(false); }} className='cursor-pointer hover:text-blue-400 transition-colors inline-block'>กรมอุตุ</p>
                            <p onClick={() => { scrollToSection('msn'); setIsMobileMenuOpen(false); }} className='cursor-pointer hover:text-blue-400 transition-colors inline-block'>MSN</p>
                            <Link to="/overall" className='cursor-pointer hover:text-blue-400 transition-colors inline-block'>ภาพรวม</Link>
                        </div>
                        
                        <div className="flex flex-col gap-4 mt-2 pt-4 border-t border-[#334155]/30">
                            <div className="flex flex-col gap-2 relative">
                                <label className="text-sm text-gray-400 pl-2">เลือกสถานี</label>
                                <div 
                                    onClick={() => setIsStationDropdownOpen(!isStationDropdownOpen)}
                                    className="bg-[#0F172A]/80 text-white px-4 py-2.5 rounded-lg border border-[#334155] hover:border-blue-500 transition-colors cursor-pointer w-full text-base flex justify-between items-center select-none"
                                >
                                    <span>{selectedNode || "เลือก..."}</span>
                                    <span className="text-gray-400 text-xs">{isStationDropdownOpen ? '▲' : '▼'}</span>
                                </div>
                                {isStationDropdownOpen && isMobileMenuOpen && (
                                    <div className="absolute top-full mt-1 left-0 w-full bg-[#1E293B] border border-[#334155] rounded-lg shadow-xl z-50 flex flex-col overflow-hidden max-h-48 overflow-y-auto">
                                        {node.map((item, index) => (
                                            <div 
                                                key={index} 
                                                className={`px-4 py-3 cursor-pointer text-sm font-medium transition-colors ${selectedNode === item.node_name ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-[#0F172A] hover:text-white'}`}
                                                onClick={() => { 
                                                    setSelectedNode(item.node_name); 
                                                    setIsStationDropdownOpen(false); 
                                                    setIsMobileMenuOpen(false); 
                                                }}
                                            >
                                                {item.node_name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-3 mt-1">
                                <button 
                                    onClick={() => { loggedInUser ? setIsDownloadOpen(true) : setIsLoginOpen(true); setIsMobileMenuOpen(false); }} 
                                    className='w-full cursor-pointer bg-transparent border border-gray-600 hover:border-gray-400 text-white px-4 py-2.5 rounded-lg transition-all text-base font-medium flex items-center justify-center gap-2'
                                >
                                    ดาวน์โหลด{!loggedInUser && <span className="text-yellow-500 text-xs">🔒</span>}
                                </button>
                                {loggedInUser ? (
                                    <div className="flex items-center justify-between bg-[#0F172A]/80 px-4 py-2.5 rounded-lg border border-emerald-500/30">
                                        <span className="text-emerald-400 text-sm font-medium">👤 {loggedInUser.username}</span>
                                        <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-gray-500 hover:text-red-400 text-xs transition-colors">ออกจากระบบ</button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => { setIsLoginOpen(true); setIsMobileMenuOpen(false); }}
                                        className='w-full cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg transition-all shadow-md text-base font-medium'>
                                        เข้าสู่ระบบ
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>


            <div className='w-[95%] flex justify-start'>
                <h1 className='text-3xl font-bold mt-8 text-blue-400 '>สถานี: {selectedNode}</h1>
            </div>

            {/* Map */}
            <div className="bg-[#1E293B] w-[95%] h-75 md:h-75 mt-4 rounded-lg overflow-hidden ">
                <MapComponent
                    nodes={node}
                    selectedNode={selectedNode}
                    onNodeSelect={(nodeName) => setSelectedNode(nodeName)}
                    zoom={12}
                />
            </div>

            {/* Grid */}
            <div className='grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 mt-4 w-[95%]'>

                <div className='bg-[#1E293B] w-full h-50 rounded-lg flex items-center p-3'>
                    <CardToDay node={dataNode} />
                </div>

                <div className='bg-[#1E293B] w-full h-50 rounded-lg flex items-center justify-start md:justify-center p-2 overflow-x-auto gap-3 touch-pan-x snap-x pb-3'>
                    <Card7day node={selectedNode} />
                </div>

            </div>

            <div className='bg-[#1E293B] w-[95%] h-auto mt-4 rounded-lg p-4'>
                <p className='text-xl font-bold'>ข้อมูลทั้งหมด</p>
                <CardAllDataNode node={dataNode} />
            </div>

            {/* Chart Area */}
            {/* Chart ตัวแรก */}
            <div className='w-[95%] h-96 lg:h-80 mt-4 min-w-0'>
                <ChartWidget node={selectedNode} metric="temp" />
            </div>

            {/* Chart แถวที่สอง */}
            <div className='w-[95%] mt-4 flex flex-col lg:flex-row justify-center items-center gap-4'>
                <div className='w-full lg:w-1/2 h-96 lg:h-80 bg-[#1E293B] rounded-lg min-w-0'>
                    <ChartWidget node={selectedNode} metric="humidity" />
                </div>
                <div className='w-full lg:w-1/2 h-96 lg:h-80 bg-[#1E293B] rounded-lg min-w-0'>
                    <ChartWidget node={selectedNode} metric="wind_speed" />
                </div>
            </div>

            {/* Chart แถวที่สาม */}
            <div className='w-[95%] mt-4 flex flex-col lg:flex-row justify-center items-center gap-4'>
                <div className='w-full lg:w-1/2 h-96 lg:h-80 bg-[#1E293B] rounded-lg min-w-0'>
                    <ChartWidget node={selectedNode} metric="pressure" />
                </div>
                <div className='w-full lg:w-1/2 h-96 lg:h-80 bg-[#1E293B] rounded-lg min-w-0'>
                    <ChartWidget node={selectedNode} metric="light" />
                </div>
            </div>
            <div id="tmd" className='w-[95%] flex justify-start'>
                <h1 className='text-3xl font-bold mt-8 text-blue-400 '>กรมอุตุนิยมวิทยา ตาก</h1>
            </div>
            
            {/* ----------------------------------------- TMD ----------------------------------------- */}
            <CardPre7day />

            <div className="bg-[#202124] w-[95%] h-auto mt-4 rounded-lg p-4">
                <div className="bg-[#202124] w-full h-auto  p-4 border-b border-[#334155] ">
                    <p className='text-xl font-bold'>ข้อมูลทั้งหมด</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div className="bg-[#1E293B] w-full h-96 lg:h-80 rounded-lg flex items-center p-3">
                        <ChartWidgetTMD metric="temp"/>
                    </div>
                    <div className="bg-[#1E293B] w-full h-96 lg:h-80 rounded-lg flex items-center p-3">
                        <ChartWidgetTMD metric="humidity"/>
                    </div>
                    <div className="bg-[#1E293B] w-full h-96 lg:h-80 rounded-lg flex items-center p-3">
                        <ChartWidgetTMD metric="wind_speed"/>
                    </div>
                    <div className="bg-[#1E293B] w-full h-96 lg:h-80 rounded-lg flex items-center p-3">
                        <ChartWidgetTMD metric="rain"/>
                    </div>
                </div>
            </div>

            {/* ----------------------------------------- MSN ----------------------------------------- */}
            <div id="msn" className='w-[95%] flex justify-start'>
                <h1 className='text-3xl font-bold mt-8 text-blue-400 '>Microsoft Weather (MSN)</h1>
            </div>
            
            <CardCurrentMSN />

            <div className="bg-[#202124] w-[95%] h-auto mt-4 rounded-lg p-4">
                <div className="bg-[#202124] w-full h-auto  p-4 border-b border-[#334155] ">
                    <p className='text-xl font-bold'>ข้อมูลทั้งหมด</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div className="bg-[#1E293B] w-full h-96 lg:h-80 rounded-lg flex items-center p-3">
                        <ChartWidgetMSN metric="temp"/>
                    </div>
                    <div className="bg-[#1E293B] w-full h-96 lg:h-80 rounded-lg flex items-center p-3">
                        <ChartWidgetMSN metric="humidity"/>
                    </div>
                    <div className="bg-[#1E293B] w-full h-96 lg:h-80 rounded-lg flex items-center p-3">
                        <ChartWidgetMSN metric="wind_speed"/>
                    </div>
                    <div className="bg-[#1E293B] w-full h-96 lg:h-80 rounded-lg flex items-center p-3">
                        <ChartWidgetMSN metric="pm25"/>
                    </div>
                </div>
            </div>

            <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
            <LoginModal
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onOpenRegister={() => setIsRegisterOpen(true)}
                onLoginSuccess={(user) => handleLoginSuccess(user)}
            />
            <DownloadModal isOpen={isDownloadOpen} onClose={() => setIsDownloadOpen(false)} />
        </div>
    )
}

export default Dashboard