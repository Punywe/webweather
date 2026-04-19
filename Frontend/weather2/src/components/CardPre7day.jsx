import React, { useState, useEffect } from 'react';
import { Sun, CloudSun, Cloud, CloudDrizzle, CloudRain, CloudLightning, Snowflake, CloudFog, Wind } from 'lucide-react';

const getWeatherIcon = (cond, className) => {
    switch(cond) {
        case 1: return <Sun className={className} color="#FBBF24" />; // yellow-400
        case 2: return <CloudSun className={className} color="#FBBF24" />;
        case 3: 
        case 4: return <Cloud className={className} color="#9CA3AF" />; // gray-400
        case 5: return <CloudDrizzle className={className} color="#60A5FA" />; // blue-400
        case 6: return <CloudRain className={className} color="#3B82F6" />; // blue-500
        case 7: 
        case 8: return <CloudLightning className={className} color="#EAB308" />; // yellow-500
        case 9: return <Snowflake className={className} color="#A5F3FC" />; // cyan-200
        case 10: return <CloudFog className={className} color="#9CA3AF" />;
        case 11: return <Wind className={className} color="#D1D5DB" />; // gray-300
        default: return <Cloud className={className} color="#9CA3AF" />;
    }
}

export const CardPre7day = () => {
    const [forecasts, setForecasts] = useState([]);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/getPre7day/')
            .then(res => res.json())
            .then(data => {
                if(data && data.forecasts) {
                    setForecasts(data.forecasts);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="bg-[#202124] text-white p-5 md:p-6 rounded-2xl w-[95%] mx-auto h-64 flex items-center justify-center mt-4">
            <div className="animate-pulse text-lg text-gray-400">Loading forecast...</div>
        </div>
    );
    if (!forecasts.length) return (
        <div className="bg-[#202124] text-white p-5 md:p-6 rounded-2xl w-[95%] mx-auto mt-4">No data available</div>
    );

    const current = forecasts[selectedIdx];

    return (
        <div className="bg-[#202124] text-white p-5 md:p-6 rounded-2xl w-[95%] mx-auto font-outfit shadow-lg mt-4 flex flex-col transition-all duration-300">
            
            {/* Top Area: Current Detail */}
            <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-6 md:gap-0">
                <div className="flex flex-col md:flex-row items-center md:items-center gap-4">
                    {/* Icon */}
                    <div>
                        {getWeatherIcon(current.cond, "w-20 h-20 md:w-24 md:h-24 drop-shadow-md")}
                    </div>
                    {/* Temp & Additional Info */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-0">
                        <div className="flex items-start">
                            <span className="text-6xl md:text-7xl font-medium tracking-tighter">{current.tc_max}</span>
                            <div className="text-xl md:text-2xl font-normal text-gray-400 mt-1 md:mt-2 ml-1">
                                <span className="text-white">°C</span><span className="mx-1">|</span><span>°F</span>
                            </div>
                        </div>
                        <div className="sm:ml-8 flex flex-row sm:flex-col flex-wrap justify-center text-[13px] md:text-[15px] text-gray-400 gap-3 sm:gap-1 tracking-wide items-center sm:items-start">
                            <p>ปริมาณฝน: <span className="text-white">{current.rain} mm</span></p>
                            <p>ความชื้น: <span className="text-white">{current.rh}%</span></p>
                            <p>ต่ำสุด: <span className="text-white">{current.tc_min}°C</span></p>
                        </div>
                    </div>
                </div>

                {/* Right side Text */}
                <div className="text-center md:text-right flex flex-col justify-center">
                    <h3 className="text-2xl md:text-3xl tracking-wide mb-1">พยากรณ์อากาศ</h3>
                    <p className="text-lg md:text-xl text-gray-300 mb-1">วัน{current.weekday}</p>
                    <p className="text-base md:text-lg text-gray-400">{current.cond_th}</p>
                </div>
            </div>

            {/* Bottom Area: 7 Day Selector */}
            <div className="flex justify-start md:justify-between items-stretch gap-2 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-700/50 overflow-x-auto pb-2 scrollbar-hide">
                {forecasts.map((day, idx) => {
                    const isSelected = idx === selectedIdx;
                    return (
                        <div 
                            key={idx} 
                            onClick={() => setSelectedIdx(idx)}
                            className={`flex flex-col min-w-20 md:min-w-0 flex-1 items-center justify-center py-3 rounded-2xl cursor-pointer transition-all duration-200 select-none shrink-0 md:shrink
                                ${isSelected ? 'bg-[#3C4043] shadow-md' : 'hover:bg-white/5'}
                            `}
                        >
                            <p className={`text-[13px] md:text-[15px] font-medium mb-2 md:mb-3 whitespace-nowrap ${isSelected ? 'text-white' : 'text-gray-300'}`}>{day.weekday}</p>
                            <div className="mb-2 md:mb-3">
                                {getWeatherIcon(day.cond, "w-8 h-8 md:w-10 md:h-10 drop-shadow-sm")}
                            </div>
                            <div className="flex items-center gap-1 md:gap-2 text-[13px] md:text-[15px]">
                                <span className="font-bold text-white">{day.tc_max}°</span>
                                <span className="text-gray-400">{day.tc_min}°</span>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
