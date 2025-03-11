import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-polylinedecorator";
import { useGameStore } from "@/lib/store";
import { TERRITORY_COLORS } from "@/lib/game";

interface MilitaryMovement {
  fromCity: any;
  toCity: any;
  amount: number;
  marker: L.Marker;
  startTime: number;
  duration: number;
  pathLine?: L.Polyline;
}

export function Map() {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Layer[]>([]);
  const polygonsRef = useRef<L.Layer[]>([]);
  const militaryMovementsRef = useRef<MilitaryMovement[]>([]);
  const animationFrameRef = useRef<number>();
  const { cities, setSelectedCity } = useGameStore();
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Initialize map once
  useEffect(() => {
    const container = document.getElementById("map");
    if (!container) {
      console.error("Map container not found");
      return;
    }

    console.log("Initializing map");
    mapRef.current = L.map("map", {
      center: [55.7558, 37.6173], // Moscow coordinates
      zoom: 6,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapRef.current);

    return () => {
      console.log("Cleaning up map");
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []); // Empty dependency array - only run once

  // Update markers and polygons when cities change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up existing markers and polygons
    markersRef.current.forEach((marker) => marker.remove());
    polygonsRef.current.forEach((polygon) => polygon.remove());
    markersRef.current = [];
    polygonsRef.current = [];

    // Add new markers and polygons
    cities.forEach((city) => {
      const color =
        TERRITORY_COLORS[city.owner as keyof typeof TERRITORY_COLORS];

      // Add territory polygon
      const polygon = L.polygon(city.boundaries, {
        color,
        fillColor: color,
        fillOpacity: 0.4,
        weight: 2,
      }).addTo(mapRef.current!);
      polygonsRef.current.push(polygon);

      // Create custom HTML element for city info
      const cityInfo = document.createElement("div");
      cityInfo.className =
        "bg-white/90 p-2 rounded shadow-lg border border-gray-200 cursor-pointer";
        
      // Подготовка данных для отображения
      const buildingsDisplay = city.buildings.reduce((acc, buildingId) => {
        acc[buildingId] = (acc[buildingId] || 0) + 1;
        return acc;
      }, {});
      
      // Получаем доступные но не построенные здания
      const availableBuildingsCount = {};
      if (city.availableBuildings) {
        city.availableBuildings.forEach(buildingId => {
          const maxCount = city.buildingLimits?.[buildingId] || 0;
          const currentCount = city.buildings.filter(b => b === buildingId).length;
          availableBuildingsCount[buildingId] = { current: currentCount, max: maxCount };
        });
      }
      
      cityInfo.innerHTML = `
        <div class="font-bold text-lg">${city.name}</div>
        <div class="text-sm">
          <div>👥 Население: ${city.population} / ${city.maxPopulation}</div>
          <div>⚔️ Военные: ${city.military || 0}</div>
          
          <div class="flex flex-wrap gap-1 mt-1">
          <!-- Построенные здания -->
          ${Object.entries(buildingsDisplay)
            .map(([buildingId, count]) => {
              const building = BUILDINGS.find(b => b.id === buildingId);
              const icon = building?.icon || '🏢';
              const maxCount = city.buildingLimits?.[buildingId] || 0;
              
              return `<div class="bg-green-100 text-green-800 px-1.5 py-0.5 rounded-md flex items-center" title="${building?.name || buildingId.replace('_', ' ')}">
                ${icon} <span class="ml-1 text-xs">${count}/${maxCount}</span>
              </div>`;
            })
            .join("")}
          
          <!-- Доступные для строительства здания -->
          ${Object.entries(availableBuildingsCount)
            .filter(([buildingId, counts]) => !buildingsDisplay[buildingId])
            .map(([buildingId, counts]) => {
              const building = BUILDINGS.find(b => b.id === buildingId);
              const icon = building?.icon || '🏢';
              
              return `<div class="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md flex items-center" title="${building?.name || buildingId.replace('_', ' ')}">
                ${icon} <span class="ml-1 text-xs">0/${counts.max}</span>
              </div>`;
            })
            .join("")}
          </div>
        </div>
      `;

      // Add city label as a custom divIcon
      const cityMarker = L.divIcon({
        className: "custom-div-icon",
        html: cityInfo,
        iconSize: [200, 80],
        iconAnchor: [100, 40],
      });

      const marker = L.marker([city.latitude, city.longitude], {
        icon: cityMarker,
      })
        .addTo(mapRef.current!)
        .on("click", () => setSelectedCity(city));

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      polygonsRef.current.forEach((polygon) => polygon.remove());
    };
  }, [cities, setSelectedCity]);

  // Setup WebSocket for military movements
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const newWs = new WebSocket(`${protocol}//${window.location.host}/ws`);

    newWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "MILITARY_TRANSFER_START") {
        const { fromCity, toCity, amount, duration } = data;

        // Create military unit marker with custom icon
        const militaryIcon = L.divIcon({
          className: "military-marker",
          html: `<div style="width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; background: #ff4500; border-radius: 50%; border: 2px solid white; color: white; font-weight: bold;">${amount}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([fromCity.latitude, fromCity.longitude], {
          icon: militaryIcon,
        }).addTo(mapRef.current!);

        const pathLine = L.polyline(
          [
            [fromCity.latitude, fromCity.longitude],
            [toCity.latitude, toCity.longitude],
          ],
          {
            color: "blue",
            weight: 3,
          },
        ).addTo(mapRef.current!);

        militaryMovementsRef.current.push({
          fromCity,
          toCity,
          amount,
          marker,
          startTime: Date.now(),
          duration,
          pathLine,
        });

        // Start animation if not already running
        if (!animationFrameRef.current) {
          animate();
        }
      }
    };

    setWs(newWs);

    return () => {
      newWs.close();
    };
  }, []);

  const animate = () => {
    if (!mapRef.current) return;

    const currentTime = Date.now();
    militaryMovementsRef.current = militaryMovementsRef.current.filter(
      (movement) => {
        const progress = (currentTime - movement.startTime) / movement.duration;

        if (progress >= 1) {
          movement.marker.remove();
          if (movement.pathLine) movement.pathLine.remove();
          return false;
        }

        const lat =
          movement.fromCity.latitude +
          (movement.toCity.latitude - movement.fromCity.latitude) * progress;
        const lng =
          movement.fromCity.longitude +
          (movement.toCity.longitude - movement.fromCity.longitude) * progress;
        movement.marker.setLatLng([lat, lng]);
        if (movement.pathLine) {
          movement.pathLine.setLatLngs([
            [movement.fromCity.latitude, movement.fromCity.longitude],
            [lat, lng],
          ]);
        }

        return true;
      },
    );

    if (militaryMovementsRef.current.length > 0) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  return <div id="map" className="w-full h-screen" />;
}

export function getResourceIcon(resource: string): string {
  switch (resource) {
    case "gold":
      return "💰";
    case "wood":
      return "🌲";
    case "food":
      return "🍗";
    case "oil":
      return "🛢️";
    case "metal":
      return "⛏️";
    case "steel":
      return "🔩";
    case "weapons":
      return "⚔️";
    default:
      return "📦";
  }
}
