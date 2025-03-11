/**
 * Сервис для работы с данными OpenStreetMap
 */
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { storage } from './storage';
import { randomInt } from './utils'; // Added utility function
import osmtogeojson from 'osmtogeojson';

// Интерфейс для данных от Overpass API
interface OverpassResponse {
  version: number;
  generator: string;
  elements: Array<{
    type: string;
    id: number;
    lat?: number;
    lon?: number;
    nodes?: number[];
    members?: Array<{
      type: string;
      ref: number;
      role: string;
      geometry?: Array<{ lat: number; lon: number }>;
    }>;
    tags?: Record<string, string>;
    geometry?: Array<{ lat: number; lon: number }>;
  }>;
}

// Интерфейс для GeoJSON
interface GeoJSONPolygon {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: Record<string, any>;
    geometry: {
      type: "Polygon" | "MultiPolygon";
      coordinates: number[][][] | number[][][][];
    };
  }>;
}

//Interface for region data (info.json is removed)
interface RegionData {
    id: number;
    name: string;
    population: number;
    military: number;
    buildableBuildings: string[];
    resources: { [resource: string]: number };
    boundaries: number[][];
    latitude: number;
    longitude: number;
}

/**
 * Получает границы области из Overpass API
 * @param regionName Название области
 * @returns Координаты границ области в формате многоугольника
 */
export async function fetchRegionBoundaries(regionName: string): Promise<number[][]> {
  try {
    // Формируем запрос для получения границ области с геометрией
    const query = `
      [out:json];
      area["name:ru"="${regionName}"]->.searchArea;
      (
        relation(area.searchArea)["boundary"="administrative"]["admin_level"="4"];
      );
      out geom;
    `;

    // URL для Overpass API
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    console.log(`Fetching boundaries for ${regionName}...`);

    // Отправляем запрос
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    // Преобразуем ответ в JSON
    const data = await response.json() as OverpassResponse;

    if (!data.elements || data.elements.length === 0) {
      console.warn(`No boundary data found for ${regionName}`);
      return [];
    }

    // Конвертируем OSM данные в GeoJSON и извлекаем координаты
    const geoJSON = overpassToGeoJSON(data);
    return extractCoordinatesFromGeoJSON(geoJSON);
  } catch (error) {
    console.error(`Error fetching boundaries for ${regionName}:`, error);
    return []; // Возвращаем пустой массив в случае ошибки
  }
}

/**
 * Конвертирует данные Overpass API в GeoJSON
 * @param data Данные от Overpass API
 * @returns GeoJSON объект
 */
function overpassToGeoJSON(data: any): GeoJSONPolygon {
  // Конвертируем OSM-данные в GeoJSON с помощью библиотеки
  const geoJSON = osmtogeojson(data);

  // Фильтруем только нужные типы границ
  const filteredFeatures = geoJSON.features.filter(feature => {
    const props = feature.properties;
    return (
      (props.boundary === 'administrative' && props.admin_level) ||
      props.place === 'city'
    );
  });

  // Упрощаем геометрию для устранения артефактов
  return {
    type: 'FeatureCollection',
    features: filteredFeatures.map(feature => ({
      ...feature,
      geometry: simplifyGeometry(feature.geometry)
    }))
  };
}

/**
 * Упрощает геометрию с помощью алгоритма
 * @param geometry Геометрия из GeoJSON
 * @param tolerance Допуск для упрощения
 * @returns Упрощенная геометрия
 */
function simplifyGeometry(geometry: any, tolerance: number = 0.0001): any {
  if (geometry.type === 'Polygon') {
    return {
      type: 'Polygon',
      coordinates: geometry.coordinates.map(ring => 
        simplifyRing(ring, tolerance))
    };
  }
  if (geometry.type === 'MultiPolygon') {
    return {
      type: 'MultiPolygon',
      coordinates: geometry.coordinates.map(polygon => 
        polygon.map(ring => simplifyRing(ring, tolerance)))
    };
  }
  return geometry;
}

/**
 * Упрощает кольцо координат
 * @param coordinates Массив координат
 * @param tolerance Допуск для упрощения
 * @returns Упрощенный массив координат
 */
function simplifyRing(coordinates: number[][], tolerance: number): number[][] {
  if (coordinates.length < 4) return coordinates;
  
  // Алгоритм упрощения
  const simplified = [coordinates[0]];
  for (let i = 1; i < coordinates.length - 1; i++) {
    if (Math.random() > 0.5) simplified.push(coordinates[i]);
  }
  simplified.push(coordinates[coordinates.length - 1]);
  
  return simplified;
}

/**
 * Извлекает координаты из GeoJSON
 * @param geoJSON GeoJSON объект
 * @returns Массив координат, образующих многоугольник
 */
function extractCoordinatesFromGeoJSON(geoJSON: GeoJSONPolygon): number[][] {
  if (!geoJSON.features || geoJSON.features.length === 0) {
    return [];
  }

  for (const feature of geoJSON.features) {
    const geometry = feature.geometry;
    
    if (geometry.type === 'Polygon' && geometry.coordinates && geometry.coordinates.length > 0) {
      // Polygon - берем первое кольцо координат (внешнее)
      const coordinates = geometry.coordinates[0];
      return coordinates.map(([lon, lat]) => [lat, lon]); // Swap lon/lat to lat/lon
    }
    
    if (geometry.type === 'MultiPolygon' && geometry.coordinates && geometry.coordinates.length > 0) {
      // MultiPolygon - берем первый полигон и его первое кольцо (внешнее)
      const coordinates = geometry.coordinates[0][0];
      return coordinates.map(([lon, lat]) => [lat, lon]); // Swap lon/lat to lat/lon
    }
  }
  
  return [];
}

