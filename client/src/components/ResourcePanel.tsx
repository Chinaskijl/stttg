import { useGameStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Coins, Trees, Wheat, Droplet, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BUILDINGS } from '@/lib/game';
import { getSatisfactionFactors } from '@/lib/satisfactionHelpers'; // Added import

export function ResourcePanel() {
  const { gameState, cities, resourcesIncome } = useGameStore();
  const [resourceProduction, setResourceProduction] = useState({
    gold: 0,
    wood: 0,
    food: 0,
    oil: 0,
    metal: 0,
    steel: 0,
    weapons: 0,
    influence: 0
  });
  const [foodConsumption, setFoodConsumption] = useState(0);

  useEffect(() => {
    let goldProd = 0;
    let woodProd = 0;
    let foodProd = 0;
    let oilProd = 0;
    let metalProd = 0;
    let steelProd = 0;
    let weaponsProd = 0;
    let foodCons = 0;
    let influenceProd = 0;
    let taxIncome = 0;

    // We'll track building production separately from income in resourcesIncome
    // resourcesIncome comes from server and includes tax income and other special sources

    // Добавляем налоговый доход от сервера, если он есть
    if (resourcesIncome && resourcesIncome.gold !== undefined) {
      taxIncome = resourcesIncome.gold;

      // Явно добавляем информацию о налогах для отображения в тултипе
      if (Math.abs(taxIncome) > 0.01) {
        goldProd += taxIncome; // Включаем налоги в общую добычу золота
      }
    }

    cities.forEach(city => {
      if (city.owner === 'player') {
        city.buildings.forEach(buildingId => {
          const building = BUILDINGS.find(b => b.id === buildingId);
          if (building && building.resourceProduction) {
            // Check for worker availability before calculating production
            const totalWorkers = city.population || 0;
            const requiredWorkers = (building.workers || 0);
            const allocatedWorkers = Math.min(requiredWorkers, totalWorkers);
            const hasWorkers = requiredWorkers > 0 ? allocatedWorkers > 0 : true;
            const efficiency = requiredWorkers > 0 ? (allocatedWorkers / requiredWorkers) * 100 : 100;
            const { type, amount } = building.resourceProduction;

            // Расчет производства с учетом доступных рабочих и их количества
            let adjustedAmount = 0;

            if (hasWorkers) {
              // Для фермы учитываем соотношение рабочих
              if (building.id === 'farm') {
                // Рассчитываем коэффициент на основе количества доступных рабочих
                // Максимальное количество рабочих для фермы = 10 (из конфига)
                const workerRatio = Math.min(totalWorkers / 10, 1);
                adjustedAmount = amount * workerRatio;
              } else {
                // Для других зданий просто проверяем наличие рабочих
                adjustedAmount = amount;
              }
            }

            switch (type) {
              case 'gold':
                goldProd += adjustedAmount;
                break;
              case 'wood':
                woodProd += adjustedAmount;
                break;
              case 'food':
                foodProd += adjustedAmount;
                break;
              case 'oil':
                oilProd += adjustedAmount;
                break;
              case 'metal':
                metalProd += adjustedAmount;
                break;
              case 'steel':
                steelProd += adjustedAmount;
                break;
              case 'weapons':
                weaponsProd += adjustedAmount;
                break;
              case 'influence':
                influenceProd += adjustedAmount;
                break;
            }
          }
        });
        foodCons += city.population * 0.1;
      }
    });

    setResourceProduction({
      gold: goldProd + (resourcesIncome?.gold || 0),
      wood: woodProd,
      food: foodProd,
      oil: oilProd,
      metal: metalProd,
      steel: steelProd,
      weapons: weaponsProd,
      influence: influenceProd
    });

    setFoodConsumption(foodCons);
  }, [cities, gameState, resourcesIncome]);

  const resources = [
    { icon: <span className="w-5 h-5 flex items-center justify-center">💰</span>, value: Math.floor(gameState.resources.gold), name: 'Gold', production: resourceProduction.gold, key: 'gold' },
    { icon: <span className="w-5 h-5 flex items-center justify-center">🌲</span>, value: Math.floor(gameState.resources.wood), name: 'Wood', production: resourceProduction.wood, key: 'wood' },
    { icon: <span className="w-5 h-5 flex items-center justify-center">🌾</span>, value: Math.floor(gameState.resources.food), name: 'Food', production: resourceProduction.food, consumption: foodConsumption, netProduction: resourceProduction.food - foodConsumption, key: 'food' },
    { icon: <span className="w-5 h-5 flex items-center justify-center">💧</span>, value: Math.floor(gameState.resources.oil), name: 'Oil', production: resourceProduction.oil, key: 'oil' },
    { icon: <span className="w-5 h-5 flex items-center justify-center">⚙️</span>, value: Math.floor(gameState.resources.metal), name: 'Metal', production: resourceProduction.metal, key: 'metal' },
    { icon: <span className="w-5 h-5 flex items-center justify-center">🔩</span>, value: Math.floor(gameState.resources.steel), name: 'Steel', production: resourceProduction.steel, key: 'steel' },
    { icon: <span className="w-5 h-5 flex items-center justify-center">🔫</span>, value: Math.floor(gameState.resources.weapons), name: 'Weapons', production: resourceProduction.weapons, key: 'weapons' },
    { icon: <Globe className="w-5 h-5" />, value: Math.floor(gameState.resources.influence || 0), name: 'Influence', production: resourceProduction.influence, key: 'influence' }
  ];

  const getProductionColor = (production) => (production >= 0 ? 'text-green-500' : 'text-red-500');
  const formatProduction = (production) => `${production >= 0 ? '+' : ''}${Math.round(production * 10) / 10}`;

  const renderTooltipContent = (resourceKey) => {
    let tooltipContent = <p>No data available.</p>;
    if (resourceKey === 'food') {
      tooltipContent = <>
        <p>Производство: +{resourceProduction.food.toFixed(1)}</p>
        <p>Потребление: -{foodConsumption.toFixed(1)}</p>
        <p>Итого: {(resourceProduction.food - foodConsumption).toFixed(1)}</p>
      </>;
    }
    return tooltipContent;
  };


  // Function to generate tooltip content
  const generateTooltip = (resourceType: string) => {
    const tooltipItems = [];

    // Функция проверки доступности рабочих для города
    const checkWorkersAvailability = (city: any) => {
      const totalBuildingsCount = city.buildings?.length || 0;
      const availableWorkers = (city.population || 0) - totalBuildingsCount;
      const hasWorkers = availableWorkers >= 0;
      return {
        hasWorkers,
        availableWorkers,
        totalBuildingsCount
      };
    };

    // Add tax income for gold
    if (resourceType === 'gold') {
      // Если есть доход от налогов
      const taxIncome = cities.reduce((sum, city) => {
        if (city.owner === 'player') {
          const taxRate = city.taxRate || 0.1; // Стандартная ставка налога если не указана
          return sum + ((city.population * taxRate) / 5);
        }
        return sum;
      }, 0);

      tooltipItems.push(
        <div key="taxes" className="whitespace-nowrap">
          Налоги: <span className={getProductionColor(taxIncome)}>
            {formatProduction(taxIncome)}/с
          </span>
          {cities.filter(c => c.owner === 'player').map(city => {
            const { hasWorkers } = checkWorkersAvailability(city);
            return (
              <div key={`tax-${city.id}`} className="text-xs ml-4">
                {city.name}: 
                <span className={hasWorkers ? "text-green-500" : "text-yellow-500"}>
                  +{((city.population * city.taxRate) / 5).toFixed(1)}/с
                </span>
                {!hasWorkers && <span className="text-yellow-500"> (Не хватает рабочих)</span>}
              </div>
            );
          })}
        </div>
      );
    }

    // Add influence production sources
    if (resourceType === 'influence' && resourcesIncome?.influence) {
      tooltipItems.push(
        <div key="influence-base" className="whitespace-nowrap">
          Базовое производство: <span className={getProductionColor(resourcesIncome.influence)}>
            {formatProduction(resourcesIncome.influence)}/с
          </span>
          {cities.filter(c => c.owner === 'player').map(city => (
            <div key={`influence-${city.id}`} className="text-xs ml-4">
              {city.name}: <span className="text-green-500">
                +{(city.population * 0.1).toFixed(1)}/с
                {city.satisfaction && city.satisfaction > 70 ? 
                  ` +${((city.satisfaction - 70) * 0.05).toFixed(1)}/с (бонус удовлетворенности)` : 
                  ''}
              </span>
            </div>
          ))}
        </div>
      );
    }

    // Group buildings by type and city, and calculate total production
    const buildingProduction = {};

    cities.forEach(city => {
      if (city.owner === 'player') {
        // Count buildings by type in each city
        const cityBuildingCounts = {};

        city.buildings.forEach(buildingId => {
          const building = BUILDINGS.find(b => b.id === buildingId);
          if (building && building.resourceProduction && building.resourceProduction.type === resourceType) {
            // Проверяем доступность рабочих для этого здания
            const requiredWorkers = building.workers || 0;
            const allocatedWorkers = Math.min(requiredWorkers, city.population || 0);
            const hasWorkers = requiredWorkers > 0 ? allocatedWorkers > 0 : true;
            const efficiency = requiredWorkers > 0 ? (allocatedWorkers / requiredWorkers) * 100 : 100;

            // Добавляем информацию о здании в тултип с данными о рабочих
            buildingProduction[city.name] = buildingProduction[city.name] || [];
            buildingProduction[city.name].push({
              buildingName: building.name,
              production: building.resourceProduction.amount,
              requiredWorkers,
              allocatedWorkers,
              efficiency,
              hasWorkers
            });
          }
        });

        // Add entries for each building type in the city
        tooltipItems.push(
          <div key={`tooltip-city-${city.id}`} className="mt-1">
            <div className="font-semibold">{city.name}:</div>
            {Object.entries(buildingProduction[city.name] || []).map(([buildingId, info]: [string, any]) => {
              const actualProduction = info.hasWorkers ? info.production : 0;
              return (
                <div key={`${city.id}-${buildingId}`} className="ml-2">
                  {info.buildingName} : <span className={getProductionColor(actualProduction)}>
                    {info.hasWorkers ? `+${(info.production).toFixed(1)}/с (${info.allocatedWorkers}/${info.requiredWorkers}, ${info.efficiency.toFixed(0)}%)` : '+0.0/с (Нет рабочих)'}
                  </span>
                </div>
              );
            })}
          </div>
        );
      }
    });

    // Add consumption for food
    if (resourceType === 'food' && gameState.population > 0) {
      tooltipItems.push(
        <div key="food-consumption" className="whitespace-nowrap">
          Population: <span className="text-red-500">-{(gameState.population * 0.1).toFixed(1)}/s</span>
        </div>
      );
    }

    return tooltipItems.length ? (
      <div className="absolute top-full left-0 bg-black/80 text-white p-2 rounded text-xs z-50">
        {tooltipItems}
      </div>
    ) : null;
  };

  // Обновляем данные каждые 250мс для более плавного отображения
  useEffect(() => {
    const interval = setInterval(() => {
      let goldProd = 0;
      let woodProd = 0;
      let foodProd = 0;
      let oilProd = 0;
      let metalProd = 0;
      let steelProd = 0;
      let weaponsProd = 0;
      let foodCons = 0;
      let influenceProd = 0;
      let taxIncome = 0;


      if (resourcesIncome && resourcesIncome.gold) {
        taxIncome = resourcesIncome.gold;
      }

      cities.forEach(city => {
        if (city.owner === 'player') {
          city.buildings.forEach(buildingId => {
            const building = BUILDINGS.find(b => b.id === buildingId);
            if (building && building.resourceProduction) {
              // Проверяем доступность рабочих и их количество
              const totalWorkers = city.population || 0;
              const requiredWorkers = (building.workers || 0);
              const allocatedWorkers = Math.min(requiredWorkers, totalWorkers);
              const hasWorkers = requiredWorkers > 0 ? allocatedWorkers > 0 : true;
              const { type, amount } = building.resourceProduction;

              // Расчет производства с учетом доступных рабочих и их количества
              let adjustedAmount = 0;

              if (hasWorkers) {
                // Для фермы учитываем соотношение рабочих
                if (building.id === 'farm') {
                  // Рассчитываем коэффициент на основе количества доступных рабочих
                  // Максимальное количество рабочих для фермы = 10 (из конфига)
                  const workerRatio = Math.min(totalWorkers / 10, 1);
                  adjustedAmount = amount * workerRatio;
                } else {
                  // Для других зданий просто проверяем наличие рабочих
                  adjustedAmount = amount;
                }
              }

              switch (type) {
                case 'gold':
                  goldProd += adjustedAmount;
                  break;
                case 'wood':
                  woodProd += adjustedAmount;
                  break;
                case 'food':
                  foodProd += adjustedAmount;
                  break;
                case 'oil':
                  oilProd += adjustedAmount;
                  break;
                case 'metal':
                  metalProd += adjustedAmount;
                  break;
                case 'steel':
                  steelProd += adjustedAmount;
                  break;
                case 'weapons':
                  weaponsProd += adjustedAmount;
                  break;
                case 'influence':
                  influenceProd += adjustedAmount;
                  break;
              }
            }
          });
          foodCons += city.population * 0.1;
        }
      });

      setResourceProduction({
        gold: goldProd, // Теперь налоги уже включены в goldProd выше
        wood: woodProd,
        food: foodProd,
        oil: oilProd,
        metal: metalProd,
        steel: steelProd,
        weapons: weaponsProd,
        influence: influenceProd
      });

      setFoodConsumption(foodCons);
    }, 50); // Уменьшаем интервал для более быстрого обновления

    return () => clearInterval(interval);
  }, [cities, gameState, resourcesIncome]);

  return (
    <Card className="fixed top-4 left-4 p-4 z-[1000]">
      <div className="flex flex-wrap gap-4">
        {resources.map((resource) => {
          // Для еды применяем специальную логику отображения
          let totalProduction;
          if (resource.key === 'food') {
            // Чистый прирост еды (производство минус потребление)
            totalProduction = resource.production - resource.consumption;
          } else {
            // Для других ресурсов - базовое производство плюс доход из других источников
            totalProduction = resource.production + (
              resourcesIncome && resourcesIncome[resource.key] ? resourcesIncome[resource.key] : 0
            );
          }

          return (
            <div key={resource.name} className="flex items-center gap-2 relative group">
              {resource.icon}
              <span className="font-medium">
                {resource.value}
                <span className={`ml-1 text-xs ${getProductionColor(totalProduction)}`}>
                  ({formatProduction(totalProduction)})
                </span>
              </span>

              {/* Tooltip that appears on hover */}
              <div className="hidden group-hover:block absolute bg-black bg-opacity-80 text-white p-2 rounded z-50 left-full ml-2 whitespace-nowrap">
                {generateTooltip(resource.key)}
              </div>
            </div>
          );
        })}
        <div className="border-l pl-4">
          <div className="flex items-center gap-2">
            <span>👥</span>
            <span className="font-medium">
              {Math.floor(gameState.population)}
              {gameState.resources.food <= 0 ? <span className="ml-1 text-xs text-red-500">(-1)</span> : ''}
            </span>
          </div>
        </div>

        {cities.filter(city => city.owner === 'player').map(city => (
          <div key={`satisfaction-${city.id}`} className="border-l pl-4 relative group">
            <div className="flex items-center gap-2">
              <span>{city.satisfaction >= 70 ? '😃' : city.satisfaction >= 30 ? '😐' : '😠'}</span>
              <span className="font-medium">
                {city.name.split(' ')[0]}: {Math.floor(city.satisfaction || 0)}%
                {city.protestTimer ? <span className="ml-1 text-xs text-red-500">(⚠️ {Math.floor(city.protestTimer)}s)</span> : ''}
              </span>
            </div>

            {/* Тултип для удовлетворенности */}
            <div className="hidden group-hover:block absolute top-full left-0 bg-black/80 text-white p-2 rounded text-xs z-50 w-64">
              <div className="font-bold mb-1">Факторы удовлетворенности:</div>
              {getSatisfactionFactors(city).map((factor, idx) => (
                <div key={`factor-${idx}`} className="flex justify-between items-center my-1">
                  <span>{factor.name}:</span>
                  <span className={`${factor.isPositive ? 'text-green-400' : factor.isWarning ? 'text-yellow-400' : 'text-red-400'}`}>
                    {factor.impact}
                  </span>
                </div>
              ))}
              {getSatisfactionFactors(city).length === 0 && (
                <div className="text-gray-300">Нет активных факторов</div>
              )}
            </div>
          </div>
        ))}
        <div className="border-l pl-4">
          <div className="flex items-center gap-2">
            <span>⚔️</span>
            <span className="font-medium">{Math.floor(gameState.military)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function getResourceIcon(type: string): string {
  const icons: { [key: string]: string } = {
    food: '🍞',
    gold: '💰',
    wood: '🪵',
    oil: '🛢️',
    influence: '🌐',
    weapons: '🔫',
    metal: '🔧',
    steel: '⚒️'
  };
  return icons[type] || '❓';
}