
import React, { useState } from 'react';
import { Alliance, AllianceAccessType, AllianceGoal } from '@shared/allianceTypes';
import { useGameStore } from '@/lib/store';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/components/ui/use-toast';

interface AlliancePanelProps {
  open: boolean;
  onClose: () => void;
}

export function AlliancePanel({ open, onClose }: AlliancePanelProps) {
  const [tab, setTab] = useState<'list' | 'create'>('list');
  const [name, setName] = useState('');
  const [accessType, setAccessType] = useState<AllianceAccessType>('open');
  const [goal, setGoal] = useState<AllianceGoal>('economy');
  const { toast } = useToast();
  const gameState = useGameStore(state => state.gameState);

  if (!open) return null;

  const handleCreate = async () => {
    try {
      if (name.length < 3 || name.length > 20) {
        toast({ title: "Ошибка", description: "Название должно быть от 3 до 20 символов" });
        return;
      }

      if (!gameState?.resources?.gold || gameState.resources.gold < 1000 || 
          !gameState?.resources?.steel || gameState.resources.steel < 500) {
        toast({ 
          title: "Недостаточно ресурсов",
          description: "Требуется: 1000 золота и 500 стали"
        });
        return;
      }

      await apiRequest('POST', '/api/alliances', { name, accessType, goal });
      toast({ title: "Успех", description: "Альянс создан!" });
      setTab('list');
    } catch (error) {
      toast({ 
        title: "Ошибка", 
        description: error instanceof Error ? error.message : "Не удалось создать альянс" 
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg p-6 w-3/4 max-w-5xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Альянсы</h1>
          <button 
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
          >
            Закрыть
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('list')}
            className={`px-4 py-2 rounded ${tab === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Список альянсов
          </button>
          <button
            onClick={() => setTab('create')}
            className={`px-4 py-2 rounded ${tab === 'create' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Создать альянс
          </button>
        </div>

        {tab === 'create' ? (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Название альянса</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                maxLength={20}
              />
            </div>
            <div>
              <label className="block mb-2">Тип доступа</label>
              <select 
                value={accessType}
                onChange={(e) => setAccessType(e.target.value as AllianceAccessType)}
                className="w-full p-2 border rounded"
              >
                <option value="open">Открытый</option>
                <option value="closed">Закрытый</option>
                <option value="approval">По одобрению</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">Цель</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as AllianceGoal)}
                className="w-full p-2 border rounded"
              >
                <option value="economy">Экономика</option>
                <option value="warfare">Война</option>
                <option value="technology">Технологии</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Стоимость создания: 1000 золота + 500 стали
            </div>
            <button
              onClick={handleCreate}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
            >
              Создать альянс
            </button>
          </div>
        ) : (
          <div className="h-96 overflow-y-auto">
            <div className="text-center py-4 text-gray-500">
              Загрузка списка альянсов...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
