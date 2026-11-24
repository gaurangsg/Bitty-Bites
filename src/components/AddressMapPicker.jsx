import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const dhuleCenter = [20.9042, 74.7749];
const pinIcon = L.divIcon({
  className: 'delivery-map-pin',
  html: '<span></span>',
  iconSize: [28, 36],
  iconAnchor: [14, 34]
});

function MapSelection({ position, onSelect }) {
  useMapEvents({ click: event => onSelect([event.latlng.lat, event.latlng.lng]) });
  return <Marker
    position={position}
    icon={pinIcon}
    draggable
    eventHandlers={{ dragend: event => {
      const point = event.target.getLatLng();
      onSelect([point.lat, point.lng]);
    } }}
  />;
}

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => { map.setView(position, Math.max(map.getZoom(), 15), { animate: true }); }, [map, position]);
  return null;
}

export default function AddressMapPicker({ open, onClose, initialPosition, onConfirm }) {
  const [position, setPosition] = useState(initialPosition || dhuleCenter);
  const [locationError, setLocationError] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (open) setPosition(initialPosition || dhuleCenter);
  }, [open, initialPosition?.[0], initialPosition?.[1]]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = event => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { setLocationError('Location is not available in this browser. You can move the map pin instead.'); return; }
    setLocationError('');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      result => { setPosition([result.coords.latitude, result.coords.longitude]); setLocating(false); },
      () => { setLocationError('We could not read your location. Move the map pin to choose it manually.'); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return <div className="map-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="map-picker-modal" role="dialog" aria-modal="true" aria-labelledby="map-picker-title">
      <div className="map-picker-heading"><div><span className="commerce-eyebrow">DELIVERY LOCATION</span><h2 id="map-picker-title">Pin your address</h2><p>Tap or drag the pin to your delivery location. Add the street address in the checkout field.</p></div>
        <button type="button" className="map-picker-close" aria-label="Close map" onClick={onClose}><i className="fas fa-times"></i></button>
      </div>
      <div className="map-picker-toolbar"><span><i className="fas fa-map-marker-alt"></i> {position[0].toFixed(5)}, {position[1].toFixed(5)}</span>
        <button type="button" className="map-location-button" onClick={useCurrentLocation} disabled={locating}><i className="fas fa-location-arrow"></i> {locating ? 'Locating…' : 'Use my location'}</button>
      </div>
      {locationError && <p className="map-location-error" role="status">{locationError}</p>}
      <div className="map-picker-canvas"><MapContainer center={position} zoom={15} scrollWheelZoom className="delivery-map">
        <RecenterMap position={position} />
        <TileLayer url={import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
        <MapSelection position={position} onSelect={setPosition} />
      </MapContainer></div>
      <div className="map-picker-footer"><small>Map data © OpenStreetMap contributors</small><button type="button" className="btn" onClick={() => { onConfirm(position); onClose(); }}>Use this pin</button></div>
    </section>
  </div>;
}
