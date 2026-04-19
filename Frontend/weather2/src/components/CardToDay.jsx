import React from 'react'
import sun from "../images/sun.png"
import cloudy from "../images/cloudy.png"
import rain from "../images/heavy-rain.png"
import snow from "../images/snow.png"

export const CardToDay = ({ node }) => {
    if (!node) {
        return (
            <div className='flex w-full h-full gap-10 items-center justify-center'>
                <p className='text-gray-400 text-sm animate-pulse'>กำลังโหลดข้อมูล...</p>
            </div>
        )
    }
    return (
        <div className='flex w-full h-full gap-10'>
            <div className="w-40 h-full flex justify-center items-center">
                <img src={node.temp > 30 ? sun : node.temp > 25 ? cloudy : snow} alt="" className="flex-1" />
            </div>
            <div className="flex-1 w-full h-full flex flex-col justify-center gap-4">
                <h2 className="text-2xl font-bold">วันนี้</h2>
                <p className='text-5xl font-bold'>{node.temp}°C</p>
                <p>{node.date}</p>
            </div>
        </div>
    )
}
