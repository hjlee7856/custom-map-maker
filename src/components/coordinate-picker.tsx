"use client";

import { useEffect, useEffectEvent, useRef } from "react";
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

type CoordinatePickerProps = {
  categories: Category[];
  places?: Place[];
  value: { latitude: number; longitude: number };
  onChange: (value: { latitude: number; longitude: number }) => void;
};

function createPopupContent(place: Place, categoryLabel: string) {
  const wrapper = document.createElement("div");
  wrapper.className = "map-popup-card";

  const header = document.createElement("div");
  header.className = "map-popup-header";

  const title = document.createElement("strong");
  title.className = "map-popup-title";
  title.textContent = place.name;

  const tag = document.createElement("span");
  tag.className = "map-popup-tag";
  tag.textContent = categoryLabel;

  const city = document.createElement("p");
  city.className = "map-popup-city";
  city.textContent = place.city;

  const address = document.createElement("p");
  address.className = "map-popup-address";
  address.textContent = place.address;

  header.append(title, tag);
  wrapper.append(header, city, address);

  return wrapper;
}

export function CoordinatePicker({
  categories,
  places = [],
  value,
  onChange,
}: CoordinatePickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const selectedMarkerRef = useRef<Marker | null>(null);
  const initialCenterRef = useRef<[number, number]>([value.longitude, value.latitude]);
  const handleChange = useEffectEvent(onChange);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: baseStyle,
      center: initialCenterRef.current,
      zoom: 6.8,
      minZoom: 5.5,
      maxBounds: koreaBounds,
      renderWorldCopies: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.on("click", (event) => {
      handleChange({
        latitude: Number(event.lngLat.lat.toFixed(6)),
        longitude: Number(event.lngLat.lng.toFixed(6)),
      });
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      selectedMarkerRef.current?.remove();
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
    markersRef.current = places.map((place) => {
      const element = document.createElement("span");
      element.className = "map-marker map-marker-preview";
      element.style.setProperty("--marker-color", getCategoryColor(place.category));
      const categoryLabel = getCategoryLabel(categories, place.category);

      const popup = new maplibregl.Popup({ offset: 18 }).setDOMContent(
        createPopupContent(place, categoryLabel),
      );

      return new maplibregl.Marker({ element })
        .setLngLat(place.coordinates)
        .setPopup(popup)
        .addTo(map);
    });
  }, [categories, places]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    selectedMarkerRef.current?.remove();

    const element = document.createElement("button");
    element.type = "button";
    element.className = "map-marker is-selected";
    element.style.setProperty("--marker-color", "#17212b");
    element.setAttribute("aria-label", "선택한 좌표");

    selectedMarkerRef.current = new maplibregl.Marker({ element })
      .setLngLat([value.longitude, value.latitude])
      .addTo(map);

    map.flyTo({
      center: [value.longitude, value.latitude],
      zoom: Math.max(map.getZoom(), 8.5),
      duration: 300,
      essential: true,
    });
  }, [value.latitude, value.longitude]);

  return (
    <div className="coordinate-picker-shell">
      <div className="coordinate-picker-meta">
        <strong>지도를 클릭해서 좌표 선택</strong>
        <span>
          위도 {value.latitude.toFixed(6)} / 경도 {value.longitude.toFixed(6)}
        </span>
      </div>
      <div ref={containerRef} className="coordinate-picker-map" />
    </div>
  );
}
