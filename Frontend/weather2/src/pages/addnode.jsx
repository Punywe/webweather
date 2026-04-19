import React from 'react';
import { LogOut, Plus, MapPin, Link2, Server } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddNode = () => {
    const [nodeName, setNodeName] = useState('');
    const [connectionLink, setConnectionLink] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('weather_user');
        navigate('/');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!nodeName || !connectionLink || !latitude || !longitude) {
            alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:8000/addnode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    node_name: nodeName,
                    connection_link: connectionLink,
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    sheet_url: connectionLink
                }),
            });
            const data = await response.json();
            
            if (data.error) {
                alert(`Error: ${data.error}`);
            } else {
                alert('เพิ่มสถานีสำเร็จ เซิร์ฟเวอร์กำลังดึงข้อมูลอัพเดทเบื้องหลัง!');
                // Wait briefly then go back to dashboard
                setTimeout(() => {
                    navigate('/');
                }, 500);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('เกิดข้อผิดพลาดของเซิร์ฟเวอร์ขณะเพิ่มสถานี');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#0F172A] text-white w-full min-h-screen flex items-center justify-center p-4 font-outfit relative overflow-hidden">
            
            {/* Background Decorations */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="bg-[#1E293B]/80 backdrop-blur-xl border border-[#334155]/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-4xl flex flex-col z-10 transition-all duration-300">
                
                {/* Header */}
                <div className="border-b border-[#334155]/50 p-6 flex justify-between items-center bg-[#0F172A]/30 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                            <Server size={24} />
                        </div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-emerald-400 tracking-wide">
                            เพิ่มสถานีใหม่
                        </h1>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white px-4 py-2.5 rounded-lg transition-all duration-300 font-medium">
                        <LogOut size={18} />
                        <span>ออกจากระบบ</span>
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Node Name */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Server size={16} className="text-gray-400" /> ชื่อสถานี
                            </label>
                            <input 
                                type="text" 
                                placeholder="ใส่ชื่อสถานี (เช่น node1)"
                                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                                value={nodeName}
                                onChange={(e) => setNodeName(e.target.value)}
                            />
                        </div>

                        {/* Link */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Link2 size={16} className="text-gray-400" /> ลิงก์เชื่อมต่อ
                            </label>
                            <input 
                                type="text" 
                                placeholder="ลิงก์จาก excel"
                                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                                value={connectionLink}
                                onChange={(e) => setConnectionLink(e.target.value)}
                            />
                        </div>

                        {/* Latitude */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <MapPin size={16} className="text-rose-400" /> ละติจูด
                            </label>
                            <input 
                                type="text" 
                                placeholder="เช่น 16.883"
                                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                            />
                        </div>

                        {/* Longitude */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <MapPin size={16} className="text-blue-400" /> ลองจิจูด
                            </label>
                            <input 
                                type="text" 
                                placeholder="เช่น 99.125"
                                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                            />
                        </div>

                    </div>

                    {/* Footer / Submit */}
                    <div className="w-full flex justify-end mt-10 pt-6 border-t border-[#334155]/30">
                        <button 
                            type="button" 
                            onClick={handleSubmit} 
                            disabled={isSubmitting}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-500/50 font-medium tracking-wide"
                        >
                            <Plus size={20} />
                            <span>{isSubmitting ? 'กำลังเพิ่ม...' : 'เพิ่มสถานี'}</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AddNode;