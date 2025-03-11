import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getAllBuildings } from '../shared/buildingsConfig';
import type { Region } from '../shared/regionTypes';

// Получаем здания из конфигурационного файла
const BUILDINGS = getAllBuildings();

// Получаем эквивалент __dirname для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Пути к файлам данных
const GAME_STATE_FILE = path.join(__dirname, "../data/game-state.json");

// Создаем директорию для данных, если ее нет
async function ensureDataDir() {
  const dataDir = path.join(__dirname, "../data");
  try {
    await fs.mkdir(dataDir, { recursive: true });
    console.log(`Создана директория для данных: ${dataDir}`);
  } catch (err) {
    console.error("Error creating data directory:", err);
  }
}

// Функция для генерации доступных зданий
function generateAvailableBuildings(): string[] {
  return [
    'house', 'farm', 'market', 'logging_camp', 'gold_mine', 'oil_rig', 
    'barracks', 'metal_factory', 'steel_factory', 'weapons_factory', 'theater', 'park', 'temple'
  ];
}

// Функция для генерации фиксированных лимитов зданий
function generateFixedBuildingLimits(availableBuildings: string[]): Record<string, number> {
  const limits: Record<string, number> = {
    'house': 4,
    'farm': 5,
    'logging_camp': 3,
    'market': 2,
    'gold_mine': 3,
    'oil_rig': 3,
    'barracks': 3,
    'weapons_factory': 2,
    'steel_factory': 3,
    'metal_factory': 4,
    'theater': 2,
    'park': 3,
    'temple': 1
  };

  // Фильтруем только доступные здания
  const result: Record<string, number> = {};
  for (const building of availableBuildings) {
    if (limits[building]) {
      result[building] = limits[building];
    } else {
      result[building] = 2; // Значение по умолчанию, если здание не найдено в пресетах
    }
  }

  return result;
}


// Функция для генерации случайного населения
function generateRandomPopulation(isLarge: boolean) {
  if (isLarge) {
    // Для больших областей: 5000-10000
    return Math.floor(Math.random() * 5001) + 5000;
  } else {
    // Для малых областей: 1000-5000
    return Math.floor(Math.random() * 4001) + 1000;
  }
}

// Функция для генерации случайного числа военных
function generateRandomMilitary(population: number) {
  // Военные составляют от 5% до 15% от населения
  return Math.floor(population * (Math.random() * 0.1 + 0.05));
}

// Инициализация базы данных - создаем регионы в памяти
export async function initDb() {
  try {
    await ensureDataDir();

    // Сбрасываем данные при перезапуске игры
    console.log("Resetting game data...");
    await resetGameData();

    // Инициализируем хранилище с начальными данными
    storage.initializeRegionsData();

    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
  }
}

// Функция для сброса данных игры
async function resetGameData() {
  await ensureDataDir();

  // Создаем начальные параметры для игры
  const initialGameState: GameState = {
    resources: {
      gold: 500,
      wood: 500,
      food: 1000, // Увеличиваем начальное количество еды
      oil: 500,
      metal: 0,
      steel: 0,
      weapons: 0
    },
    population: 0,
    military: 0
  };

  // Сохраняем начальное состояние
  await writeDataFile('game-state.json', initialGameState);
}

