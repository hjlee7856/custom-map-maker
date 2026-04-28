"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";
import { categories, samplePlaces } from "@/lib/places";

const markerColors = {
  food: "#dc2626",
  report: "#d97706",
  parking: "#0f766e",
} as const;

export function MapView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [126.929, 37.559],
      zoom: 13,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    samplePlaces.forEach((place) => {
      const popup = new maplibregl.Popup({ offset: 24 }).setHTML(
        `<strong>${place.name}</strong><br />${categories[place.category]} · ${place.address}`,
      );

      new maplibregl.Marker({ color: markerColors[place.category] })
        .setLngLat(place.coordinates)
        .setPopup(popup)
        .addTo(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
