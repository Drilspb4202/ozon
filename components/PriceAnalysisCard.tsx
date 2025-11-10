import React from 'react';
import { PriceAnalysis } from '../types';
import PriceTagIcon from './icons/PriceTagIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import LightBulbIcon from './icons/LightBulbIcon';

interface PriceAnalysisCardProps {
  analysis: PriceAnalysis;
}

const PriceAnalysisCard: React.FC<PriceAnalysisCardProps> = ({ analysis }) => {
  return (
    <div className="bg-gray-700/50 rounded-2xl p-6 border border-gray-600/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg flex items-center gap-4">
                <PriceTagIcon className="w-8 h-8 text-green-400 flex-shrink-0" />
                <div>
                    <p className="text-sm text-gray-400">Средняя цена</p>
                    <p className="text-xl font-bold text-white">{analysis.averagePrice}</p>
                </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg flex items-center gap-4">
                <ChartBarIcon className="w-8 h-8 text-blue-400 flex-shrink-0" />
                <div>
                    <p className="text-sm text-gray-400">Ценовой диапазон</p>
                    <p className="text-xl font-bold text-white">{analysis.priceRange}</p>
                </div>
            </div>
        </div>
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-yellow-300 mb-1">Анализ рентабельности</h4>
                <p className="text-sm text-gray-300">{analysis.profitabilityAnalysis}</p>
            </div>
             <div className="bg-green-900/50 p-4 rounded-lg flex items-start gap-3">
                <LightBulbIcon className="w-6 h-6 text-green-300 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-green-300 mb-1">Рекомендация</h4>
                    <p className="text-sm text-white font-medium">{analysis.recommendation}</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PriceAnalysisCard;
