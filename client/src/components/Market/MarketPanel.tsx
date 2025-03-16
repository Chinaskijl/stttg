
import React from 'react';
import { MarketCreateListing } from './MarketCreateListing';
import { MarketPriceChartSelector } from './MarketPriceChartSelector';
import { MarketListings } from './MarketListings';
import { useState } from 'react';

interface MarketPanelProps {
  open: boolean;
  onClose: () => void;
}

export function MarketPanel({ open, onClose }: MarketPanelProps) {
  const [selectedResource, setSelectedResource] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg p-6 w-3/4 max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Рынок ресурсов</h1>
          <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg">
            Закрыть
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-1">
            <MarketCreateListing onSuccess={() => console.log('Лот создан')} />
          </div>

          <div className="md:col-span-1">
            <MarketPriceChartSelector onResourceSelect={setSelectedResource} excludeResource="gold" />
          </div>
        </div>

        <div className="mt-6">
          <MarketListings selectedResource={selectedResource} onListingPurchased={() => window.location.reload()} />
        </div>
      </div>
    </div>
  );
}
