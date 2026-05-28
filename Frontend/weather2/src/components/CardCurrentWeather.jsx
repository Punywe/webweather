import React, { useState, useEffect } from 'react'
import sun from "../images/sun.png"
import cloudy from "../images/cloudy.png"
import snow from "../images/snow.png"

export const CardCurrentWeather = () => {
    const [data, setData] = useState(null)

    useEffect(() => {
        fetch('/api/getCurrentWeather/')
            .then(res => res.json())
            .then(resData => {
                if(resData.data) {
                    const row = resData.data;
                    setData({
                        date_time: row.date_time,
                        temp: row.temperature_w,
                        humidity: row.humidity_w,
                        wind_speed: row.wind_w,
                        pressure: row.pressure_w
                    });
                }
            })
            .catch(err => console.error(err))
    }, [])

    if (!data) return (
        <div className="bg-[#202124] text-white p-5 md:p-6 rounded-2xl w-[95%] mx-auto h-32 flex items-center justify-center mt-4">
            <div className="animate-pulse text-lg text-gray-400">กำลังโหลดข้อมูล Weather.com...</div>
        </div>
    );

    return (
        <div className="bg-[#202124] text-white p-5 md:p-6 rounded-2xl w-[95%] mx-auto font-outfit shadow-lg flex flex-col md:flex-row justify-between items-center transition-all duration-300">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
                <div className="w-20 md:w-24 h-full flex justify-center items-center drop-shadow-md">
                    <img src={data.temp > 30 ? sun : data.temp > 19 ? cloudy : snow} alt="Weather Icon" className="w-full h-auto object-contain" />
                </div>
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="flex items-start">
                        <span className="text-6xl md:text-7xl font-medium tracking-tighter">{data.temp}</span>
                        <div className="text-xl md:text-2xl font-normal text-gray-400 mt-1 md:mt-2 ml-1">
                            <span className="text-white">°C</span>
                        </div>
                    </div>
                    <p className="text-gray-400 mt-2 text-sm">อัพเดทล่าสุด: {new Date(data.date_time).toLocaleString('th-TH')}</p>
                </div>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end text-[14px] md:text-[16px] text-gray-300 gap-x-8 gap-y-3 mt-6 md:mt-0 tracking-wide bg-[#1E293B] p-4 rounded-xl border border-[#334155]/50 w-full md:w-auto">
                <div className="flex flex-col gap-2">
                    <p>แหล่งข้อมูล: <span className="text-blue-400 font-medium">Weather.com</span></p>
                    <p>ความชื้น: <span className="text-white font-medium">{data.humidity != null ? `${data.humidity}%` : '-'}</span></p>
                </div>
                <div className="flex flex-col gap-2">
                    <p>ความเร็วลม: <span className="text-white font-medium">{data.wind_speed != null ? `${data.wind_speed} km/h` : '-'}</span></p>
                    <p>ความกดอากาศ: <span className="text-emerald-400 font-medium">{data.pressure != null ? `${data.pressure} mb` : '-'}</span></p>
                </div>
            </div>
        </div>
    )
}
