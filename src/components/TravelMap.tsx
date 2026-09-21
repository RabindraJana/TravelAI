import React, { useState } from 'react';
import { ScreenType, TransitionType } from '../types';

interface TravelMapProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
  onPlanTripTo?: (origin: string, destination: string) => void;
}

interface MapPin {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  status: 'visited' | 'upcoming' | 'bucketlist';
  category: string;
  distanceFromDelhi: number;
  highlight: string;
  queryParam: string;
}

const PINS: MapPin[] = [
  {
    id: 'pin-1',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    lat: 25.3176,
    lng: 82.9739,
    status: 'upcoming',
    category: 'Spiritual',
    distanceFromDelhi: 820,
    highlight: 'Assi Ghat, Kashi Vishwanath & River Aarti',
    queryParam: 'Varanasi,Uttar+Pradesh,India',
  },
  {
    id: 'pin-2',
    name: 'Kolkata',
    state: 'West Bengal',
    lat: 22.5726,
    lng: 88.3639,
    status: 'upcoming',
    category: 'Culture & Food',
    distanceFromDelhi: 1470,
    highlight: 'Victoria Memorial, Howrah Bridge & Trams',
    queryParam: 'Kolkata,West+Bengal,India',
  },
  {
    id: 'pin-3',
    name: 'Leh Ladakh',
    state: 'Ladakh UT',
    lat: 34.1526,
    lng: 77.5771,
    status: 'visited',
    category: 'High Altitude',
    distanceFromDelhi: 980,
    highlight: 'Khardung La, Pangong Tso & Nubra Dunes',
    queryParam: 'Leh,Ladakh,India',
  },
  {
    id: 'pin-4',
    name: 'Goa',
    state: 'Goa',
    lat: 15.2993,
    lng: 74.124,
    status: 'visited',
    category: 'Coastal Heritage',
    distanceFromDelhi: 1850,
    highlight: 'Fontainhas Latin Quarter & Palolem Coast',
    queryParam: 'Panaji,Goa,India',
  },
  {
    id: 'pin-5',
    name: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9124,
    lng: 75.7873,
    status: 'visited',
    category: 'Royal Heritage',
    distanceFromDelhi: 280,
    highlight: 'Amber Fort, Hawa Mahal & Nahargarh Sunset',
    queryParam: 'Jaipur,Rajasthan,India',
  },
  {
    id: 'pin-6',
    name: 'Spiti Valley',
    state: 'Himachal Pradesh',
    lat: 32.2461,
    lng: 78.0349,
    status: 'bucketlist',
    category: 'Winter Expedition',
    distanceFromDelhi: 730,
    highlight: 'Key Monastery & Chicham Bridge at -20°C',
    queryParam: 'Kaza,Spiti+Valley,Himachal+Pradesh,India',
  },
  {
    id: 'pin-7',
    name: 'Cherrapunji & Shillong',
    state: 'Meghalaya',
    lat: 25.2986,
    lng: 91.5822,
    status: 'bucketlist',
    category: 'Living Bridges',
    distanceFromDelhi: 1980,
    highlight: 'Double Decker Root Bridge & Dawki River',
    queryParam: 'Cherrapunji,Meghalaya,India',
  },
  {
    id: 'pin-8',
    name: 'Fort Kochi & Alleppey',
    state: 'Kerala',
    lat: 9.9312,
    lng: 76.2673,
    status: 'visited',
    category: 'Backwaters',
    distanceFromDelhi: 2450,
    highlight: 'Chinese Fishing Nets & Kettuvallam Cruise',
    queryParam: 'Kochi,Kerala,India',
  },
];

