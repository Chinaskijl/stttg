
import { Building } from './schema';

/**
 * Конфигурация всех зданий в игре
 * Здесь можно настраивать стоимость строительства, производство и потребление ресурсов,
 * влияние на население, военные параметры и прочие характеристики зданий
 */
export const BUILDINGS_CONFIG: Record<string, Building> = {
  // Жилые здания
  house: {
    id: 'house',
    name: 'Жилой дом',
    cost: {
      wood: 10,
      gold: 5
    },
    population: {
      housing: 10,
      growth: 0.1
    },
    maxCount: 4
  },

  // Производство еды
  farm: {
    id: 'farm',
    name: 'Ферма',
    cost: {
      wood: 15,
      gold: 10
    },
    resourceProduction: {
      type: 'food',
      amount: 1
    },
    workers: 10, // Требуется 10 рабочих для полной эффективности
    maxCount: 5
  },

  // Рынок
  market: {
    id: 'market',
    name: 'Рынок',
    cost: {
      wood: 20,
      gold: 30
    },
    resourceProduction: {
      type: 'gold',
      amount: 3
    },
    workers: 5,
    satisfactionBonus: 5, // Бонус к удовлетворенности населения
    maxCount: 2
  },

  // Производство дерева
  logging_camp: {
    id: 'logging_camp',
    name: 'Лесопилка',
    cost: {
      wood: 5,
      gold: 20
    },
    resourceProduction: {
      type: 'wood',
      amount: 2
    },
    workers: 8,
    maxCount: 3
  },

  // Добыча золота
  gold_mine: {
    id: 'gold_mine',
    name: 'Золотая шахта',
    cost: {
      wood: 30,
      gold: 50
    },
    resourceProduction: {
      type: 'gold',
      amount: 5
    },
    workers: 15,
    maxCount: 3
  },

  // Добыча нефти
  oil_rig: {
    id: 'oil_rig',
    name: 'Нефтяная вышка',
    cost: {
      wood: 40,
      gold: 100,
      metal: 20
    },
    resourceProduction: {
      type: 'oil',
      amount: 3
    },
    workers: 12,
    maxCount: 3
  },

  // Военные здания
  barracks: {
    id: 'barracks',
    name: 'Казармы',
    cost: {
      wood: 50,
      gold: 100
    },
    military: {
      production: 1,
      populationUse: 1
    },
    resourceConsumption: {
      gold: 5,
      food: 2
    },
    workers: 10,
    maxCount: 3
  },

  // Фабрика металла
  metal_factory: {
    id: 'metal_factory',
    name: 'Металлургический завод',
    cost: {
      wood: 50,
      gold: 150,
      oil: 10
    },
    resourceProduction: {
      type: 'metal',
      amount: 2
    },
    resourceConsumption: {
      oil: 1
    },
    workers: 15,
    maxCount: 4
  },

  // Сталелитейный завод
  steel_factory: {
    id: 'steel_factory',
    name: 'Сталелитейный завод',
    cost: {
      wood: 40,
      gold: 200,
      metal: 50
    },
    resourceProduction: {
      type: 'steel',
      amount: 1
    },
    resourceConsumption: {
      metal: 2,
      oil: 1
    },
    workers: 20,
    maxCount: 3
  },

  // Оружейный завод
  weapons_factory: {
    id: 'weapons_factory',
    name: 'Оружейный завод',
    cost: {
      wood: 30,
      gold: 300,
      steel: 100
    },
    resourceProduction: {
      type: 'weapons',
      amount: 1
    },
    resourceConsumption: {
      steel: 2,
      oil: 1
    },
    workers: 25,
    maxCount: 2
  },

  // Развлекательные и культурные здания
  theater: {
    id: 'theater',
    name: 'Театр',
    cost: {
      wood: 100,
      gold: 200
    },
    satisfactionBonus: 10,
    workers: 10,
    maxCount: 2
  },

  park: {
    id: 'park',
    name: 'Парк',
    cost: {
      wood: 50,
      gold: 100
    },
    satisfactionBonus: 5,
    maxCount: 3
  },

  temple: {
    id: 'temple',
    name: 'Храм',
    cost: {
      wood: 200,
      gold: 300
    },
    satisfactionBonus: 15,
    resourceProduction: {
      type: 'influence',
      amount: 1
    },
    workers: 5,
    maxCount: 1
  }
};

/**
 * Функция для получения конфигурации здания по его ID
 * @param buildingId ID здания
 * @returns Конфигурация здания или undefined, если здание не найдено
 */
export function getBuildingConfig(buildingId: string): Building | undefined {
  return BUILDINGS_CONFIG[buildingId];
}

/**
 * Функция для получения списка всех доступных зданий
 * @returns Массив зданий
 */
export function getAllBuildings(): Building[] {
  return Object.values(BUILDINGS_CONFIG);
}

/**
 * Функция для получения стоимости строительства здания
 * @param buildingId ID здания
 * @returns Объект со стоимостью или null, если здание не найдено
 */
export function getBuildingCost(buildingId: string): Record<string, number> | null {
  const building = BUILDINGS_CONFIG[buildingId];
  if (!building || !building.cost) {
    return null;
  }
  return building.cost;
}

/**
 * Функция для получения производства ресурсов зданием
 * @param buildingId ID здания
 * @returns Объект с типом ресурса и количеством или null
 */
export function getBuildingProduction(buildingId: string): { type: string, amount: number } | null {
  const building = BUILDINGS_CONFIG[buildingId];
  if (!building || !building.resourceProduction) {
    return null;
  }
  return building.resourceProduction;
}

/**
 * Функция для получения потребления ресурсов зданием
 * @param buildingId ID здания
 * @returns Объект с потребляемыми ресурсами или null
 */
export function getBuildingConsumption(buildingId: string): Record<string, number> | null {
  const building = BUILDINGS_CONFIG[buildingId];
  if (!building || !building.resourceConsumption) {
    return null;
  }
  return building.resourceConsumption;
}
