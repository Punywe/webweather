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
        <div className="w-full h-full flex flex-col p-4 bg-[#1E293B] rounded-lg relative">
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{currentMetric.label}</h2>
                </div>
                <div className="flex bg-[#0F172A] rounded-lg p-1">
                    <button 
                        onClick={() => setViewMode('24h')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${viewMode === '24h' ? 'bg-[#3B82F6] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    >
                        24 ชั่วโมง
                    </button>
                    <button 
                        onClick={() => setViewMode('7d')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${viewMode === '7d' ? 'bg-[#3B82F6] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    >
                        7 วัน
                    </button>
                </div>
            </div>

            {chartData.length === 0 ? (
                <div className="flex-1 flex justify-center items-center min-h-[200px]">
                    <p className="text-gray-400">ไม่มีข้อมูล</p>
                </div>
            ) : (
                <div className="w-full flex-1 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: 10,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis 
                                dataKey={xAxisKey} 
                                stroke="#94A3B8" 
                                fontSize={12}
                                tickMargin={10} 
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis 
                                stroke="#94A3B8" 
                                fontSize={12} 
                                tickFormatter={(value) => `${value} ${currentMetric.unit}`}
                                tickLine={false}
                                axisLine={false}
                                dx={-5}
                                width={50}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#fff', borderRadius: '12px', padding: '10px 15px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: currentMetric.color, fontWeight: 'bold' }}
                                formatter={(value) => [`${value} ${currentMetric.unit}`, currentMetric.label]}
                                labelStyle={{ color: '#94A3B8', marginBottom: '8px', fontSize: '12px' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey={metric} 
                                stroke={currentMetric.color} 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorMetric)" 
                                activeDot={{ r: 6, fill: currentMetric.color, stroke: '#0F172A', strokeWidth: 3 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};
