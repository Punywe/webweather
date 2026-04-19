import React from 'react'
import sun from "../images/sun.png"
import cloudy from "../images/cloudy.png"
import snow from "../images/snow.png"
import { useState, useEffect } from 'react'

export const Card7day = ({ node }) => {
    const [data, setData] = useState([])
    const [image, setImage] = useState([])
    useEffect(() => {
        if (!node) return
        fetch(`http://localhost:8000/get7day/${node}`)
            .then(res => res.json())
            .then(data => {
                setData(data.data)
            })
    }, [node])

    if (!node) return <p className='text-gray-400 text-sm'>กรุณาเลือก Node</p>
    if (data.length === 0) return <p className='text-gray-400 text-sm'>ไม่มีข้อมูล</p>

    return (
        <>
            {data.map((item, index) => (
                <div key={index} className='bg-[#37404e] w-30 h-full rounded-lg flex flex-col p-2 justify-center items-center gap-2 shrink-0'>
                    <div className='flex-1'>
                        <p className='text-lg font-bold'>{item.day_name}</p>
                    </div>
                    <div className='w-15 h-15'>
                        <img 
                            src={item.temp > 30 ? sun : item.temp > 25 ? cloudy : snow}
                            alt="" className='flex-1' />
                    </div>
                    <div className='flex-1'>
                        <p>{item.temp}°C</p>
                    </div>
                    <div className='flex-1'>
                        <p className='text-xs'>{item.date}</p>
                    </div>
                </div>
            ))}
        </>
    )
}
