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
        <div className='flex w-full h-full gap-4 sm:gap-10 items-center justify-center sm:justify-start px-2'>
            <div className="w-24 sm:w-40 flex justify-center items-center shrink-0">
                <img src={node.temp > 30 ? sun : node.temp > 25 ? cloudy : snow} alt="" className="w-full object-contain drop-shadow-lg" />
            </div>
            <div className="flex-1 w-full h-full flex flex-col justify-center gap-1 sm:gap-4">
                <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-300 to-emerald-300">วันนี้</h2>
                <p className='text-4xl sm:text-5xl font-extrabold tracking-tight'>{node.temp}°C</p>
                <p className='text-sm sm:text-base text-gray-300'>{node.date}</p>
            </div>
        </div>
    )
}
