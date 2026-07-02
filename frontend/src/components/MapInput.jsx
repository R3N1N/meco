import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Loader, Navigation } from 'lucide-react';
import API from '../services/api';

const isWithinValley = (lat, lng) => {
  return (
    Number(lat) >= 27.55 &&
    Number(lat) <= 27.85 &&
    Number(lng) >= 85.15 &&
    Number(lng) <= 85.55
  );
};
// Custom pulsating SVG pin icon to circumvent standard Leaflet bundle asset bugs
const pinIcon = L.divIcon({
  html: `
    <div class="relative w-8 h-8 flex items-center justify-center">
      <div class="absolute w-4 h-4 bg-teal-500 rounded-full border border-white opacity-75 animate-ping"></div>
      <svg class="w-8 h-8 text-teal-600 drop-shadow-md z-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
  `,
  className: 'custom-pin-container',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

// Component to handle map panning / flying to coords
const ChangeMapView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
};

const MapInput = ({ value, onChange }) => {
  // Default values
  const [lat, setLat] = useState(value?.latitude || 27.7172); // Default to Kathmandu / City center coords if none provided
  const [lng, setLng] = useState(value?.longitude || 85.3240);
  const [address, setAddress] = useState(value?.address || '');

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);



  // Sync state with parent component outputs
  useEffect(() => {
    if (value?.latitude && value?.longitude) {
      setLat(value.latitude);
      setLng(value.longitude);
    }
    if (value?.address) {
      setAddress(value.address);
    }
  }, [value]);

  const mapCenter = useMemo(() => [lat, lng], [lat, lng]);

  // Reverse geocodes coordinates into an address string via backend proxy
  const reverseGeocode = async (latitude, longitude) => {
    setGeocoding(true);
    try {
      const res = await API.get('/appointments/reverse-geocode', {
        params: { lat: latitude, lng: longitude }
      });
      const data = res.data;

      const formattedAddress = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      setAddress(formattedAddress);

      onChange({
        latitude,
        longitude,
        address: formattedAddress
      });
    } catch (e) {
      console.error('Reverse geocoding error:', e);
      const fallbackAddr = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      setAddress(fallbackAddr);
      onChange({
        latitude,
        longitude,
        address: fallbackAddr
      });
    } finally {
      setGeocoding(false);
    }
  };

  // Search address input via backend proxy
  const handleSearch = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await API.get('/appointments/geocode', {
        params: { q: searchQuery }
      });
      const data = res.data;
      if (data && data.length > 0) {
        const newLat = parseFloat(data[0].lat);
        const newLng = parseFloat(data[0].lon);

        if (!isWithinValley(newLat, newLng)) {
          alert('Only Kathmandu, Lalitpur, and Bhaktapur locations are allowed.');
          return;
        }
        const newAddr = data[0].display_name;

        setLat(newLat);
        setLng(newLng);
        setAddress(newAddr);

        onChange({
          latitude: newLat,
          longitude: newLng,
          address: newAddr
        });
      } else {
        alert('Location not found. Try entering a more specific address.');
      }
    } catch (err) {
      console.error('Geocoding search error:', err);
      alert('Error searching for location. Please try manually placing a marker on the map.');
    } finally {
      setSearching(false);
    }
  };

  // Geolocation API helper for browser search
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        if (!isWithinValley(latitude, longitude)) {
          alert('Your current location is outside Kathmandu Valley.');
          setGeocoding(false);
          return;
        }

        setLat(latitude);
        setLng(longitude);
        await reverseGeocode(latitude, longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert(`Failed to retrieve your location: ${error.message}`);
        setGeocoding(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Map click handler component
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        if (!isWithinValley(clickLat, clickLng)) {
          alert('Please select a location inside Kathmandu Valley.');
          return;
        }

        setLat(clickLat);
        setLng(clickLng);
        reverseGeocode(clickLat, clickLng);
      }
    });
    return null;
  };




  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Search Input Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search address or landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e);
              }
            }}
            className="w-full bg-navy-800 text-slate-100 rounded-lg pl-10 pr-4 py-2 border border-slate-700 focus:outline-none focus:border-teal-500 text-sm"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>
        <button
          type="button"
          onClick={handleLocateMe}
          className="bg-navy-850 hover:bg-navy-750 text-teal-400 border border-slate-700 rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-center transition-colors"
          title="Use current GPS location"
        >
          <Navigation className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors"
        >
          {searching ? <Loader className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
          Locate
        </button>
      </div>

      {/* Map Window */}
      <div className="relative h-64 w-full bg-navy-900 border border-slate-700 rounded-xl overflow-hidden shadow-inner">
        <MapContainer
          center={mapCenter}
          zoom={13}
          scrollWheelZoom={true}
          maxBounds={[
            [27.55, 85.15],
            [27.85, 85.55]
          ]}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler />
          <ChangeMapView center={mapCenter} />
          <Marker
            draggable={true}
            position={mapCenter}
            icon={pinIcon}
            eventHandlers={{
              dragend(e) {
                const { lat, lng } = e.target.getLatLng();

                if (!isWithinValley(lat, lng)) {
                  alert('Location must be inside Kathmandu Valley.');
                  e.target.setLatLng([lat, lng]);
                  return;
                }

                setLat(lat);
                setLng(lng);
                reverseGeocode(lat, lng);
              }
            }}
          />
        </MapContainer>

        {geocoding && (
          <div className="absolute inset-0 bg-navy-950/60 z-20 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-navy-800 border border-slate-700 px-4 py-2 rounded-lg shadow-lg">
              <Loader className="w-4 h-4 text-teal-400 animate-spin" />
              <span className="text-xs text-slate-300">Resolving address...</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Address Display */}
      {address && (
        <div className="bg-teal-950/25 border border-teal-900/60 rounded-lg p-3 flex gap-2">
          <MapPin className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Pinned Address</span>
            <span className="text-sm text-slate-300 leading-relaxed">{address}</span>
            <span className="text-[10px] text-slate-500">Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapInput;
