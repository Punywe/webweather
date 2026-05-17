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

export const ChartWidgetWeather = ({ metric = 'temp' }) => {
    const [data24h, setData24h] = useState([]);

    const metricsConfig = {
        temp: { label: 'อุณหภูมิ', unit: '°C', color: '#3B82F6', dataKey: 'temperature_w' },
        humidity: { label: 'ความชื้น', unit: '%', color: '#10B981', dataKey: 'humidity_w' },
        wind: { label: 'ความเร็วลม', unit: 'km/h', color: '#F59E0B', dataKey: 'wind_w' },
        pressure: { label: 'ความกดอากาศ', unit: 'hPa', color: '#8B5CF6', dataKey: 'pressure_w' },
    };

    useEffect(() => {
        fetch(`/api/getData24hWeather/`)
            .then(res => res.json())
            .then(data => {
                setData24h(data.data || []);
            })
            .catch(err => console.error("Error fetching 24h Weather data:", err));
    }, []);

    const currentMetric = metricsConfig[metric] || metricsConfig['temp'];

    return (
        <div className="w-full h-full flex flex-col p-4 bg-[#1E293B] rounded-lg relative">
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{currentMetric.label} (24 ชม.)</h2>
                </div>
            </div>

            {data24h.length === 0 ? (
                <div className="flex-1 flex justify-center items-center min-h-[200px]">
                    <p className="text-gray-400">Loading data...</p>
                </div>
            ) : (
                <div className="w-full flex-1 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data24h}
                            margin={{
                                top: 10,
                                right: 10,
                                left: 10,
                                bottom: 25,
                            }}
                        >
                            <defs>
                                <linearGradient id={`colorMetricWeather-${metric}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis 
                                dataKey="time" 
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
                                dataKey={currentMetric.dataKey} 
                                stroke={currentMetric.color} 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill={`url(#colorMetricWeather-${metric})`} 
                                activeDot={{ r: 6, fill: currentMetric.color, stroke: '#0F172A', strokeWidth: 3 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};
