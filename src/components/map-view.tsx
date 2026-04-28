"use client";

import { useEffect, useRef } from "react";
import maplibregl, {
  LngLatBoundsLike,
  Map as MapLibreMap,
  Marker,
  StyleSpecification,
} from "maplibre-gl";
import { getCategoryColor, getCategoryLabel, type Category, type Place } from "@/lib/places";

const koreaBounds: LngLatBoundsLike = [
  [124.5, 33.0],
  [132.2, 38.9],
];

const baseStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
};

type MapViewProps = {
  categories: Category[];
  places: Place[];
  selectedPlaceId: string | null;
  onSelectPlace: (placeId: string) => void;
};

export function MapView({ categories, places, selectedPlaceId, onSelectPlace }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const markers = markersRef.current;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: baseStyle,
      center: [127.8, 36.2],
      zoom: 6.6,
      minZoom: 5.5,
      maxBounds: koreaBounds,
      renderWorldCopies: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-right");
    mapRef.current = map;

    return () => {
      markers.forEach((marker) => marker.remove());
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    places.forEach((place) => {
      const element = document.createElement("button");
      element.type = "button";
      element.className = place.id === selectedPlaceId ? "map-marker is-selected" : "map-marker";
      element.style.setProperty("--marker-color", getCategoryColor(place.category));
      element.setAttribute("aria-label", place.name);
      element.addEventListener("click", () => onSelectPlace(place.id));

      const popup = new maplibregl.Popup({
        offset: 24,
        className: "map-popup",
      }).setHTML(`
        <div class="map-popup-card">
          <div class="map-popup-header">
            <strong class="map-popup-title">${place.name}</strong>
            <span class="map-popup-tag">${getCategoryLabel(categories, place.category)}</span>
          </div>
          <p class="map-popup-city">${place.city}</p>
          <p class="map-popup-address">${place.address}</p>
        </div>
      `);

      const marker = new maplibregl.Marker({ element })
        .setLngLat(place.coordinates)
        .setPopup(popup)
        .addTo(map);

      markersRef.current.set(place.id, marker);
    });

    if (places.length === 0) {
      return;
    }

    const bounds = new maplibregl.LngLatBounds();
    places.forEach((place) => bounds.extend(place.coordinates));

    map.fitBounds(bounds, {
      padding: 60,
      maxZoom: 9.5,
      duration: 0,
    });
  }, [categories, places, selectedPlaceId, onSelectPlace]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPlaceId) {
      return;
    }

    const selectedPlace = places.find((place) => place.id === selectedPlaceId);
    if (!selectedPlace) {
      return;
    }

    map.flyTo({
      center: selectedPlace.coordinates,
      zoom: 10.5,
      duration: 700,
      essential: true,
    });
  }, [places, selectedPlaceId]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
