import React, { useEffect, useRef } from 'react';

const DeliveryMap = ({ pickup, dropoff, orderId }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!window.L || !mapRef.current) return;

    // Initialize map if not already done
    if (!mapInstance.current) {
      mapInstance.current = window.L.map(mapRef.current, {
        zoomControl: false,
        dragging: !window.L.Browser.mobile,
        touchZoom: window.L.Browser.mobile,
        scrollWheelZoom: false
      }).setView([8.9467, 125.5414], 13); // Default Butuan Center

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);
    }

    const L = window.L;
    const map = mapInstance.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Mock coordinates if not provided (for demonstration in Butuan)
    // In a real app, these would come from order.product.farmer.map_coordinates
    const pickupCoords = pickup?.coords || [8.955, 125.535];
    const dropoffCoords = dropoff?.coords || [8.935, 125.555];

    const pickupMarker = L.marker(pickupCoords, {
        icon: L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='background-color:#2E7D32; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow:0 0 5px rgba(0,0,0,0.3)'></div>",
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        })
    }).addTo(map).bindPopup("Pick-up: " + (pickup?.name || "Farm"));

    const dropoffMarker = L.marker(dropoffCoords, {
        icon: L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='background-color:#FBC02D; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow:0 0 5px rgba(0,0,0,0.3)'></div>",
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        })
    }).addTo(map).bindPopup("Drop-off: " + (dropoff?.name || "Retailer"));

    const group = new L.featureGroup([pickupMarker, dropoffMarker]);
    map.fitBounds(group.getBounds().pad(0.5));

    // Cleanup on unmount
    return () => {
      if (mapInstance.current) {
        // We don't necessarily want to destroy the map every time if it's in a list
        // but for safety in React:
        // mapInstance.current.remove();
        // mapInstance.current = null;
      }
    };
  }, [pickup, dropoff]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
      <div style={{ 
        position: 'absolute', bottom: '8px', right: '8px', zIndex: 10, 
        background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '8px', 
        fontSize: '0.65rem', fontWeight: '700', color: '#666', border: '1px solid #ddd' 
      }}>
        LIVE LOGISTICS
      </div>
    </div>
  );
};

export default DeliveryMap;