export const TravelMap: React.FC<TravelMapProps> = ({ onNavigate, onPlanTripTo }) => {
  const [selectedPin, setSelectedPin] = useState<MapPin>(PINS[0]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'visited' | 'upcoming' | 'bucketlist'>('all');
  const [isGoogleMapsCollapsed, setIsGoogleMapsCollapsed] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  const filteredPins = PINS.filter((p) => filterStatus === 'all' || p.status === filterStatus);

  const googleMapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    selectedPin.queryParam
  )}&t=${mapType === 'satellite' ? 'k' : 'm'}&z=12&ie=UTF8&iwloc=&output=embed`;

  return (
    <main className="w-full pt-16 bg-[#faf8ff] px-6 min-h-screen">
      <div className="flex flex-col w-full max-w-7xl mx-auto pb-16">
        {/* Header */}
        <div className="py-6 border-b border-[#eaedff] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#00685f]/10 text-[#00685f]">
                <span className="material-symbols-outlined text-[24px]">map</span>
              </span>
              <h1 className="text-[28px] font-bold text-[#131b2e] tracking-tight">Travel Route Map</h1>
            </div>
            <p className="text-[14px] text-[#3d4947] mt-1">
              Interactive geo-spatial corridor map connected with real-time Google Maps satellite layers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Collapse / Expand Google Maps toggle */}
            <button
              onClick={() => setIsGoogleMapsCollapsed(!isGoogleMapsCollapsed)}
              className="px-3.5 py-2 bg-white hover:bg-[#f2f3ff] border border-[#eaedff] text-[#131b2e] rounded-xl text-[12px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-[#00685f]">
                {isGoogleMapsCollapsed ? 'unfold_more' : 'unfold_less'}
              </span>
              <span>{isGoogleMapsCollapsed ? 'Expand Google Maps' : 'Collapse Google Maps'}</span>
            </button>

            <button
              onClick={() => {
                if (onPlanTripTo) {
                  onPlanTripTo('New Delhi, India', selectedPin.name);
                }
                onNavigate('planner', 'none');
              }}
              className="px-4 py-2 bg-[#00685f] hover:bg-[#008378] text-white rounded-xl text-[12px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              <span>Plan Trip to {selectedPin.name}</span>
            </button>
          </div>
        </div>

        {/* Status Filter Row */}
        <div className="flex items-center justify-between gap-3 my-6 flex-wrap">
          <div className="inline-flex p-1 bg-[#f2f3ff] rounded-xl border border-[#eaedff]">
            {(
              [
                { key: 'all', label: 'All Waypoints' },
                { key: 'visited', label: 'Visited (4)' },
                { key: 'upcoming', label: 'Upcoming (2)' },
                { key: 'bucketlist', label: '2027 Goals (2)' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                  filterStatus === tab.key
                    ? 'bg-white text-[#131b2e] shadow-xs'
                    : 'text-[#3d4947] hover:text-[#131b2e]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[12px] text-[#3d4947]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00685f]"></span> Visited
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#fd761a]"></span> Upcoming
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#705d00]"></span> 2027 Goal
            </span>
          </div>
        </div>

        {/* Map Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Waypoints Selection Rail (4 Cols) */}
          <div className="lg:col-span-4 space-y-3 order-2 lg:order-1">
            <h3 className="text-[13px] uppercase font-bold text-[#3d4947] tracking-wider px-1">
              Indexed Waypoints ({filteredPins.length})
            </h3>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredPins.map((pin) => (
                <button
                  key={pin.id}
                  onClick={() => setSelectedPin(pin)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedPin.id === pin.id
                      ? 'bg-white border-[#00685f] shadow-md ring-1 ring-[#00685f]'
                      : 'bg-white/70 border-[#eaedff] hover:bg-white hover:border-[#bcc9c6]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full shrink-0 ${
                          pin.status === 'visited'
                            ? 'bg-[#00685f]'
                            : pin.status === 'upcoming'
                            ? 'bg-[#fd761a]'
                            : 'bg-[#705d00]'
                        }`}
                      ></span>
                      <span className="font-bold text-[14px] text-[#131b2e]">{pin.name}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        pin.status === 'visited'
                          ? 'bg-[#e2e7ff] text-[#00685f]'
                          : pin.status === 'upcoming'
                          ? 'bg-[#ffdbca] text-[#9d4300]'
                          : 'bg-[#ffea9f] text-[#705d00]'
                      }`}
                    >
                      {pin.status}
                    </span>
                  </div>

                  <p className="text-[12px] text-[#3d4947] line-clamp-1 mb-2">{pin.highlight}</p>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#eaedff]/60 text-[#3d4947]">
                    <span>{pin.state}</span>
                    <span className="font-semibold text-[#00685f]">~{pin.distanceFromDelhi} km from DEL</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Location Card */}
            <div className="p-4 rounded-2xl bg-[#f2f3ff] border border-[#eaedff] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-[#3d4947]">Active Coordinates</span>
                <span className="text-[11px] font-mono text-[#00685f]">
                  {selectedPin.lat.toFixed(4)}°N, {selectedPin.lng.toFixed(4)}°E
                </span>
              </div>
              <h4 className="font-bold text-[16px] text-[#131b2e]">{selectedPin.name}</h4>
              <p className="text-[12px] text-[#3d4947]">{selectedPin.highlight}</p>
              <button
                onClick={() => {
                  if (onPlanTripTo) onPlanTripTo('New Delhi, India', selectedPin.name);
                  onNavigate('planner', 'none');
                }}
                className="w-full py-2 bg-[#00685f] hover:bg-[#008378] text-white rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">navigation</span>
                <span>Open in AI Trip Planner</span>
              </button>
            </div>
          </div>

          {/* Interactive Google Map & Visual Canvas (8 Cols) */}
          <div className="lg:col-span-8 space-y-4 order-1 lg:order-2">
            {/* Map Top Bar */}
            <div className="p-3 bg-white rounded-2xl border border-[#eaedff] flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f] text-[20px]">pin_drop</span>
                <div>
                  <span className="text-[13px] font-bold text-[#131b2e]">{selectedPin.name} Explorer</span>
                  <span className="text-[11px] text-[#3d4947] ml-2">Live Google Maps Satellite &amp; Road Hybrid</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMapType('roadmap')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    mapType === 'roadmap' ? 'bg-[#00685f] text-white' : 'bg-[#f2f3ff] text-[#3d4947]'
                  }`}
                >
                  Map View
                </button>
                <button
                  onClick={() => setMapType('satellite')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    mapType === 'satellite' ? 'bg-[#00685f] text-white' : 'bg-[#f2f3ff] text-[#3d4947]'
                  }`}
                >
                  Satellite
                </button>

                {/* Collapse Button */}
                <button
                  onClick={() => setIsGoogleMapsCollapsed(!isGoogleMapsCollapsed)}
                  title={isGoogleMapsCollapsed ? 'Expand Google Maps' : 'Collapse Google Maps'}
                  className="p-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#131b2e] cursor-pointer ml-1"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isGoogleMapsCollapsed ? 'expand_more' : 'expand_less'}
                  </span>
                </button>
              </div>
            </div>

            {/* Google Map Embedded Frame - Collapsible */}
            {!isGoogleMapsCollapsed ? (
              <div className="w-full h-[520px] rounded-3xl overflow-hidden border border-[#eaedff] shadow-sm relative bg-[#e2e7ff] transition-all">
                <iframe
                  title={`Google Maps - ${selectedPin.name}`}
                  src={googleMapsUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                ></iframe>

                {/* Floating Map Overlay Badge */}
                <div className="absolute top-4 left-4 p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-[#eaedff] max-w-xs pointer-events-none">
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#131b2e]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00685f] animate-ping"></span>
                    <span>{selectedPin.name}</span>
                  </div>
                  <p className="text-[11px] text-[#3d4947] mt-0.5">{selectedPin.highlight}</p>
                </div>
              </div>
            ) : (
              /* Collapsed Placeholder Bar */
              <div className="p-4 bg-white rounded-2xl border border-dashed border-[#eaedff] flex items-center justify-between text-[#3d4947]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00685f] text-[20px]">layers</span>
                  <span className="text-[13px] font-semibold text-[#131b2e]">
                    Google Maps Satellite Layer Collapsed for {selectedPin.name}
                  </span>
                </div>
                <button
                  onClick={() => setIsGoogleMapsCollapsed(false)}
                  className="px-3 py-1 bg-[#00685f] text-white text-[12px] font-semibold rounded-lg cursor-pointer hover:bg-[#008378]"
                >
                  Expand Google Maps
                </button>
              </div>
            )}

            {/* Corridor Distances & Transit Matrix */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-[#eaedff] shadow-xs text-center">
                <span className="text-[10px] uppercase font-bold text-[#3d4947] block">Air Flight</span>
                <span className="font-bold text-[14px] text-[#00685f] mt-0.5 block">
                  {selectedPin.distanceFromDelhi < 500
                    ? '1h 10m'
                    : selectedPin.distanceFromDelhi < 1200
                    ? '1h 45m'
                    : '2h 30m'}
                </span>
                <span className="text-[10px] text-[#3d4947]">Non-stop connectivity</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#eaedff] shadow-xs text-center">
                <span className="text-[10px] uppercase font-bold text-[#3d4947] block">Vande Bharat / Rail</span>
                <span className="font-bold text-[14px] text-[#9d4300] mt-0.5 block">
                  {selectedPin.distanceFromDelhi < 500
                    ? '4h 20m'
                    : selectedPin.distanceFromDelhi < 1200
                    ? '8h 00m'
                    : '17h 30m'}
                </span>
                <span className="text-[10px] text-[#3d4947]">Scenic overland tracks</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#eaedff] shadow-xs text-center">
                <span className="text-[10px] uppercase font-bold text-[#3d4947] block">Road Highway</span>
                <span className="font-bold text-[14px] text-[#131b2e] mt-0.5 block">
                  ~{selectedPin.distanceFromDelhi} km
                </span>
                <span className="text-[10px] text-[#3d4947]">Expressway route</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
