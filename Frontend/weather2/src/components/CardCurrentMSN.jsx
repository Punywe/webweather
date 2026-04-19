import React, { useState, useEffect } from 'react'
import sun from "../images/sun.png"
import cloudy from "../images/cloudy.png"
import snow from "../images/snow.png"

export const CardCurrentMSN = () => {
    const [data, setData] = useState(null)

    useEffect(() => {
        fetch('http://localhost:8000/getDataMSN/')
            .then(res => res.json())
            .then(resData => {
                if(resData.data && resData.data.length > 0) {
                    const row = resData.data[0];
                    setData({
                        // check if it's an array or dict just in case
                        date_time: row.date_time || row[0],
                        temp: row.temperature_msn !== undefined ? row.temperature_msn : row[1],
                        humidity: row.humidity_msn !== undefined ? row.humidity_msn : row[2],
                        wind_speed: row.wind_speed_msn !== undefined ? row.wind_speed_msn : row[3],
                        pm25: row.pm25 !== undefined ? row.pm25 : row[4],
                        weather_text: row.weather_text_msn || row[5]
                    });
                }
            })
            .catch(err => console.error(err))
    }, [])

    if (!data) return (
        <div className="bg-[#202124] text-white p-5 md:p-6 rounded-2xl w-[95%] mx-auto h-32 flex items-center justify-center mt-4">
            <div className="animate-pulse text-lg text-gray-400">Loading MSN data...</div>
        </div>
    );

    return (
        <div className="bg-[#202124] text-white p-5 md:p-6 rounded-2xl w-[95%] mx-auto font-outfit shadow-lg flex flex-col md:flex-row justify-between items-center transition-all duration-300">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
                <div className="w-20 md:w-24 h-full flex justify-center items-center drop-shadow-md">
                    <img src={data.temp > 30 ? sun : data.temp > 25 ? cloudy : snow} alt="Weather Icon" className="w-full h-auto object-contain" />
                </div>
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="flex items-start">
                        <span className="text-6xl md:text-7xl font-medium tracking-tighter">{data.temp}</span>
                        <div className="text-xl md:text-2xl font-normal text-gray-400 mt-1 md:mt-2 ml-1">
                            <span className="text-white">°C</span>
                        </div>
                    </div>
                    <p className="text-gray-400 mt-2 text-sm">อัพเดทล่าสุด: {new Date(data.date_time).toLocaleString()}</p>
                </div>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end text-[14px] md:text-[16px] text-gray-300 gap-x-8 gap-y-3 mt-6 md:mt-0 tracking-wide bg-[#1E293B] p-4 rounded-xl border border-[#334155]/50 w-full md:w-auto">
                <div className="flex flex-col gap-2">
                    <p>สภาพอากาศ: <span className="text-white font-medium">{data.weather_text || '-'}</span></p>
                    <p>ความชื้น: <span className="text-white font-medium">{data.humidity != null ? `${data.humidity}%` : '-'}</span></p>
                </div>
                <div className="flex flex-col gap-2">
                    <p>ความเร็วลม: <span className="text-white font-medium">{data.wind_speed != null ? `${data.wind_speed} km/h` : '-'}</span></p>
                    <p>PM 2.5: <span className="text-[#EF4444] font-bold">{data.pm25 != null ? `${data.pm25} µg/m³` : '-'}</span></p>
                </div>
            </div>
        </div>
    )
}
