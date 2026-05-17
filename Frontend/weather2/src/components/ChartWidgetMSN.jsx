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

export const ChartWidgetMSN = ({ metric = 'temp' }) => {
    const [viewMode, setViewMode] = useState('24h'); // '24h' or '7d'
    const [data24h, setData24h] = useState([]);
    const [data7d, setData7d] = useState([]);

    const metricsConfig = {
        temp: { label: 'อุณหภูมิ', unit: '°C', color: '#3B82F6' },
        humidity: { label: 'ความชื้น', unit: '%', color: '#10B981' },
        wind_speed: { label: 'ความเร็วลม', unit: 'km/h', color: '#F59E0B' },
        pm25: { label: 'PM 2.5', unit: 'µg/m³', color: '#EF4444' },
    };

    useEffect(() => {
        // Fetch 24h
        fetch(`/api/getData24hmsn/`)
            .then(res => res.json())
            .then(data => {
                const mapped24h = data.data.map(item => ({
                    time: item.time,
                    temp: item.temperature_msn,
                    humidity: item.humidity_msn,
                    wind_speed: item.wind_speed_msn,
                    pm25: item.pm25,
                    weather_text: item.weather_text_msn
                }));
                setData24h(mapped24h);
            })
            .catch(err => console.error("Error fetching 24h MSN data:", err));
            
        // Fetch 7day
        fetch(`/api/get7dayMSN/`)
            .then(res => res.json())
            .then(data => {
                const reversedData = [...data.data].reverse();
                const mapped7d = reversedData.map(item => ({
                    day_name: item.day_name,
                    temp: item.temp,
                    humidity: item.humidity,
                    wind_speed: item.wind_speed,
                    pm25: item.pm25,
                    weather_text: item.weather_text
                }));
                setData7d(mapped7d);
            })
            .catch(err => console.error("Error fetching 7day MSN data:", err));
    }, []);

    const chartData = viewMode === '24h' ? data24h : data7d;
    const xAxisKey = viewMode === '24h' ? 'time' : 'day_name';
    const currentMetric = metricsConfig[metric] || metricsConfig['temp'];

    return (
        <div className="w-full h-full flex flex-col p-4 bg-[#1E293B] rounded-lg relative">
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{currentMetric.label}</h2>
                </div>
                <div className="flex bg-[#0F172A] rounded p-0.5">
                    <button 
                        onClick={() => setViewMode('24h')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all duration-300 ${viewMode === '24h' ? 'bg-[#3B82F6] text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        24 ชั่วโมง
                    </button>
                    <button 
                        onClick={() => setViewMode('7d')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all duration-300 ${viewMode === '7d' ? 'bg-[#3B82F6] text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        7 วัน
                    </button>
                </div>
            </div>

            {chartData.length === 0 ? (
                <div className="flex-1 flex justify-center items-center min-h-[200px]">
                    <p className="text-gray-400">Loading data...</p>
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
                                bottom: 25,
                            }}
                        >
                            <defs>
                                <linearGradient id={`colorMetricMSN-${metric}`} x1="0" y1="0" x2="0" y2="1">
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
                                fill={`url(#colorMetricMSN-${metric})`} 
                                activeDot={{ r: 6, fill: currentMetric.color, stroke: '#0F172A', strokeWidth: 3 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};
