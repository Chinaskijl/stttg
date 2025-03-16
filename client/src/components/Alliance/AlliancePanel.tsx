
import React from 'react';

interface AlliancePanelProps {
  open: boolean;
  onClose: () => void;
}

export function AlliancePanel({ open, onClose }: AlliancePanelProps) {
  if (!open) return null;

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
        <div className="text-center py-8">
          Функционал альянсов находится в разработке
        </div>
      </div>
    </div>
  );
}
