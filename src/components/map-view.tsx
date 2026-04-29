"use client";

import {
  getCategoryColor,
  getCategoryLabel,
  type Category,
  type Place,
} from "@/lib/places";
import maplibregl, {
  LngLatBoundsLike,
  Map as MapLibreMap,
  Marker,
  type Offset,
  StyleSpecification,
} from "maplibre-gl";
import { useEffect, useRef } from "react";

const koreaBounds: LngLatBoundsLike = [
  [124.5, 33.0],
  [132.2, 38.9],
];

const markerRadius = 12;
const popupOffset: Offset = {
  top: [0, markerRadius],
  "top-left": [0, markerRadius],
  "top-right": [0, markerRadius],
  bottom: [0, -markerRadius],
  "bottom-left": [0, -markerRadius],
  "bottom-right": [0, -markerRadius],
  left: [markerRadius, 0],
  right: [-markerRadius, 0],
};

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

export function MapView({
  categories,
  places,
  selectedPlaceId,
  onSelectPlace,
}: MapViewProps) {
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
    map.addControl(
      new maplibregl.ScaleControl({ unit: "metric" }),
      "bottom-right",
    );
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
      element.className = "map-marker";
      element.setAttribute("aria-label", place.name);
      const dot = document.createElement("span");
      dot.className = "map-marker-dot";
      dot.style.setProperty(
        "--marker-color",
        getCategoryColor(place.category),
      );
      element.append(dot);
      const categoryLabel = getCategoryLabel(categories, place.category);

      const popup = new maplibregl.Popup({
        className: "map-popup",
        closeOnClick: false,
        offset: popupOffset,
      }).setDOMContent(createPopupContent(place, categoryLabel));

      const marker = new maplibregl.Marker({ element, anchor: "center" })
        .setSubpixelPositioning(true)
        .setLngLat(place.coordinates)
        .setPopup(popup)
        .addTo(map);

      element.addEventListener("click", () => {
        onSelectPlace(place.id);
      });

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
  }, [categories, places, onSelectPlace]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    markersRef.current.forEach((marker, placeId) => {
      const element = marker.getElement();
      element.classList.toggle("is-selected", placeId === selectedPlaceId);
    });

    markersRef.current.forEach((marker, placeId) => {
      const popup = marker.getPopup();
      if (placeId !== selectedPlaceId && popup?.isOpen()) {
        popup.remove();
      }
    });

    if (!selectedPlaceId) {
      return;
    }

    const selectedMarker = markersRef.current.get(selectedPlaceId);
    const selectedPopup = selectedMarker?.getPopup();
    if (!selectedMarker || !selectedPopup) {
      return;
    }

    const openSelectedPopup = () => {
      if (!selectedPopup.isOpen()) {
        selectedMarker.togglePopup();
      }
    };

    const markerPosition = selectedMarker.getLngLat();
    if (map.getBounds().contains(markerPosition)) {
      openSelectedPopup();
      return;
    }

    const handleMoveEnd = () => {
      map.off("moveend", handleMoveEnd);
      openSelectedPopup();
    };

    map.on("moveend", handleMoveEnd);
    map.flyTo({
      center: markerPosition,
      zoom: Math.max(map.getZoom(), 10.5),
      duration: 700,
      essential: true,
    });

    return () => {
      map.off("moveend", handleMoveEnd);
    };
  }, [places, selectedPlaceId]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
