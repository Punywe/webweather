import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { X } from 'lucide-react';

export const ChartWidget = ({ node, metric = 'temp' }) => {
    const [viewMode, setViewMode] = useState('24h'); // '24h' or '7d'
    const [data24h, setData24h] = useState([]);
    const [data7d, setData7d] = useState([]);

    const metricsConfig = {
        temp: { label: 'อุณหภูมิ', unit: '°C', color: '#3B82F6' },
        humidity: { label: 'ความชื้น', unit: '%', color: '#10B981' },
        wind_speed: { label: 'ความเร็วลม', unit: 'm/s', color: '#F59E0B' },
        wind_gust: { label: 'ลมกระโชก', unit: 'm/s', color: '#EF4444' },
        pressure: { label: 'ความกดอากาศ', unit: 'hPa', color: '#8B5CF6' },
        light: { label: 'แสงสว่าง', unit: 'lux', color: '#EAB308' },
    };

    useEffect(() => {
        if (!node) return;
        
        // Fetch 24h
        fetch(`/api/get24h/${node}`)
            .then(res => res.json())
            .then(data => {
                setData24h(data.data);
            })
            .catch(err => console.error("Error fetching 24h data:", err));
            
        // Fetch 7day
        fetch(`/api/get7day/${node}`)
            .then(res => res.json())
            .then(data => {
                setData7d(data.data);
            })
            .catch(err => console.error("Error fetching 7day data:", err));
    }, [node]);

    const chartData = viewMode === '24h' ? data24h : data7d;
    const xAxisKey = viewMode === '24h' ? 'time' : 'day_name';
    const currentMetric = metricsConfig[metric];

    if (!node) return <div className="text-gray-400 text-sm p-4 w-full h-full flex justify-center items-center">กรุณาเลือก Node</div>;

    return (
        <div className="w-full h-full flex flex-col p-6 msn-glass rounded-2xl relative overflow-hidden animate-msn-in">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[100px] rounded-full"></div>
            
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 9-7 7-7-7"/></svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">{currentMetric.label}</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Historical Data</p>
                    </div>
                </div>
                <div className="flex bg-black/20 backdrop-blur-md rounded-xl p-1 border border-white/5">
                    <button 
                        onClick={() => setViewMode('24h')}
                        className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-500 ${viewMode === '24h' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'text-gray-400 hover:text-white'}`}
                    >
                        24 HOURS
                    </button>
                    <button 
                        onClick={() => setViewMode('7d')}
                        className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-500 ${viewMode === '7d' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'text-gray-400 hover:text-white'}`}
                    >
                        7 DAYS
                    </button>
                </div>
            </div>

            {chartData.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center min-h-[240px] gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <X className="text-gray-600" size={24} />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">ไม่มีข้อมูลในขณะนี้</p>
                </div>
            ) : (
                <div className="w-full flex-1 min-h-[240px] relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                        >
                            <defs>
                                <linearGradient id={`color-${metric}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis 
                                dataKey={xAxisKey} 
                                stroke="rgba(255,255,255,0.3)" 
                                fontSize={10}
                                fontWeight={600}
                                tickMargin={15} 
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis 
                                stroke="rgba(255,255,255,0.3)" 
                                fontSize={10} 
                                fontWeight={600}
                                tickFormatter={(value) => `${value}${currentMetric.unit}`}
                                tickLine={false}
                                axisLine={false}
                                width={60}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                    backdropFilter: 'blur(10px)',
                                    borderColor: 'rgba(255, 255, 255, 0.1)', 
                                    borderRadius: '16px', 
                                    padding: '12px 16px', 
                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
                                    borderWidth: '1px'
                                }}
                                itemStyle={{ color: currentMetric.color, fontWeight: '800', fontSize: '14px' }}
                                labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '8px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey={metric} 
                                stroke={currentMetric.color} 
                                strokeWidth={4}
                                fillOpacity={1} 
                                fill={`url(#color-${metric})`}
                                animationDuration={1500}
                                activeDot={{ r: 8, fill: currentMetric.color, stroke: '#1E293B', strokeWidth: 4, shadow: '0 0 20px rgba(0,0,0,0.5)' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};
