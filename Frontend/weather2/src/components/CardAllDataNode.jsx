import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  CloudRain, 
  Wind, 
  Navigation, 
  Gauge, 
  Umbrella
} from 'lucide-react';

const DataCard = ({ title, value, unit, icon: Icon, iconColor, bgLight }) => (
  <div className="bg-[#0F172A]/60 border border-[#334155]/50 rounded-xl p-5 flex items-center gap-4 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:-translate-y-1 group">
    <div className={`p-3.5 rounded-xl flex items-center justify-center ${bgLight} transition-all duration-300`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <div className="flex flex-col">
      <span className="text-slate-400 text-sm font-medium">{title}</span>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span className="text-gray-100 text-2xl font-bold tracking-tight">{value !== undefined && value !== null ? value : '--'}</span>
        <span className="text-slate-500 text-sm font-medium ml-1">{unit}</span>
      </div>
    </div>
  </div>
);

export const CardAllDataNode = ({ node }) => {
  if (!node) return null;

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5 w-full'>   
        <DataCard 
          title="อุณหภูมิ" 
          value={node.temp} 
          unit="°C" 
          icon={Thermometer} 
          iconColor="text-rose-400" 
          bgLight="bg-rose-500/10 group-hover:bg-rose-500/20" 
        />
        <DataCard 
          title="ความชื้น" 
          value={node.humidity} 
          unit="%" 
          icon={Droplets} 
          iconColor="text-blue-400" 
          bgLight="bg-blue-500/10 group-hover:bg-blue-500/20" 
        />
        <DataCard 
          title="ความเข้มแสง" 
          value={node.light} 
          unit="" 
          icon={CloudRain} 
          iconColor="text-sky-400" 
          bgLight="bg-sky-500/10 group-hover:bg-sky-500/20" 
        />
        <DataCard 
          title="ความเร็วลม" 
          value={node.wind_speed} 
          unit="km/h" 
          icon={Wind} 
          iconColor="text-teal-400" 
          bgLight="bg-teal-500/10 group-hover:bg-teal-500/20" 
        />
        <DataCard 
          title="ความเร็วลมกระโชก" 
          value={node.wind_gust} 
          unit="km/h" 
          icon={Wind} 
          iconColor="text-cyan-400" 
          bgLight="bg-cyan-500/10 group-hover:bg-cyan-500/20" 
        />
        <DataCard 
          title="ทิศทางลม" 
          value={node.wind_dir} 
          unit="°" 
          icon={Navigation} 
          iconColor="text-amber-400" 
          bgLight="bg-amber-500/10 group-hover:bg-amber-500/20" 
        />
        <DataCard 
          title="ความกดอากาศ" 
          value={node.pressure} 
          unit="hPa" 
          icon={Gauge} 
          iconColor="text-indigo-400" 
          bgLight="bg-indigo-500/10 group-hover:bg-indigo-500/20" 
        />
        <DataCard 
          title="ปริมาณน้ำฝน (1ชั่วโมง)" 
          value={node.rain_1h} 
          unit="mm/h" 
          icon={Umbrella} 
          iconColor="text-purple-400" 
          bgLight="bg-purple-500/10 group-hover:bg-purple-500/20" 
        />
        <DataCard 
          title="ปริมาณน้ำฝน (24ชั่วโมง)" 
          value={node.rain_24h} 
          unit="mm/24h" 
          icon={Umbrella} 
          iconColor="text-violet-400" 
          bgLight="bg-violet-500/10 group-hover:bg-violet-500/20" 
        />
    </div>
  )
}
