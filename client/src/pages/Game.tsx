import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Map } from '@/components/Map';
import { ResourcePanel } from '@/components/ResourcePanel';
import { CityPanel } from '@/components/CityPanel';
import { useGameStore } from '@/lib/store';
import type { City, GameState } from '@shared/schema';
import { BUILDINGS } from '@/lib/game';
import { AlliancePanel } from "@/components/Alliance/AlliancePanel";

const MarketButton = ({ onOpenMarket }) => (
  <button 
    onClick={onOpenMarket}
    className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg z-[1000] flex items-center space-x-2"
  >
    <span>💰</span>
    <span>Открыть рынок</span>
  </button>
);

// Импортируем компоненты для рынка заранее
import { MarketCreateListing } from '@/components/Market/MarketCreateListing';
import { MarketPriceChart } from '@/components/Market/MarketPriceChart';
import { MarketPriceChartSelector } from '@/components/Market/MarketPriceChartSelector';
import { MarketListings } from '@/components/Market/MarketListings';
import { MarketTransactions } from '@/components/Market/MarketTransactions';
import { MarketPanel } from "@/components/Market/MarketPanel";-1 md:grid-cols-2 gap-6">
          {/* Левая панель - создание лота */}
          <div className="md:col-span-1">
            <MarketCreateListing onSuccess={handleListingCreated} />
          </div>

          {/* Средняя панель - графики цен */}
          <div className="md:col-span-1">
            <MarketPriceChartSelector onResourceSelect={setSelectedResource} excludeResource="gold"/> {/* Передаем функцию для установки выбранного ресурса */}
          </div>
        </div>

        {/* Нижняя панель - список лотов */}
        <div className="mt-6">
          <MarketListings selectedResource={selectedResource} onListingPurchased={() => fetchGameState()} /> {/* Передаем выбранный ресурс в компонент списка лотов */}
        </div>
      </div>
    </div>
  );
};

const GameButtons = ({ onOpenMarket, onOpenAlliance }) => (
  <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-[1000]">
    <button onClick={onOpenAlliance} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg">Альянсы</button>
    <button onClick={onOpenMarket} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg flex items-center space-x-2">
      <span>💰</span>
      <span>Открыть рынок</span>
    </button>
  </div>
);


export default function Game() {
  const { setCities, setGameState } = useGameStore();
  const queryClient = useQueryClient();
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [isAllianceOpen, setIsAllianceOpen] = useState(false); // Add state for alliance panel

  const { data: cities } = useQuery<City[]>({
    queryKey: ['/api/cities']
  });

  const { data: gameState } = useQuery<GameState>({
    queryKey: ['/api/game-state']
  });

  useEffect(() => {
    if (cities) {
      console.log('Cities updated:', cities);
      setCities(cities);
    }
  }, [cities, setCities]);

  useEffect(() => {
    if (gameState) {
      console.log('Game statete updated:', gameState);
      setGameState(gameState);
    }
  }, [gameState, setGameState]);

  useEffect(() => {
    // Делаем BUILDINGS доступными глобально
    window.BUILDINGS = BUILDINGS;

    // Инициализация WebSocket соединения
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'GAME_UPDATE' && message.gameState) {
          console.log('Received game state update:', message.gameState);
          setGameState(message.gameState);
        }

        if (message.type === 'CITIES_UPDATE' && message.cities) {
          console.log('Received cities update:', message.cities);
          setCities(message.cities);
        }

        if (message.type === 'CITY_UPDATE') {
          queryClient.invalidateQueries({ queryKey: ['/api/cities'] });
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [queryClient]);

  const { selectedCity } = useGameStore();

  return (
    <div className="relative h-screen">
      <Map />
      <ResourcePanel />
      {selectedCity && <CityPanel />}
      <GameButtons 
        onOpenMarket={() => setIsMarketOpen(true)} 
        onOpenAlliance={() => setIsAllianceOpen(true)} 
      />
      <MarketPanel open={isMarketOpen} onClose={() => setIsMarketOpen(false)} />
      <AlliancePanel open={isAllianceOpen} onClose={() => setIsAllianceOpen(false)} />
    </div>
  );
}