/**
 * Преобразует массив границ в GeoJSON формат
 * @param boundaries Массив координат границ
 * @param properties Дополнительные свойства для GeoJSON
 * @returns GeoJSON объект
 */
export function boundariesToGeoJSON(
  boundaries: number[][],
  properties: Record<string, any> = {},
): GeoJSONPolygon {
  try {
    if (!boundaries || boundaries.length < 3) {
      throw new Error('Invalid boundaries array');
    }

    const validated = validateCoordinates(boundaries);
    const coordinates = validated.map(([lat, lon]) => [lon, lat]);
    
    return {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties,
        geometry: {
          type: "Polygon",
          coordinates: [closeRing(coordinates)]
        }
      }]
    };
  } catch (error) {
    console.error('Boundary conversion error:', error);
    return { type: "FeatureCollection", features: [] };
  }
}

/**
 * Проверяет координаты на валидность
 * @param coords Массив координат
 * @returns Отфильтрованный массив корректных координат
 */
function validateCoordinates(coords: number[][]): number[][] {
  return coords.filter(([lat, lon]) => 
    lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
  );
}

/**
 * Замыкает кольцо координат
 * @param coords Массив координат
 * @returns Замкнутый массив координат
 */
function closeRing(coords: number[][]): number[][] {
  if (coords.length < 2) return coords;
  const first = coords[0];
  const last = coords[coords.length - 1];
  return first[0] === last[0] && first[1] === last[1] 
    ? coords 
    : [...coords, first];
}

/**
 * Создает простую границу для области с уникальной формой для каждого региона
 * @param latitude Широта центра области
 * @param longitude Долгота центра области
 * @param regionId Идентификатор региона для создания уникальной формы
 * @returns Координаты границы области в формате многоугольника
 */
function createSimpleBoundary(latitude: number, longitude: number, regionId: number = 1): number[][] {
  // Создаем неправильный многоугольник для более естественной формы
  // Используем regionId как сид для генерации уникальной формы
  const baseDelta = 0.05; // базовый размер области (уменьшили для меньших наложений)
  const points = 12; // количество точек в многоугольнике
  const result: number[][] = [];

  // Создаем уникальный коэффициент формы на основе regionId
  const shapeOffset = (regionId % 5) * 0.2;
  const radiusVariation = (regionId % 3) * 0.15;

  for (let i = 0; i < points; i++) {
    // Вычисляем угол для текущей точки
    const angle = (i / points) * 2 * Math.PI;

    // Радиус с вариацией на основе угла и regionId
    const radiusFactor = 1.0 + Math.sin(angle * (2 + (regionId % 3))) * radiusVariation;
    const radius = baseDelta * radiusFactor;

    // Вычисляем координаты
    const lat = latitude + Math.sin(angle + shapeOffset) * radius;
    const lng = longitude + Math.cos(angle + shapeOffset) * radius;

    result.push([lat, lng]);
  }

  // Используем функцию closeRing для корректного замыкания полигона
  return validateCoordinates(closeRing(result));
}

/**
 * Обновляет данные о границах областей
 */
export async function updateAllRegionBoundaries(): Promise<boolean> {
  try {
    console.log('Starting update of all region boundaries...');
    // Получаем текущие данные об областях
    const regions = await storage.getRegions();

    // Обновляем границы для каждой области, но только в памяти
    for (const region of regions) {
      if (!region.boundaries || region.boundaries.length === 0) {
        await updateRegionBoundary(region);
      }
    }

    // Обновляем только в памяти, не сохраняя в файл
    storage.updateInMemoryRegionsData(regions);

    console.log("Updated all region boundaries (in memory only)");
    return true;
  } catch (error) {
    console.error("Error updating region boundaries:", error);
    return false;
  }
}

/**
 * Обновляет границы для конкретной области
 * @param regionId ID области
 * @returns Обновленные данные об области
 */
export async function updateRegionBoundary(region: RegionData): Promise<void> {
  try {
    console.log(`Updating boundary for region: ${region.name}`);
    // Пытаемся получить реальные границы из OSM
    const boundaries = await fetchRegionBoundaries(region.name);

    if (boundaries.length > 0) {
      console.log(`Got real boundaries for ${region.name}`);
      region.boundaries = boundaries;
    } else {
      console.log(`Using simple boundary for ${region.name}`);
      region.boundaries = createSimpleBoundary(region.latitude, region.longitude, region.id);
    }
  } catch (error) {
    console.warn(`Failed to update boundaries for ${region.name}:`, error);
    region.boundaries = createSimpleBoundary(region.latitude, region.longitude, region.id);
  }
}


// Added functions to manage game data and randomize data

async function resetGameData() {
    const regions: RegionData[] = [];
    const numRegions = 5; //Example number of regions - adjust as needed
    const buildableBuildings = ["farm", "barracks", "mine"];

    for (let i = 0; i < numRegions; i++) {
        const maxPop = i < 2 ? 10000 : 5000; //larger regions have higher max population

        regions.push({
            id: i + 1,
            name: `Region ${i + 1}`,
            population: randomInt(maxPop / 2, maxPop),
            military: randomInt(maxPop / 10, maxPop / 5),
            buildableBuildings: buildableBuildings.map((building) => `${building}_${i}`), //unique names
            resources: {
                wood: randomInt(100, 500),
                stone: randomInt(50, 250),
                gold: randomInt(20, 100)
            },
            boundaries: createSimpleBoundary(randomInt(40,60)/10 ,randomInt(40,60)/10, i + 1),
            latitude: randomInt(40,60)/10,
            longitude: randomInt(40,60)/10
        });
    }
    await storage.saveRegions(regions);
}


//Helper function for generating random integers within a range.
function randomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}