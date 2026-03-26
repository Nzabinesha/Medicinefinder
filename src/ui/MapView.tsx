import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Marker {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface MapViewProps {
  markers: Marker[];
  height?: number;
}

export function MapView({ markers, height = 400 }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || markers.length === 0) return;

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(
        [markers[0].lat, markers[0].lng],
        13
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    mapRef.current.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current!.removeLayer(layer);
      }
    });

    // Add markers
    markers.forEach((marker) => {
      const icon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      L.marker([marker.lat, marker.lng], { icon })
        .addTo(mapRef.current!)
        .bindPopup(marker.name);
    });

    // Fit bounds if multiple markers
    if (markers.length > 1) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    } else if (markers.length === 1) {
      mapRef.current.setView([markers[0].lat, markers[0].lng], 13);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [markers]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height: `${height}px`, width: '100%' }}
      className="rounded-lg"
    />
  );
}

