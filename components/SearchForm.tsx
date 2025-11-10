import React, { useState, useEffect } from 'react';
import { Marketplace, ImageStyle } from '../types';

export interface GeneratePayload {
  productQuery: string;
  description?: string;
  features?: string[];
  marketplace: Marketplace;
  style: ImageStyle;
}
interface SearchFormProps {
  onGenerate: (payload: GeneratePayload) => void;
  onAnalyze: (productUrl: string, marketplace: Marketplace) => void;
  isLoading: boolean;
  initialData?: { title: string; description: string; features: string[] } | null;
}

type Mode = 'generate' | 'analyze';

const SearchForm: React.FC<SearchFormProps> = ({ onGenerate, onAnalyze, isLoading, initialData }) => {
  const [productQuery, setProductQuery] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [marketplace, setMarketplace] = useState<Marketplace>(Marketplace.Wildberries);
  const [imageStyle, setImageStyle] = useState<ImageStyle>(ImageStyle.Standard);
  const [mode, setMode] = useState<Mode>('generate');

  useEffect(() => {
    if (initialData) {
      setProductQuery(initialData.title);
      setDescription(initialData.description);
      setFeatures(initialData.features.join('\n'));
      setMode('generate');
    }
  }, [initialData]);

  const clearGenerateForm = () => {
      setProductQuery('');
      setDescription('');
      setFeatures('');
  }

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    if(newMode === 'analyze') {
        clearGenerateForm();
    } else {
        setProductUrl('');
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (mode === 'generate' && productQuery.trim()) {
      onGenerate({
        productQuery, 
        description: description.trim(),
        features: features.trim() ? features.split('\n').filter(f => f.trim() !== '') : [],
        marketplace, 
        style: imageStyle
      });
    } else if (mode === 'analyze' && productUrl.trim()) {
      onAnalyze(productUrl, marketplace);
    }
  };

  const isSubmitDisabled = isLoading || (mode === 'generate' && !productQuery.trim()) || (mode === 'analyze' && !productUrl.trim());

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex justify-center mb-6">
            <div className="bg-gray-700 p-1 rounded-lg flex space-x-1">
                 <button 
                    onClick={() => handleModeChange('generate')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${mode === 'generate' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                >
                    Создать новую
                </button>
                <button 
                    onClick={() => handleModeChange('analyze')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${mode === 'analyze' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                >
                    Анализ по ссылке
                </button>
            </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-2 text-center">
            {mode === 'generate' ? 'Создайте или отредактируйте карточку' : 'Проанализируйте карточку товара'}
        </h2>
        <p className="text-gray-400 mb-6 text-center text-sm max-w-md mx-auto">
             {mode === 'generate' ? 'Опишите товар или клонируйте существующий для редактирования, и AI создаст для вас идеальное предложение.' : 'Вставьте ссылку на товар, и AI проведет полный аудит карточки и ее конкурентов.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'generate' ? (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="productQuery" className="block text-sm font-medium text-gray-300 mb-2">
                            Название товара
                        </label>
                        <input
                            id="productQuery"
                            type="text"
                            value={productQuery}
                            onChange={(e) => setProductQuery(e.target.value)}
                            placeholder="например, 'беспроводные наушники с шумоподавлением'"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
                            disabled={isLoading}
                        />
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                            Описание (опционально, для редактирования)
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Оставьте пустым для генерации AI или введите свой текст для редактирования."
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200 h-24 resize-y"
                            disabled={isLoading}
                        />
                    </div>
                     <div>
                        <label htmlFor="features" className="block text-sm font-medium text-gray-300 mb-2">
                            Ключевые преимущества (опционально, каждое с новой строки)
                        </label>
                        <textarea
                            id="features"
                            value={features}
                            onChange={(e) => setFeatures(e.target.value)}
                            placeholder="Оставьте пустым для генерации AI или введите свой список для редактирования."
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200 h-24 resize-y"
                            disabled={isLoading}
                        />
                    </div>
                </div>
            ) : (
                 <div>
                    <label htmlFor="productUrl" className="block text-sm font-medium text-gray-300 mb-2">
                        Ссылка на товар
                    </label>
                    <input
                        id="productUrl"
                        type="text"
                        value={productUrl}
                        onChange={(e) => setProductUrl(e.target.value)}
                        placeholder="Вставьте ссылку на товар с Ozon или Wildberries"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
                        disabled={isLoading}
                    />
                </div>
            )}
            
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Выберите маркетплейс</label>
                <div className="flex space-x-4">
                    {(Object.keys(Marketplace) as Array<keyof typeof Marketplace>).map((key) => (
                        <button
                            type="button"
                            key={key}
                            onClick={() => setMarketplace(Marketplace[key])}
                            className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                                marketplace === Marketplace[key]
                                    ? 'bg-cyan-600 text-white shadow-md'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                            disabled={isLoading}
                        >
                            {Marketplace[key]}
                        </button>
                    ))}
                </div>
            </div>

            {mode === 'generate' && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Выберите стиль изображения</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {(Object.values(ImageStyle)).map((style) => (
                            <button
                                type="button"
                                key={style}
                                onClick={() => setImageStyle(style)}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                                    imageStyle === style
                                        ? 'bg-cyan-600 text-white shadow-md'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                                disabled={isLoading}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                </div>
            )}


            <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
                disabled={isSubmitDisabled}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {mode === 'generate' ? 'Генерация...' : 'Анализ...'}
                    </>
                ) : (
                     mode === 'generate' ? 'Сгенерировать' : 'Проанализировать'
                )}
            </button>
        </form>
    </div>
  );
};

export default SearchForm;