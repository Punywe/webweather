import React from 'react'
import sun from "../images/sun.png"
import cloudy from "../images/cloudy.png"
import snow from "../images/snow.png"
import { useState, useEffect } from 'react'
import { getRainIcon } from './RainIcons'

export const Card7day = ({ node }) => {
    const [data, setData] = useState([])
    const [image, setImage] = useState([])
    useEffect(() => {
        if (!node) return
        fetch(`/api/get7day/${node}`)
            .then(res => res.json())
            .then(data => {
                setData(data.data)
            })
    }, [node])

    if (!node) return <p className='text-gray-400 text-sm'>กรุณาเลือก Node</p>
    if (data.length === 0) return <p className='text-gray-400 text-sm'>ไม่มีข้อมูล</p>

    return (
        <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth animate-msn-in">
            {data.map((item, index) => {
                // คำนวณ RainTrend3 สำหรับวันนี้ (index): ใช้ max_rain จาก index, index+1, index+2
                const rainValues = [index, index + 1, index + 2]
                    .filter(i => i < data.length)
                    .map(i => data[i].max_rain ?? 0)
                const rainTrend3 = rainValues.length > 0
                    ? rainValues.reduce((a, v) => a + v, 0) / rainValues.length
                    : 0
                const rainIcon = getRainIcon(rainTrend3, 'relative z-10 w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500')

                return (
                    <div
                        key={index}
                        className='msn-glass msn-card-hover w-28 sm:w-32 rounded-2xl flex flex-col p-4 justify-between items-center gap-3 shrink-0 group'
                    >
                        <div className='text-center'>
                            <p className='text-xs font-bold text-blue-300/80 uppercase tracking-widest'>{item.day_name}</p>
                            <p className='text-[10px] text-gray-500 mt-0.5'>{item.date}</p>
                        </div>

                        <div className='w-14 h-14 relative'>
                            <div className="absolute inset-0 bg-white/5 blur-xl rounded-full scale-150"></div>
                            {rainIcon ? rainIcon : (
                                <img
                                    src={item.temp > 30 ? sun : item.temp > 19 ? cloudy : snow}
                                    alt="Weather"
                                    className='relative z-10 w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500'
                                />
                            )}
                        </div>

                        <div className='text-center'>
                            <p className='text-2xl font-bold text-white'>{item.temp}°</p>
                            <div className="w-8 h-1 bg-blue-500/30 rounded-full mt-2 mx-auto overflow-hidden">
                                <div className="h-full bg-blue-400" style={{ width: `${Math.min(100, (item.temp / 40) * 100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
