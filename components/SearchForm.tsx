import React, { useState, useEffect, useRef } from 'react';
import { Marketplace, ImageStyle } from '../types';
import UploadIcon from './icons/UploadIcon';
import TrashIcon from './icons/TrashIcon';

export interface GeneratePayload {
  productQuery: string;
  description?: string;
  features?: string[];
  marketplace: Marketplace;
  style: ImageStyle;
  uploadedImage?: string | null;
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
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (initialData) {
      setProductQuery(initialData.title);
      setDescription(initialData.description);
      setFeatures(initialData.features.join('\n'));
      setMode('generate');
      setUploadedImage(null);
    }
  }, [initialData]);

  const clearGenerateForm = () => {
      setProductQuery('');
      setDescription('');
      setFeatures('');
      setUploadedImage(null);
  }

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    if(newMode === 'analyze') {
        clearGenerateForm();
    } else {
        setProductUrl('');
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (mode === 'generate' && productQuery.trim()) {
      onGenerate({
        productQuery, 
        description: description.trim(),
        features: features.trim() ? features.split('\n').filter(f => f.trim() !== '') : [],
        marketplace, 
        style: imageStyle,
        uploadedImage,
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
             {mode === 'generate' ? 'Опишите товар, загрузите фото или клонируйте существующий для редактирования, и AI создаст для вас идеальное предложение.' : 'Вставьте ссылку на товар, и AI проведет полный аудит карточки и ее конкурентов.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'generate' ? (
                <div className="space-y-4">
                    {/* Image Upload Section */}
                    <div>
                         <label className="block text-sm font-medium text-gray-300 mb-2">
                            Фотография товара (опционально)
                        </label>
                        {uploadedImage ? (
                            <div className="relative group">
                                <img src={uploadedImage} alt="Превью товара" className="w-full h-48 object-contain rounded-lg bg-gray-700 p-2 border border-gray-600" />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    title="Удалить изображение"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                             <div 
                                className="relative block w-full h-32 border-2 border-gray-600 border-dashed rounded-lg p-4 text-center hover:border-cyan-500 transition-colors duration-200 cursor-pointer flex flex-col justify-center items-center"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadIcon className="mx-auto h-8 w-8 text-gray-500"/>
                                <span className="mt-2 block text-sm font-semibold text-gray-400">
                                    Перетащите или нажмите для загрузки
                                </span>
                                 <span className="block text-xs text-gray-500">
                                    PNG, JPG, WEBP (рекомендуется 1:1)
                                </span>
                                <input
                                    ref={fileInputRef}
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleFileChange}
                                    disabled={isLoading}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="productQuery" className="block text-sm font-medium text-gray-300 mb-2">
                           {uploadedImage ? 'Уточните название товара' : 'Название товара'}
                        </label>
                        <input
                            id="productQuery"
                            type="text"
                            value={productQuery}
                            onChange={(e) => setProductQuery(e.target.value)}
                            placeholder={uploadedImage ? "например, 'мужская кожаная куртка'" : "например, 'беспроводные наушники с шумоподавлением'"}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
                            disabled={isLoading}
                        />
                         {uploadedImage && <p className="text-xs text-gray-500 mt-1">AI проанализирует фото, а это название поможет ему лучше понять контекст и найти конкурентов.</p>}
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                            Описание (опционально)
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={uploadedImage ? "Добавьте детали, которые AI должен учесть при создании описания по фото." : "Оставьте пустым для генерации AI или введите свой текст для редактирования."}
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
                             placeholder={uploadedImage ? "Добавьте преимущества, которые AI должен учесть при создании списка по фото." : "Оставьте пустым для генерации AI или введите свой список для редактирования."}
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

            {mode === 'generate' && !uploadedImage && (
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
                     mode === 'generate' ? (uploadedImage ? 'Создать по фото' : 'Сгенерировать') : 'Проанализировать'
                )}
            </button>
        </form>
    </div>
  );
};

export default SearchForm;
