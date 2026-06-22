import React from 'react'
import sun from "../images/sun.png"
import cloudy from "../images/cloudy.png"
import rain from "../images/heavy-rain.png"
import snow from "../images/snow.png"
import { getRainIcon } from './RainIcons'

export const CardToDay = ({ node, rainTrend3 = 0 }) => {
    if (!node) {
        return (
            <div className='flex w-full h-full items-center justify-center'>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className='text-gray-400 text-xs font-medium tracking-wider'>LOADING DATA</p>
                </div>
            </div>
        )
    }
    return (
        <div className='relative w-full h-full flex flex-col items-center justify-center p-6 animate-msn-in overflow-hidden'>
            {/* Background Decorative Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center gap-4">
                {/* Weather Icon with Glow */}
                <div className="relative group shrink-0">
                    <div className="absolute inset-0 bg-blue-400/20 blur-[50px] rounded-full group-hover:bg-blue-400/40 transition-all duration-700 scale-125"></div>
                    {getRainIcon(rainTrend3, 'w-32 sm:w-44 relative z-10 drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)] transform transition-all duration-700 group-hover:scale-110 group-hover:-rotate-3') || (
                        <img
                            src={node.temp > 30 ? sun : node.temp > 19 ? cloudy : snow}
                            alt="Weather"
                            className="w-32 sm:w-44 relative z-10 drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)] transform transition-all duration-700 group-hover:scale-110 group-hover:-rotate-3"
                        />
                    )}
                </div>

                {/* Temperature and Info Section */}
                <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/90">Live Status</h2>
                    </div>
                    
                    <div className="flex items-start gap-1">
                        <p className='text-7xl sm:text-8xl font-black tracking-tighter text-white drop-shadow-2xl selection:bg-blue-500'>
                            {node.temp}
                        </p>
                        <span className="text-2xl sm:text-3xl font-light text-blue-300 mt-3">°C</span>
                    </div>

                    <div className="mt-4 flex flex-col items-center gap-1 opacity-80">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-black">Updated on</span>
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <span className="text-xs sm:text-sm text-blue-100 font-bold tracking-tight">{node.date}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
