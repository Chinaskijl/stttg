// buildingsConfig.ts
import type { Building } from '@shared/schema';

const buildingsData: Building[] = [
  {
    id: "house",
    name: "Жилой дом",
    description: "Обеспечивает жильем население.",
    cost: { wood: 10, gold: 5 },
    population: { housing: 10, growth: 1 },
    workers: 5,
    maxCount: 100,
    icon: "🏠"
  },
  {
    id: "farm",
    name: "Ферма",
    description: "Производит +5 еды при наличии достаточного количества рабочих",
    cost: { wood: 15, gold: 10 },
    resourceProduction: { type: "food", amount: 5 },
    workers: 10,
    maxCount: 5,
    icon: "🌾"
  },
  {
    id: "logging_camp",
    name: "Лесорубка",
    description: "Производит древесину для строительства.",
    cost: { gold: 15 },
    resourceProduction: { type: "wood", amount: 2 },
    workers: 10,
    maxCount: 3,
    icon: "🪓"
  },
  {
    id: "gold_mine",
    name: "Золотой рудник",
    description: "Добывает золото для экономики.",
    cost: { wood: 25, food: 10 },
    resourceProduction: { type: "gold", amount: 2 },
    workers: 15,
    maxCount: 2,
    icon: "⛏️"
  },
  {
    id: "oil_rig",
    name: "Нефтяная вышка",
    description: "Добывает нефть для промышленности.",
    cost: { wood: 30, gold: 25 },
    resourceProduction: { type: "oil", amount: 1 },
    workers: 20,
    maxCount: 3,
    icon: "🛢️"
  },
  {
    id: "barracks",
    name: "Казармы",
    description: "Тренировка военных единиц.",
    cost: { wood: 40, gold: 30 },
    military: { production: 1, populationUse: 10 },
    workers: 15,
    maxCount: 3,
    icon: "🪖"
  },
  {
    id: "weapons_factory",
    name: "Оружейный завод",
    description: "Производит оружие для военных.",
    cost: { wood: 30, gold: 50, metal: 20 },
    resourceProduction: { type: "weapons", amount: 2 },
    resourceConsumption: { metal: 1, steel: 0.5 },
    workers: 25,
    maxCount: 2,
    icon: "🔫"
  },
  {
    id: "theater",
    name: "Театр",
    description: "Повышает удовлетворенность населения.",
    cost: { wood: 40, gold: 30 },
    workers: 15,
    satisfactionBonus: 5,
    maxCount: 2,
    icon: "🎭"
  },
  {
    id: "park",
    name: "Парк",
    description: "Место отдыха для жителей, повышает удовлетворенность.",
    cost: { wood: 20, gold: 15 },
    workers: 10,
    satisfactionBonus: 3,
    maxCount: 3,
    icon: "🌳"
  },
  {
    id: "temple",
    name: "Храм",
    description: "Духовное место, значительно повышает удовлетворенность населения.",
    cost: { wood: 80, gold: 100 },
    workers: 5,
    satisfactionBonus: 10,
    maxCount: 1,
    icon: "⛪"
  },
  {
    id: "market",
    name: "Рынок",
    description: "Увеличивает торговые возможности.",
    cost: { wood: 25, gold: 20 },
    resourceProduction: { type: "gold", amount: 1 },
    workers: 8,
    maxCount: 1,
    icon: "🏪"
  },
  {
    id: "theater",
    name: "Театр",
    description: "Повышает культурное влияние и счастье населения.",
    cost: { wood: 35, gold: 25 },
    resourceProduction: { type: "influence", amount: 0.5 },
    population: { growth: 0.5 },
    maxCount: 2,
    icon: "🎭"
  },
  {
    id: "metal_factory",
    name: "Металлургический завод",
    description: "Производит металл из руды.",
    cost: { wood: 30, gold: 20, oil: 5 },
    resourceProduction: { type: "metal", amount: 2 },
    resourceConsumption: { type: "oil", amount: 1 },
    workers: 25,
    maxCount: 5,
    icon: "🔧"
  },
  {
    id: "steel_factory",
    name: "Сталелитейный завод",
    description: "Перерабатывает металл в сталь для тяжелой промышленности.",
    cost: { gold: 150, wood: 100, metal: 50 },
    resourceProduction: { type: "steel", amount: 1 },
    resourceConsumption: { type: "metal", amount: 5 },
    workers: 20,
    maxCount: 3,
    icon: "⚒️"
  },
  {
    id: "weapons_factory",
    name: "Оружейный завод",
    description: "Производит оружие для армии.",
    cost: { gold: 200, wood: 50, steel: 100 },
    resourceProduction: { type: "weapons", amount: 1 },
    resourceConsumption: { type: "steel", amount: 5 },
    workers: 20,
    maxCount: 2,
    icon: "🔫"
  },
  {
    id: "barracks",
    name: "Казармы",
    description: "Обучает военных для армии.",
    cost: { wood: 20, gold: 15, food: 10 },
    military: { production: 1, populationUse: 1 },
    resourceConsumption: { type: "weapons", amount: 1 },
    workers: 15,
    maxCount: 5,
    icon: "🛡️"
  },
  {
    id: "embassy",
    name: "Посольство",
    description: "Развивает дипломатические отношения и увеличивает влияние.",
    cost: { gold: 300, wood: 100 },
    resourceProduction: { type: "influence", amount: 1 },
    maxCount: 1,
    icon: "🏛️"
  },
  {
    id: "cultural_center",
    name: "Культурный центр",
    description: "Распространяет культурное влияние на окружающие регионы.",
    cost: { gold: 200, wood: 150 },
    resourceProduction: { type: "influence", amount: 0.5 },
    population: { growth: 0.5 },
    maxCount: 2,
    icon: "🎭"
  }
];

export const getBuildingsData = (): Building[] => buildingsData;


// original file with import changes

export type Building = {
  id: string;
  name: string;
  description: string;
  cost: Record<string, number>;
  population?: {
    housing?: number;
    growth?: number;
  };
  resourceProduction?: {
    type: string;
    amount: number;
  };
  resourceConsumption?: {
    type: string;
    amount: number;
  };
  military?: {
    production: number;
    populationUse?: number;
  };
  satisfactionBonus?: number;
  workers?: number;
  maxCount?: number;
  icon?: string;
};

import type { Building } from '@shared/schema';
import { getAllBuildings } from '@shared/buildingsConfig';

// Получаем здания из конфигурационного файла
export const BUILDINGS: Building[] = getAllBuildings();

export const TERRITORY_COLORS = {
  player: '#3b82f6', 
  neutral: '#6b7280', 
  enemy: '#ef4444', 
  ally: '#22c55e', 
};

export const POPULATION_FOOD_CONSUMPTION = 0.1;