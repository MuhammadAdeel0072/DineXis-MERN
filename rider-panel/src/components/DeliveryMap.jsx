import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

let RiderIcon = L.divIcon({
    className: 'custom-rider-icon',
    html: `<div style="background-color: #D4AF37; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(212,175,55,0.8);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});

// Component to auto-center the map when data changes
const MapBounds = ({ riderLoc, orders }) => {
    const map = useMap();
    
    useEffect(() => {
        const points = [];
        if (riderLoc) points.push([riderLoc.lat, riderLoc.lng]);
        orders.forEach(o => {
            if (o.shippingAddress?.lat && o.shippingAddress?.lng) {
                points.push([o.shippingAddress.lat, o.shippingAddress.lng]);
            }
        });

        if (points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [riderLoc, orders, map]);

    return null;
};

const DeliveryMap = ({ riderLoc, activeOrders }) => {
    const defaultCenter = [33.6844, 73.0479]; // Islamabad
    
    const polylinePositions = [
        riderLoc ? [riderLoc.lat, riderLoc.lng] : null,
        ...activeOrders.map(o => o.shippingAddress?.lat ? [o.shippingAddress.lat, o.shippingAddress.lng] : null)
    ].filter(Boolean);

    return (
        <div className="w-full h-full min-h-[400px] relative">
            <MapContainer 
                center={riderLoc ? [riderLoc.lat, riderLoc.lng] : defaultCenter} 
                zoom={13} 
                className="w-full h-full"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {riderLoc && (
                    <Marker position={[riderLoc.lat, riderLoc.lng]} icon={RiderIcon}>
                        <Popup>Your Location</Popup>
                    </Marker>
                )}

                {activeOrders.map((order, idx) => (
                    order.shippingAddress?.lat && (
                        <Marker 
                            key={order._id} 
                            position={[order.shippingAddress.lat, order.shippingAddress.lng]}
                            icon={DefaultIcon}
                        >
                            <Popup>
                                <div className="p-2">
                                    <p className="font-bold text-charcoal">{order.user?.firstName}</p>
                                    <p className="text-xs text-charcoal/60">{order.shippingAddress.area}</p>
                                    <div className="mt-2 bg-gold/10 text-gold text-[10px] px-2 py-1 rounded inline-block font-black">
                                        STOP #{idx + 1}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}

                {polylinePositions.length > 1 && (
                    <Polyline 
                        positions={polylinePositions} 
                        color="#D4AF37" 
                        weight={4} 
                        opacity={0.6}
                        dashArray="10, 10"
                    />
                )}

                <MapBounds riderLoc={riderLoc} orders={activeOrders} />
            </MapContainer>
        </div>
    );
};

export default DeliveryMap;
