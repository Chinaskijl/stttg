/**
 * Интерфейс для описания области в игре
 */
export interface Region {
  /** Уникальный идентификатор области */
  id: number;

  /** Название области */
  name: string;

  /** Широта центра области */
  latitude: number;

  /** Долгота центра области */
  longitude: number;

  /** Текущее население области */
  population: number;

  /** Максимальное население области */
  maxPopulation: number;

  /** Координаты границ области в формате многоугольника [[lat, lng], ...] */
  boundaries?: number[][];

  /** Владелец области: 'player', 'ai', 'neutral' */
  owner: string;

  /** Список идентификаторов построенных зданий */
  buildings: string[];

  /** Количество военных единиц */
  military: number;

  /** Уровень удовлетворенности населения (в процентах) */
  satisfaction: number;

  /** Счетчик времени протестов (в секундах), null если нет протестов */
  protestTimer?: number | null;

  /** Список доступных для строительства зданий */
  availableBuildings?: string[];

  /** Ограничения на количество зданий каждого типа */
  buildingLimits?: {
    [buildingId: string]: number;
  };
}
