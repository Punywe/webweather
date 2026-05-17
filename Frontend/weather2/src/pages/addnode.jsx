import React, { useEffect, useState } from 'react';
import { LogOut, Plus, MapPin, Server, Hash, Pencil, Trash2, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddNode = () => {
    // ── Form state ─────────────────────────────────────────────────────────
    const [stationId, setStationId]   = useState('');
    const [nodeName, setNodeName]     = useState('');
    const [latitude, setLatitude]     = useState('');
    const [longitude, setLongitude]   = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Node list state ────────────────────────────────────────────────────
    const [nodes, setNodes]           = useState([]);
    const [loadingNodes, setLoadingNodes] = useState(true);

    // ── Edit state ─────────────────────────────────────────────────────────
    const [editingId, setEditingId]   = useState(null);
    const [editData, setEditData]     = useState({});

    const navigate = useNavigate();

    // ── Auth guard ─────────────────────────────────────────────────────────
    useEffect(() => {
        try {
            const data = JSON.parse(localStorage.getItem('weather_user'));
            if (data) {
                if (data.loginTime) {
                    if (new Date().getTime() - data.loginTime > 30 * 60 * 1000) {
                        localStorage.removeItem('weather_user');
                        navigate('/'); // Kick them out
                    }
                }
            } else {
                navigate('/');
            }
        } catch (e) {
            console.error(e);
            navigate('/');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('weather_user');
        navigate('/');
    };

    // ── Fetch node list ────────────────────────────────────────────────────
    const fetchNodes = async () => {
        setLoadingNodes(true);
        try {
            const res  = await fetch('/api/addnode/');
            const data = await res.json();
            setNodes(data.nodes || []);
        } catch (err) {
            console.error('Fetch nodes error:', err);
        } finally {
            setLoadingNodes(false);
        }
    };

    useEffect(() => { fetchNodes(); }, []);

    // ── Submit (add new node) ──────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stationId || !nodeName || !latitude || !longitude) {
            alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/addnode/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    station_id: stationId.trim(),
                    node_name:  nodeName.trim(),
                    latitude:   parseFloat(latitude),
                    longitude:  parseFloat(longitude),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                alert(`Error: ${data.detail || data.error}`);
            } else {
                alert('เพิ่มสถานีสำเร็จ!');
                setStationId(''); setNodeName(''); setLatitude(''); setLongitude('');
                fetchNodes();
            }
        } catch (err) {
            console.error(err);
            alert('เกิดข้อผิดพลาดของเซิร์ฟเวอร์');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Delete node ────────────────────────────────────────────────────────
    const handleDelete = async (nodeId, name) => {
        if (!window.confirm(`ยืนยันลบสถานี "${name}"?`)) return;
        try {
            const res = await fetch(`/api/addnode/${nodeId}`, { method: 'DELETE' });
            if (res.ok) {
                fetchNodes();
            } else {
                const d = await res.json();
                alert(`Error: ${d.detail}`);
            }
        } catch (err) {
            alert('ลบไม่สำเร็จ');
        }
    };

    // ── Edit node ─────────────────────────────────────────────────────────
    const startEdit = (node) => {
        setEditingId(node.id);
        setEditData({
            station_id: node.station_id,
            node_name:  node.node_name,
            latitude:   node.latitude,
            longitude:  node.longitude,
        });
    };

    const cancelEdit = () => { setEditingId(null); setEditData({}); };

    const saveEdit = async (nodeId) => {
        try {
            const res = await fetch(`/api/addnode/${nodeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    station_id: editData.station_id,
                    node_name:  editData.node_name,
                    latitude:   parseFloat(editData.latitude),
                    longitude:  parseFloat(editData.longitude),
                }),
            });
            if (res.ok) {
                cancelEdit();
                fetchNodes();
            } else {
                const d = await res.json();
                alert(`Error: ${d.detail}`);
            }
        } catch (err) {
            alert('แก้ไขไม่สำเร็จ');
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="bg-[#0F172A] text-white w-full min-h-screen flex flex-col items-center p-4 font-outfit relative overflow-hidden gap-6 py-10">

            {/* Background glow */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* ─── Card: Add Node Form ─────────────────────────────────────── */}
            <div className="bg-[#1E293B]/80 backdrop-blur-xl border border-[#334155]/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-4xl z-10">

                {/* Header */}
                <div className="border-b border-[#334155]/50 p-6 flex justify-between items-center bg-[#0F172A]/30 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                            <Server size={24} />
                        </div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 tracking-wide">
                            เพิ่มสถานีใหม่
                        </h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white px-4 py-2.5 rounded-lg transition-all duration-300 font-medium"
                    >
                        <LogOut size={18} />
                        <span>ออกจากระบบ</span>
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Station ID */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Hash size={16} className="text-yellow-400" /> Station ID
                                <span className="text-xs text-gray-500">(ต้องตรงกับใน Google Sheet)</span>
                            </label>
                            <input
                                type="text"
                                placeholder="เช่น STA001"
                                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none"
                                value={stationId}
                                onChange={(e) => setStationId(e.target.value)}
                            />
                        </div>

                        {/* Node Name */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Server size={16} className="text-blue-400" /> ชื่อสถานี (Node Name)
                            </label>
                            <input
                                type="text"
                                placeholder="เช่น สถานีตาก 1"
                                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                value={nodeName}
                                onChange={(e) => setNodeName(e.target.value)}
                            />
                        </div>

                        {/* Latitude */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <MapPin size={16} className="text-rose-400" /> ละติจูด
                            </label>
                            <input
                                type="number"
                                step="any"
                                placeholder="เช่น 16.883"
                                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all outline-none"
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
                                type="number"
                                step="any"
                                placeholder="เช่น 99.125"
                                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                            />
                        </div>

                    </div>

                    {/* Submit */}
                    <div className="w-full flex justify-end mt-8 pt-6 border-t border-[#334155]/30">
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

            {/* ─── Card: Node List Table ───────────────────────────────────── */}
            <div className="bg-[#1E293B]/80 backdrop-blur-xl border border-[#334155]/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-4xl z-10">

                <div className="border-b border-[#334155]/50 p-6 bg-[#0F172A]/30 rounded-t-2xl">
                    <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2">
                        <Server size={20} className="text-emerald-400" />
                        รายการสถานีทั้งหมด
                        <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                            {nodes.length} สถานี
                        </span>
                    </h2>
                </div>

                <div className="p-4 overflow-x-auto">
                    {loadingNodes ? (
                        <p className="text-gray-400 text-center py-6">กำลังโหลด...</p>
                    ) : nodes.length === 0 ? (
                        <p className="text-gray-500 text-center py-6">ยังไม่มีสถานีในระบบ</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-400 border-b border-[#334155]/50">
                                    <th className="text-left py-3 px-3">Station ID</th>
                                    <th className="text-left py-3 px-3">ชื่อสถานี</th>
                                    <th className="text-left py-3 px-3">ละติจูด</th>
                                    <th className="text-left py-3 px-3">ลองจิจูด</th>
                                    <th className="text-left py-3 px-3">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {nodes.map((node) => (
                                    <tr
                                        key={node.id}
                                        className="border-b border-[#334155]/30 hover:bg-[#0F172A]/30 transition-colors"
                                    >
                                        {editingId === node.id ? (
                                            /* ── Edit Row ── */
                                            <>
                                                <td className="py-2 px-3">
                                                    <input
                                                        className="bg-[#0F172A] border border-yellow-500/50 rounded-lg px-2 py-1.5 text-white w-full outline-none text-sm"
                                                        value={editData.station_id}
                                                        onChange={(e) => setEditData({ ...editData, station_id: e.target.value })}
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input
                                                        className="bg-[#0F172A] border border-blue-500/50 rounded-lg px-2 py-1.5 text-white w-full outline-none text-sm"
                                                        value={editData.node_name}
                                                        onChange={(e) => setEditData({ ...editData, node_name: e.target.value })}
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input
                                                        type="number" step="any"
                                                        className="bg-[#0F172A] border border-[#334155] rounded-lg px-2 py-1.5 text-white w-full outline-none text-sm"
                                                        value={editData.latitude}
                                                        onChange={(e) => setEditData({ ...editData, latitude: e.target.value })}
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input
                                                        type="number" step="any"
                                                        className="bg-[#0F172A] border border-[#334155] rounded-lg px-2 py-1.5 text-white w-full outline-none text-sm"
                                                        value={editData.longitude}
                                                        onChange={(e) => setEditData({ ...editData, longitude: e.target.value })}
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => saveEdit(node.id)}
                                                            className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg transition-all"
                                                            title="บันทึก"
                                                        >
                                                            <Check size={15} />
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="p-1.5 bg-gray-500/20 hover:bg-gray-500 text-gray-400 hover:text-white rounded-lg transition-all"
                                                            title="ยกเลิก"
                                                        >
                                                            <X size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            /* ── Display Row ── */
                                            <>
                                                <td className="py-3 px-3">
                                                    <span className="bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded font-mono text-xs">
                                                        {node.station_id}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 font-medium text-gray-200">{node.node_name}</td>
                                                <td className="py-3 px-3 text-gray-400 font-mono text-xs">{node.latitude}</td>
                                                <td className="py-3 px-3 text-gray-400 font-mono text-xs">{node.longitude}</td>
                                                <td className="py-3 px-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => startEdit(node)}
                                                            className="p-1.5 bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg transition-all"
                                                            title="แก้ไข"
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(node.id, node.node_name)}
                                                            className="p-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition-all"
                                                            title="ลบ"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

        </div>
    );
};

export default AddNode;