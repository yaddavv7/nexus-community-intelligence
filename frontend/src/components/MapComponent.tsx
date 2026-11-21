import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Incident } from '../types';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { ExternalLink, ThumbsUp, MapPin } from 'lucide-react';

// Custom colored leaflet markers using SVG data URIs
const createCustomIcon = (category: string, priorityScore: number, isResolved: boolean) => {
  let color = '#06b6d4'; // default cyan
  if (isResolved) {
    color = '#10b981'; // green
  } else if (priorityScore >= 80) {
    color = '#f43f5e'; // rose/red
  } else if (priorityScore >= 65) {
    color = '#f59e0b'; // amber
  } else if (priorityScore < 45) {
    color = '#3b82f6'; // blue
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 11.5 16 26 16 26s16-14.5 16-26C32 7.16 24.84 0 16 0z" fill="${color}" stroke="#0b1120" stroke-width="2"/>
    <circle cx="16" cy="15" r="7" fill="#0b1120" />
    <circle cx="16" cy="15" r="4.5" fill="${color}" />
  </svg>`;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svg,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38],
  });
};

const LocationPicker: React.FC<{ onLocationSelected: (lat: number, lng: number) => void }> = ({
  onLocationSelected,
}) => {
  useMapEvents({
    click(e) {
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Auto-center map helper
const MapCenterUpdater: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom || map.getZoom());
  }, [center, zoom, map]);
  return null;
};

interface MapProps {
  incidents?: Incident[];
  selectedIncident?: Incident | null;
  onSelectIncident?: (incident: Incident) => void;
  onNavigateDetail?: (id: number) => void;
  onConfirmIncident?: (id: number) => void;
  // Picker mode props
  isPickerMode?: boolean;
  selectedCoordinates?: [number, number] | null;
  onCoordinatesPicked?: (lat: number, lng: number) => void;
  center?: [number, number];
  zoom?: number;
  showHeatCircles?: boolean;
}

export const MapComponent: React.FC<MapProps> = ({
  incidents = [],
  selectedIncident,
  onSelectIncident,
  onNavigateDetail,
  onConfirmIncident,
  isPickerMode = false,
  selectedCoordinates,
  onCoordinatesPicked,
  center = [10.02, 76.32], // Default Kochi / Ernakulam Metro coordinates
  zoom = 12,
  showHeatCircles = false,
}) => {
  return (
    <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-slate-800">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <MapCenterUpdater center={center} zoom={zoom} />
        
        {/* OpenStreetMap Dark Style Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Picker Mode Listener */}
        {isPickerMode && onCoordinatesPicked && (
          <LocationPicker onLocationSelected={onCoordinatesPicked} />
        )}

        {/* Selected Coordinates Pin in Picker Mode */}
        {selectedCoordinates && (
          <Marker
            position={selectedCoordinates}
            icon={createCustomIcon('Selected Pin', 90, false)}
          >
            <Popup>
              <div className="p-2 text-xs font-sans">
                <p className="font-bold text-cyan-400">Marked Location</p>
                <p className="text-slate-300 font-mono">
                  {selectedCoordinates[0].toFixed(5)}, {selectedCoordinates[1].toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* High Risk Density / Heat Circles */}
        {showHeatCircles &&
          incidents
            .filter((i) => i.priority_score >= 70 && i.status !== 'resolved')
            .map((i) => (
              <Circle
                key={`circle-${i.id}`}
                center={[i.latitude, i.longitude]}
                radius={350}
                pathOptions={{
                  color: i.priority_score >= 80 ? '#f43f5e' : '#f59e0b',
                  fillColor: i.priority_score >= 80 ? '#f43f5e' : '#f59e0b',
                  fillOpacity: 0.22,
                  weight: 1.5,
                }}
              />
            ))}

        {/* Incident Markers */}
        {!isPickerMode &&
          incidents.map((incident) => {
            const isResolved = incident.status === 'resolved';
            return (
              <Marker
                key={incident.id}
                position={[incident.latitude, incident.longitude]}
                icon={createCustomIcon(incident.category, incident.priority_score, isResolved)}
                eventHandlers={{
                  click: () => onSelectIncident && onSelectIncident(incident),
                }}
              >
                <Popup>
                  <div className="p-3 max-w-[280px] font-sans">
                    {incident.photo_url && (
                      <div className="w-full h-28 rounded-lg overflow-hidden mb-2 bg-slate-900 border border-slate-800">
                        <img
                          src={incident.photo_url}
                          alt={incident.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">
                        {incident.reference_no}
                      </span>
                      <PriorityBadge score={incident.priority_score} urgency={incident.urgency} />
                    </div>

                    <h4 className="text-xs font-bold text-slate-100 line-clamp-2 mb-1">
                      {incident.title}
                    </h4>

                    <div className="flex items-center space-x-1 text-[11px] text-slate-400 mb-2">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{incident.locality_name}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                      <StatusBadge status={incident.status} />

                      <div className="flex items-center space-x-1.5">
                        {onConfirmIncident && incident.status !== 'resolved' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onConfirmIncident(incident.id);
                            }}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-200 flex items-center space-x-1"
                            title="Confirm problem is still present"
                          >
                            <ThumbsUp className="w-2.5 h-2.5 text-cyan-400" />
                            <span>{incident.confirmations_count}</span>
                          </button>
                        )}

                        {onNavigateDetail && (
                          <button
                            onClick={() => onNavigateDetail(incident.id)}
                            className="px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-medium flex items-center space-x-1"
                          >
                            <span>Details</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Map Floating Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-nexus-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-[11px] shadow-xl text-slate-300 pointer-events-auto flex items-center space-x-3">
        <span className="font-bold text-slate-100 text-[10px] uppercase tracking-wider">Priority:</span>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span>Critical</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span>High</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
          <span>Medium</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>Resolved</span>
        </div>
      </div>
    </div>
  );
};
