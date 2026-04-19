import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: icon,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
});

// Custom blue (selected) marker
const selectedIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Default grey marker
const defaultIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: iconShadow,
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -28],
    shadowSize: [33, 33],
});

// Inner component ที่ใช้ useMap (ต้องอยู่ใน MapContainer)
const FlyToSelected = ({ nodes, selectedNode }) => {
    const map = useMap();

    useEffect(() => {
        if (!selectedNode || !nodes || nodes.length === 0) return;
        const target = nodes.find(n => n.node_name === selectedNode);
        if (target && target.latitude != null && target.longitude != null) {
            map.flyTo([target.latitude, target.longitude], 14, { duration: 1.2 });
        }
    }, [selectedNode, nodes, map]);

    return null;
};

const MapComponent = ({
    center = [13.7563, 100.5018],
    zoom = 10,
    nodes = [],
    selectedNode = null,
    onNodeSelect = () => {},
}) => {
    // คำนวณ center เริ่มต้นจาก nodes ถ้ามี
    const initialCenter = nodes.length > 0 && nodes[0].latitude != null
        ? [nodes[0].latitude, nodes[0].longitude]
        : center;

    return (
        <div className="w-full h-full">
            <MapContainer
                center={initialCenter}
                zoom={zoom}
                scrollWheelZoom={true}
                className="w-full h-full z-0"
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FlyToSelected nodes={nodes} selectedNode={selectedNode} />

                {nodes.map((node) => {
                    if (node.latitude == null || node.longitude == null) return null;
                    const isSelected = node.node_name === selectedNode;
                    return (
                        <Marker
                            key={node.node_name}
                            position={[node.latitude, node.longitude]}
                            icon={isSelected ? selectedIcon : defaultIcon}
                            eventHandlers={{
                                click: () => onNodeSelect(node.node_name),
                            }}
                        >
                            <Tooltip
                                direction="top"
                                offset={[0, -44]}
                                permanent={isSelected}
                                opacity={0.95}
                            >
                                <span className="font-semibold text-sm">
                                    {isSelected ? `📍 ${node.node_name}` : node.node_name}
                                </span>
                            </Tooltip>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default MapComponent;