async function writeDataFile(filename: string, data: any) {
  const filePath = path.join(__dirname, `../data/${filename}`);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing file ${filename}:`, error);
  }
}

class Storage {
  private cities: Region[] = [];
  private gameState: any = null;
  private armyTransfers: any[] = [];
  private gameStateLastLoaded: number = 0;
  private CACHE_TTL = 5000; // Кэш действителен 5 секунд

  // Инициализация данных об областях в памяти
  initializeRegionsData() {
    // Базовые параметры для областей
    const regions: Region[] = [
      {
        id: 1,
        name: "Московская область",
        latitude: 55.7558,
        longitude: 37.6173,
        population: 0,
        maxPopulation: 10000,
        military: 0,
        resources: { food: 10, gold: 8, wood: 5, oil: 2 },
        availableBuildings: generateAvailableBuildings(),
        owner: "neutral",
        buildings: [],
        buildingLimits: generateFixedBuildingLimits(generateAvailableBuildings()),
        satisfaction: 50 // Устанавливаем начальную удовлетворенность в 50%
      },
      {
        id: 2,
        name: "Ленинградская область",
        latitude: 59.9343,
        longitude: 30.3351,
        population: 0,
        maxPopulation: 10000,
        military: 0,
        resources: { food: 8, oil: 5, wood: 7, gold: 3 },
        availableBuildings: generateAvailableBuildings(),
        owner: "neutral",
        buildings: [],
        buildingLimits: generateFixedBuildingLimits(generateAvailableBuildings()),
        satisfaction: 50 // Added satisfaction property
      },
      {
        id: 3,
        name: "Новосибирская область",
        latitude: 55.0084,
        longitude: 82.9357,
        population: 0,
        maxPopulation: 5000,
        military: 0,
        resources: { gold: 7, wood: 5, food: 3, metal: 4 },
        availableBuildings: generateAvailableBuildings(),
        owner: "neutral",
        buildings: [],
        buildingLimits: generateFixedBuildingLimits(generateAvailableBuildings()),
        satisfaction: 50 // Added satisfaction property
      },
      {
        id: 4,
        name: "Свердловская область",
        latitude: 56.8389,
        longitude: 60.6057,
        population: 0,
        maxPopulation: 6000,
        military: 0,
        resources: { metal: 12, wood: 6, gold: 4, food: 2 },
        availableBuildings: generateAvailableBuildings(),
        owner: "neutral",
        buildings: [],
        buildingLimits: generateFixedBuildingLimits(generateAvailableBuildings()),
        satisfaction: 50 // Added satisfaction property
      },
      {
        id: 5,
        name: "Нижегородская область",
        latitude: 56.2965,
        longitude: 43.9361,
        population: 0,
        maxPopulation: 5000,
        military: 0,
        resources: { wood: 8, food: 5, gold: 3, oil: 2 },
        availableBuildings: generateAvailableBuildings(),
        owner: "neutral",
        buildings: [],
        buildingLimits: generateFixedBuildingLimits(generateAvailableBuildings()),
        satisfaction: 50 // Added satisfaction property
      }
    ];

    this.cities = regions;
  }

  // Получение списка областей из памяти
  async getRegions(): Promise<Region[]> {
    return [...this.cities];
  }

  // Обновление области с проверкой лимитов зданий
  async updateRegion(id: number, updates: Partial<Region>): Promise<Region | null> {
    try {
      const index = this.cities.findIndex(city => city.id === id);

      if (index === -1) {
        return null;
      }

      const currentRegion = this.cities[index];

      // Добавляем отладочную информацию
      if (updates.satisfaction !== undefined) {
        console.log(`DEBUG: Updating region ${id} satisfaction from ${currentRegion.satisfaction} to ${updates.satisfaction}`);
      }

      if (updates.owner !== undefined) {
        console.log(`DEBUG: Updating region ${id} owner from ${currentRegion.owner} to ${updates.owner}`);

        // При смене владельца НЕ сбрасываем удовлетворенность, если она явно не указана
        if (updates.satisfaction === undefined && updates.owner === 'player' && currentRegion.owner === 'neutral') {
          console.log(`DEBUG: Owner changed to player, keeping current satisfaction at ${currentRegion.satisfaction}%`);
        }
      }

      // Запрещаем подозрительные обновления удовлетворенности (с 0% до ~50%)
      if (currentRegion.satisfaction === 0 && updates.satisfaction !== undefined) {
        if (updates.satisfaction > 45 && updates.satisfaction < 50) {
          console.log(`⚠️ BLOCKED suspicious satisfaction update from 0% to ${updates.satisfaction}%`);
          updates.satisfaction = 0; // Сохраняем 0%
        }
      }


      // Если обновляем здания, проверяем лимиты
      if (updates.buildings) {
        const buildingCounts: Record<string, number> = {};

        // Считаем количество каждого типа зданий
        updates.buildings.forEach(building => {
          buildingCounts[building] = (buildingCounts[building] || 0) + 1;
        });

        // Проверяем, не превышены ли лимиты
        if (currentRegion.buildingLimits) {
          for (const [buildingId, count] of Object.entries(buildingCounts)) {
            const limit = currentRegion.buildingLimits[buildingId] || 999;
            if (count > limit) {
              console.error(`Building limit exceeded for ${buildingId}. Limit: ${limit}, Attempted: ${count}`);
              return null;
            }
          }
        }
      }

      const updatedRegion = { ...currentRegion, ...updates };
      this.cities[index] = updatedRegion;

      return updatedRegion;
    } catch (error) {
      console.error('Error updating region:', error);
      return null;
    }
  }

  // Обновление всех областей в памяти
  async updateRegionsData(regions: Region[]): Promise<boolean> {
    try {
      this.cities = [...regions];
      return true;
    } catch (error) {
      console.error('Error updating all regions:', error);
      return false;
    }
  }

  // Для обратной совместимости добавляем методы getCities и updateCity
  async getCities(): Promise<Region[]> {
    return this.getRegions();
  }

  async updateCity(id: number, updates: Partial<Region>): Promise<Region | null> {
    console.log(`DEBUG: Updating city ${id} with:`, JSON.stringify(updates));
    return this.updateRegion(id, updates);
  }

  // Получение состояния игры
  async getGameState(): Promise<any> {
    try {
      const now = Date.now();

      // Используем кэш, если он не устарел
      if (this.gameState && now - this.gameStateLastLoaded < this.CACHE_TTL) {
        return this.gameState;
      }

      const data = await fs.readFile(GAME_STATE_FILE, 'utf8');
      this.gameState = JSON.parse(data);
      this.gameStateLastLoaded = now;

      return this.gameState;
    } catch (error) {
      console.error('Error reading game state:', error);
      return null;
    }
  }

  // Обновление состояния игры
  async setGameState(state: any): Promise<boolean> {
    try {
      await fs.writeFile(GAME_STATE_FILE, JSON.stringify(state, null, 2));
      this.gameState = state;
      this.gameStateLastLoaded = Date.now();
      return true;
    } catch (error) {
      console.error('Error setting game state:', error);
      return false;
    }
  }

  // Получение текущих перемещений армий
  getArmyTransfers() {
    return this.armyTransfers;
  }

  // Добавление перемещения армии
  async addArmyTransfer(transfer: any) {
    this.armyTransfers.push(transfer);
    return transfer;
  }

  // Удаление перемещения армии
  async removeArmyTransfer(id: number) {
    this.armyTransfers = this.armyTransfers.filter(t => t.id !== id);
    return true;
  }

  // Метод для обновления данных в памяти (не сохраняя в файл)
  updateInMemoryRegionsData(regions: Region[]) {
    this.cities = [...regions];
    return true;
  }
}

export const storage = new Storage();

interface GameState {
  resources: {
    gold: number;
    wood: number;
    food: number;
    oil: number;
    metal: number;
    steel: number;
    weapons: number;
  };
  population: number;
  military: number;
}