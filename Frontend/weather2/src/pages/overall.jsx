import { useState, useEffect } from 'react';
import { Menu, X, ArrowLeft, Thermometer, Droplets, Wind, ArrowUpRight, ArrowDownRight, Minus, BarChart3, Database, CloudSun } from 'lucide-react';
import { Link } from 'react-router-dom';

const Overall = () => {
    const [averages, setAverages] = useState({ temp: 0, humidity: 0, wind_speed: 0 });
    const [tmdData, setTmdData] = useState({ temp: 0, humidity: 0, wind_speed: 0 });
    const [msnData, setMsnData] = useState({ temp: 0, humidity: 0, wind_speed: 0 });
    const [loading, setLoading] = useState(true);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

                let totalTemp = 0, totalHum = 0, totalWind = 0;
                let validNodesCount = 0;

                nodeResults.forEach(res => {
                    const data = res.data && res.data[0];
                    if (data) {
                        totalTemp += data.temp || 0;
                        totalHum += data.humidity || 0;
                        totalWind += data.wind_speed || 0;
                        validNodesCount++;
                    }
                });

                if (validNodesCount > 0) {
                    setAverages({
                        temp: totalTemp / validNodesCount,
                        humidity: totalHum / validNodesCount,
                        wind_speed: totalWind / validNodesCount
                    });
                }

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

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const formatValue = (val) => Number(val).toFixed(2);
    
    const calcDiff = (nodeVal, otherVal) => {
        if (!otherVal || otherVal === 0) return { diff: 0, percent: 0, sign: 0 };
        const diff = nodeVal - otherVal;
        const percent = (Math.abs(diff) / otherVal) * 100;
        return { 
            diff: diff, 
            percent: percent, 
            sign: diff > 0 ? 1 : diff < 0 ? -1 : 0 
        };
    };

    const getDiffBadge = (difference) => {
        if (difference.sign > 0) {
            return (
                <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0">
                    <ArrowUpRight size={14} />
                    <span>+{formatValue(difference.diff)} ({formatValue(difference.percent)}%)</span>
                </div>
            );
        } else if (difference.sign < 0) {
            return (
                <div className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0">
                    <ArrowDownRight size={14} />
                    <span>{formatValue(difference.diff)} ({formatValue(difference.percent)}%)</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1 text-gray-400 bg-gray-500/10 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0">
                <Minus size={14} />
                <span>0 (0%)</span>
            </div>
        );
    };

    const StatsRow = ({ label, leftVal, rightVal, unit, isLast }) => (
        <div className={`flex items-center w-full py-5 ${!isLast ? 'border-b border-[#334155]/40' : ''}`}>
             <div className="flex-1 text-center text-2xl font-semibold text-gray-200">
                 {formatValue(leftVal)} <span className="text-sm font-normal text-gray-500">{unit}</span>
             </div>
             <div className="w-32 bg-[#0F172A]/60 border border-[#334155]/30 rounded-full py-1.5 text-center text-[11px] uppercase font-bold text-gray-400 tracking-wider">
                 {label}
             </div>
             <div className="flex-1 text-center text-2xl font-semibold text-gray-200">
                 {formatValue(rightVal)} <span className="text-sm font-normal text-gray-500">{unit}</span>
             </div>
        </div>
    );

    const SideBySideCompare = ({ leftTitle, rightTitle, leftColorClass, rightColorClass, leftBorderClass, rightBorderClass, leftData, rightData, leftIcon: LeftIcon, rightIcon: RightIcon }) => {
        return (
            <div className="w-full bg-[#1E293B]/40 rounded-xl overflow-hidden border border-[#334155]/50 shadow-xl flex flex-col transition-transform hover:-translate-y-1 hover:shadow-blue-500/10 duration-300">
                {/* Header row with VS */}
                <div className="flex w-full items-stretch bg-[#0F172A]/60">
                    {/* Left Header */}
                    <div className={`flex-1 flex flex-col items-center justify-center py-8 border-t-4 ${leftBorderClass}`}>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-lg ${leftColorClass}`}>
                            <LeftIcon size={32} className="text-white" />
                        </div>
                        <h2 className={`text-lg md:text-xl font-bold tracking-wide ${leftBorderClass.replace('border-t-', 'text-')}`}>{leftTitle}</h2>
                    </div>

                    {/* VS middle */}
                    <div className="w-16 md:w-24 flex items-center justify-center relative bg-[#0F172A]">
                         <span className="text-2xl md:text-3xl font-black text-gray-500/30">VS.</span>
                    </div>

                    {/* Right Header */}
                    <div className={`flex-1 flex flex-col items-center justify-center py-8 border-t-4 ${rightBorderClass}`}>
                         <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-lg ${rightColorClass}`}>
                            <RightIcon size={32} className="text-white" />
                        </div>
                        <h2 className={`text-lg md:text-xl font-bold tracking-wide ${rightBorderClass.replace('border-t-', 'text-')}`}>{rightTitle}</h2>
                    </div>
                </div>

                {/* Rows wrapper */}
                <div className="bg-[#1E293B]/40 px-4 md:px-10 pb-2">
                    <StatsRow label="อุณหภูมิ" unit="°C" leftVal={leftData.temp} rightVal={rightData.temp} />
                    <StatsRow label="ความชื้น" unit="%" leftVal={leftData.humidity} rightVal={rightData.humidity} />
                    <StatsRow label="ความเร็วลม" unit="km/h" leftVal={leftData.wind_speed} rightVal={rightData.wind_speed} isLast={true} />
                </div>
            </div>
        )
    };

    const OverviewItem = ({ title, nodeVal, tmdVal, msnVal, unit, icon: Icon, colorClass }) => {
        const diffTMD = calcDiff(nodeVal, tmdVal);
        const diffMSN = calcDiff(nodeVal, msnVal);
        return (
            <div className="flex flex-col md:flex-row md:items-center justify-between p-5 border-b border-[#334155]/40 last:border-0 hover:bg-[#0F172A]/40 transition-colors">
                <div className="flex items-center gap-3 mb-4 md:mb-0 w-48">
                    <div className={`p-2 rounded-lg bg-[#1E293B] ${colorClass}`}>
                       <Icon size={20} />
                    </div>
                    <span className="font-semibold text-gray-200">{title}</span>
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="flex flex-col bg-[#1E293B]/60 p-4 rounded-xl border border-[#334155]/60 hover:border-blue-500/30 transition-colors">
                         <span className="text-xs text-gray-400 mb-2 font-medium">ส่วนต่างจาก กรมอุตุ</span>
                         <div className="flex justify-between items-center">
                             <div className="flex items-baseline gap-1">
                                 <span className="text-lg font-bold text-gray-100">{formatValue(nodeVal)}</span>
                                 <span className="text-xs text-gray-500">vs {formatValue(tmdVal)} {unit}</span>
                             </div>
                             {getDiffBadge(diffTMD)}
                         </div>
                     </div>
                     <div className="flex flex-col bg-[#1E293B]/60 p-4 rounded-xl border border-[#334155]/60 hover:border-emerald-500/30 transition-colors">
                         <span className="text-xs text-gray-400 mb-2 font-medium">ส่วนต่างจาก MSN</span>
                         <div className="flex justify-between items-center">
                             <div className="flex items-baseline gap-1">
                                 <span className="text-lg font-bold text-gray-100">{formatValue(nodeVal)}</span>
                                 <span className="text-xs text-gray-500">vs {formatValue(msnVal)} {unit}</span>
                             </div>
                             {getDiffBadge(diffMSN)}
                         </div>
                     </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-[#0F172A] text-white w-full min-h-screen flex flex-col items-center pb-12 font-outfit">
            {/* Simple Navbar */}
            <div className='sticky top-4 z-50 bg-[#1E293B]/80 backdrop-blur-md border border-[#334155]/50 shadow-lg w-[95%] rounded-xl flex flex-col px-4 md:px-6 transition-all duration-300'>
                <div className="w-full flex justify-between items-center h-14">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-gray-400 hover:text-white transition-colors p-1 bg-[#0F172A] rounded-lg border border-[#334155]">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-emerald-400 tracking-wide">
                            ค่าเฉลี่ยภาพรวม
                        </div>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
                        <Link to="/" className='cursor-pointer hover:text-blue-400 transition-colors'>หน้าแรก</Link>
                    </div>

                    <button 
                        className="md:hidden text-gray-300 hover:text-white p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {isMobileMenuOpen && (
                    <div className="md:hidden flex flex-col gap-4 pb-5 pt-2 border-t border-[#334155]/50 mt-1">
                        <div className="flex flex-col gap-4 text-[15px] font-medium text-gray-300 pl-2">
                            <Link to="/" className='cursor-pointer hover:text-blue-400 transition-colors inline-block'>หน้าแรก</Link>
                        </div>
                    </div>
                )}
            </div>

            <div className="w-[95%] max-w-5xl mt-12 pb-16">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-white to-gray-400 mb-3">
                        เปรียบเทียบข้อมูล
                    </h1>
                    <p className="text-gray-400 text-lg">เปรียบเทียบค่าเฉลี่ยสถานี กับ API ภายนอก (กรมอุตุ & MSN)</p>
                </div>

                {loading ? (
                    <div className="w-full h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {/* TMD Comparison Side-by-side */}
                            <SideBySideCompare 
                                leftTitle="ค่าเฉลี่ยสถานี"
                                rightTitle="กรมอุตุ"
                                leftColorClass="bg-orange-500"
                                rightColorClass="bg-blue-500"
                                leftBorderClass="border-t-orange-500"
                                rightBorderClass="border-t-blue-500"
                                leftIcon={Database}
                                rightIcon={CloudSun}
                                leftData={averages}
                                rightData={tmdData}
                            />

                            {/* MSN Comparison Side-by-side */}
                            <SideBySideCompare 
                                leftTitle="ค่าเฉลี่ยสถานี"
                                rightTitle="MSN"
                                leftColorClass="bg-orange-500"
                                rightColorClass="bg-emerald-500"
                                leftBorderClass="border-t-orange-500"
                                rightBorderClass="border-t-emerald-500"
                                leftIcon={Database}
                                rightIcon={CloudSun}
                                leftData={averages}
                                rightData={msnData}
                            />
                        </div>

                        {/* Summary / Overview Section */}
                        <div className="mt-8 bg-[#1E293B]/40 rounded-xl overflow-hidden border border-[#334155]/50 shadow-xl">
                            {/* Header */}
                            <div className="w-full bg-linear-to-r from-cyan-600 to-blue-600 p-4 text-white font-bold flex items-center justify-between">
                                <span className="flex items-center gap-2 text-lg">
                                    <BarChart3 size={22}/> 
                                    ภาพรวมส่วนต่างเทียบข้อมูลล่าสุด
                                </span>
                                <span className="hidden sm:inline-block text-xs font-medium bg-black/20 px-3 py-1 rounded-full border border-white/10">
                                    ค่าเฉลี่ยสถานี เทียบ API ภายนอก
                                </span>
                            </div>

                            {/* Body (List of items) */}
                            <div className="flex flex-col">
                                <OverviewItem 
                                    title="อุณหภูมิ" 
                                    unit="°C"
                                    icon={Thermometer} 
                                    colorClass="text-rose-400 bg-rose-500/10"
                                    nodeVal={averages.temp} 
                                    tmdVal={tmdData.temp} 
                                    msnVal={msnData.temp} 
                                />
                                <OverviewItem 
                                    title="ความชื้น" 
                                    unit="%"
                                    icon={Droplets} 
                                    colorClass="text-blue-400 bg-blue-500/10"
                                    nodeVal={averages.humidity} 
                                    tmdVal={tmdData.humidity} 
                                    msnVal={msnData.humidity} 
                                />
                                <OverviewItem 
                                    title="ความเร็วลม"  
                                    unit="km/h"
                                    icon={Wind} 
                                    colorClass="text-teal-400 bg-teal-500/10"
                                    nodeVal={averages.wind_speed} 
                                    tmdVal={tmdData.wind_speed} 
                                    msnVal={msnData.wind_speed} 
                                />
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default Overall;
