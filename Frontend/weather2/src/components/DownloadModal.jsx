import React, { useState, useEffect } from 'react';
import { X, Download, Database, MapPin, Calendar, Clock, AlertCircle } from 'lucide-react';

export const DownloadModal = ({ isOpen, onClose }) => {
    const [nodes, setNodes] = useState([]);
    const [limits, setLimits] = useState(null);
    
    const [source, setSource] = useState('node');
    const [selectedNode, setSelectedNode] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    // Fetch limits and nodes
    useEffect(() => {
        if (isOpen) {
            fetch('/api/api_download/limits')
                .then(res => res.json())
                .then(data => setLimits(data))
                .catch(err => console.error("Error fetching limits:", err));
                
            fetch('/api/getNameNode/')
                .then(res => res.json())
                .then(data => {
                    setNodes(data.nodes);
                    if (data.nodes.length > 0) setSelectedNode(data.nodes[0].node_name);
                })
                .catch(err => console.error("Error fetching nodes:", err));
                
            // Reset date fields upon opening
            setStartDate('');
            setEndDate('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const currentLimits = limits ? limits[source] || {} : {};
    
    const handleDownload = () => {
        if (!startDate || !endDate) {
            alert("Please select both Start Date and End Date");
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            alert("Start Date cannot be after End Date");
            return;
        }

        const url = new URL("/api/api_download/", window.location.origin);
        url.searchParams.append('source', source);
        if (source === 'node') {
            url.searchParams.append('node_name', selectedNode);
        }
        url.searchParams.append('start_date', startDate);
        url.searchParams.append('end_date', endDate);

        // Fetch the file and trigger download via blob
        fetch(url.toString())
            .then(res => {
                if (!res.ok) {
                    throw new Error("Failed to download file");
                }
                return res.blob();
            })
            .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                
                // Construct filename matching the backend
                let filename = '';
                if (source === 'tmd') {
                    filename = `TMD_Data_${startDate}_to_${endDate}.csv`;
                } else if (source === 'msn') {
                    filename = `MSN_Data_${startDate}_to_${endDate}.csv`;
                } else if (source === 'node') {
                    filename = `${selectedNode}_Data_${startDate}_to_${endDate}.csv`;
                } else if (source === 'weather') {
                    filename = `WeatherCom_Data_${startDate}_to_${endDate}.csv`;
                } else {
                    filename = `Data_${startDate}_to_${endDate}.csv`;
                }

                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
                onClose();
            })
            .catch(err => {
                console.error("Download error:", err);
                alert("เกิดข้อผิดพลาดในการดาวน์โหลดข้อมูล กรุณาลองใหม่อีกครั้ง");
                onClose();
            });
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center font-outfit">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            {/* Modal Content */}
            <div className="relative bg-[#0F172A] w-[90%] max-w-lg rounded-2xl shadow-2xl border border-[#334155]/50 overflow-hidden z-10 flex flex-col transform transition-all">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 md:p-6 border-b border-[#334155]/50 bg-[#1E293B]/40">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                            <Download size={22} />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-wide">บันทึกข้อมูล(CSV)</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-[#0F172A] hover:bg-rose-500 p-1.5 rounded-lg border border-[#334155]">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 md:p-8 flex flex-col gap-6">
                    
                    {/* Source Selection */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <Database size={16} className="text-gray-400" /> ประเภทข้อมูล
                        </label>
                        <div className="relative w-full">
                            <select 
                                value={source} 
                                onChange={e => setSource(e.target.value)}
                                className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none appearance-none"
                            >
                                <option value="node">Node Stations</option>
                                <option value="tmd">TMD (กรมอุตุนิยมวิทยา)</option>
                                <option value="msn">MSN (Microsoft Weather)</option>
                                <option value="weather">Weather.com</option>
                            </select>
                            <span className="absolute right-4 top-4 text-gray-400 text-xs pointer-events-none">▼</span>
                         </div>
                    </div>

                    {/* Node Selection (Conditional) */}
                    {source === 'node' && (
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <MapPin size={16} className="text-orange-400" /> เลือกสถานี
                            </label>
                            <div className="relative w-full">
                                <select 
                                    value={selectedNode} 
                                    onChange={e => setSelectedNode(e.target.value)}
                                    className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none appearance-none"
                                >
                                    {nodes.map(n => <option key={n.node_name} value={n.node_name}>{n.node_name}</option>)}
                                </select>
                                <span className="absolute right-4 top-4 text-gray-400 text-xs pointer-events-none">▼</span>
                            </div>
                        </div>
                    )}

                    {/* Date Range Options Info */}
                    <div className="bg-[#1E293B]/60 p-3 rounded-lg border border-blue-500/20 flex gap-3 text-sm text-gray-300 mt-2">
                        <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={18} />
                        <div>
                            <p className="font-medium text-blue-400">ช่วงวันที่ของ {source.toUpperCase()}</p>
                            {currentLimits.min && currentLimits.max ? (
                                <p className="mt-1 text-xs text-gray-400 leading-relaxed">ข้อมูลจากระบบตั้งแต่ <br/><b className="text-gray-300">{currentLimits.min}</b> ถึง <b className="text-gray-300">{currentLimits.max}</b></p>
                            ) : (
                                <p className="mt-1 text-xs text-gray-400">กำลังค้นหาช่วงวันที่...</p>
                            )}
                        </div>
                    </div>

                    {/* Date Pickers */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Calendar size={16} className="text-emerald-400" /> วันที่เริ่มต้น
                            </label>
                            <input 
                                type="date"
                                min={currentLimits.min}
                                max={currentLimits.max}
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-3 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Clock size={16} className="text-rose-400" /> วันที่สิ้นสุด
                            </label>
                            <input 
                                type="date"
                                min={currentLimits.min}
                                max={currentLimits.max}
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-3 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 md:px-8 py-5 border-t border-[#334155]/50 bg-[#1E293B]/20 flex justify-end gap-3 md:gap-4">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl font-medium text-gray-300 hover:text-white hover:bg-[#334155]/50 transition-all"
                    >
                        ยกเลิก
                    </button>
                    <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Download size={18} />
                        ดาวน์โหลด CSV
                    </button>
                </div>

            </div>
        </div>
    );
};
