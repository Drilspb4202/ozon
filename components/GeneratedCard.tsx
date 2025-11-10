import React, { useState } from 'react';
import { GeneratedProduct, CardAnalysis, ImageStyle } from '../types';
import ClipboardIcon from './icons/ClipboardIcon';
import CheckIcon from './icons/CheckIcon';
import SeoIcon from './icons/SeoIcon';
import RocketIcon from './icons/RocketIcon';
import StarIcon from './icons/StarIcon';
import SparklesIcon from './icons/SparklesIcon';
import FilmIcon from './icons/FilmIcon';
import NeonIcon from './icons/NeonIcon';
import BWIcon from './icons/BWIcon';
import CinematicIcon from './icons/CinematicIcon';
import CloneIcon from './icons/CloneIcon';


interface GeneratedCardProps {
  product: GeneratedProduct;
  analysis: CardAnalysis | null;
  onRegenerateImage: (style: ImageStyle) => void;
  isImageLoading: boolean;
  onEditImage: (prompt: string) => void;
  isEditingImage: boolean;
  onGenerateInfographic: () => void;
  isGeneratingInfographic: boolean;
  onClone: (product: GeneratedProduct) => void;
}

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1.5 bg-gray-700/50 rounded-md text-gray-400 hover:text-white hover:bg-gray-600 transition-all duration-200"
            title="Копировать"
        >
            {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
        </button>
    );
};

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 10) * circumference;
    const color = score >= 8 ? 'text-green-400' : score >= 5 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="relative w-28 h-28">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-gray-600" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                <circle
                    className={color}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                />
            </svg>
            <div className={`absolute inset-0 flex flex-col items-center justify-center font-bold ${color}`}>
                <span className="text-4xl">{score}</span>
                <span className="text-sm">/ 10</span>
            </div>
        </div>
    );
};

const RadarChart: React.FC<{ data: { label: string; score: number }[] }> = ({ data }) => {
    const size = 200;
    const center = size / 2;
    const maxScore = 10;
    const numLevels = 5;
    const angleSlice = (Math.PI * 2) / data.length;

    const getPoint = (score: number, index: number) => {
        const radius = (center * 0.8 * score) / maxScore;
        const angle = angleSlice * index - Math.PI / 2;
        return {
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle),
        };
    };

    const gridLevels = Array.from({ length: numLevels }, (_, i) => {
        const score = (maxScore / numLevels) * (i + 1);
        const points = data.map((_, index) => getPoint(score, index));
        return <polygon key={i} points={points.map(p => `${p.x},${p.y}`).join(' ')} className="stroke-gray-600 fill-none" strokeWidth="1" />;
    });

    const axes = data.map((_, i) => {
        const endPoint = getPoint(maxScore, i);
        return <line key={i} x1={center} y1={center} x2={endPoint.x} y2={endPoint.y} className="stroke-gray-600" strokeWidth="1" />;
    });

    const dataPoints = data.map((d, i) => getPoint(d.score, i));
    const dataPolygon = <polygon points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')} className="stroke-purple-400 fill-purple-400/30" strokeWidth="2" />;

    const labels = data.map((d, i) => {
        const labelPoint = getPoint(maxScore * 1.18, i);
        const textAnchor = labelPoint.x > center + 5 ? 'start' : labelPoint.x < center - 5 ? 'end' : 'middle';
        return (
            <text key={i} x={labelPoint.x} y={labelPoint.y} textAnchor={textAnchor} dy="0.35em" className="fill-gray-300 text-xs font-semibold">
                {d.label}
            </text>
        );
    });
    
    const dataCircles = dataPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" className="fill-purple-300" />);

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {gridLevels}
            {axes}
            {dataPolygon}
            {labels}
            {dataCircles}
        </svg>
    );
};


const CardAnalytics: React.FC<{ analysis: CardAnalysis }> = ({ analysis }) => {
    const radarData = [
        { label: 'SEO', score: analysis.seoScore },
        { label: 'Продажи', score: analysis.sellingScore },
        { label: 'Уникальность', score: analysis.uniquenessScore },
    ];

    const metricDetails = [
        {
            icon: <SeoIcon className="w-6 h-6 text-blue-400" />,
            bgColor: 'bg-blue-500/10',
            textColor: 'text-blue-300',
            title: 'SEO-Сила',
            description: analysis.seoStrength,
            score: analysis.seoScore,
        },
        {
            icon: <RocketIcon className="w-6 h-6 text-red-400" />,
            bgColor: 'bg-red-500/10',
            textColor: 'text-red-300',
            title: 'Продающий Потенциал',
            description: analysis.sellingPower,
            score: analysis.sellingScore,
        },
        {
            icon: <StarIcon className="w-6 h-6 text-purple-400" />,
            bgColor: 'bg-purple-500/10',
            textColor: 'text-purple-300',
            title: 'Уникальность',
            description: analysis.uniqueness,
            score: analysis.uniquenessScore,
        },
    ];
    return (
        <div className="mt-10 p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
            <h3 className="text-xl font-bold text-center mb-6 text-yellow-300">Экспертный Анализ Карточки</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="flex flex-col items-center justify-center">
                    <RadarChart data={radarData} />
                </div>
                <div className="flex flex-col items-center">
                     <ScoreCircle score={analysis.overallScore} />
                     <p className="text-center text-sm mt-2 text-gray-400 max-w-[150px]">{analysis.justification}</p>
                </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-700 space-y-4">
                 {metricDetails.map((metric, index) => (
                    <div key={index} className="flex items-start gap-4">
                        <div className={`p-2 ${metric.bgColor} rounded-full flex-shrink-0`}>{metric.icon}</div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <h4 className={`font-semibold ${metric.textColor}`}>{metric.title}</h4>
                                <span className={`font-bold text-lg ${metric.textColor}`}>{metric.score}<span className="text-sm font-normal text-gray-500">/10</span></span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{metric.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
};

const ImageStyleRegenerator: React.FC<{ onRegenerate: (style: ImageStyle) => void; isLoading: boolean; }> = ({ onRegenerate, isLoading }) => {
    const styles = [
      { key: ImageStyle.Standard, color: 'bg-blue-600 hover:bg-blue-700' },
      { key: ImageStyle.Lifestyle, color: 'bg-teal-600 hover:bg-teal-700' },
      { key: ImageStyle.Vibrant, color: 'bg-pink-600 hover:bg-pink-700' },
      { key: ImageStyle.Dramatic, color: 'bg-indigo-600 hover:bg-indigo-700' },
      { key: ImageStyle.Minimalism, color: 'bg-gray-500 hover:bg-gray-600' },
    ];
    return (
        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-semibold text-center text-gray-300 mb-3">Перегенерировать в стиле:</h4>
            <div className="grid grid-cols-3 gap-2">
                {styles.map(style => (
                    <button key={style.key} onClick={() => onRegenerate(style.key)} disabled={isLoading} className={`px-3 py-2 text-xs font-bold text-white rounded-md transition-colors duration-200 ${style.color} disabled:bg-gray-700 disabled:cursor-wait`}>
                        {style.key}
                    </button>
                ))}
            </div>
        </div>
    );
};

const ImageEditingSuite: React.FC<{ onEdit: (prompt: string) => void; isLoading: boolean; }> = ({ onEdit, isLoading }) => {
    const [customPrompt, setCustomPrompt] = useState('');

    const quickFilters = [
        { 
            name: 'Винтаж', 
            prompt: 'Примени к изображению эффект винтажной пленки: выцветшие цвета, легкая зернистость и теплые тона.',
            icon: <FilmIcon className="w-5 h-5" />,
            color: 'bg-amber-600 hover:bg-amber-700'
        },
        { 
            name: 'Неон', 
            prompt: 'Добавь футуристический эффект неонового свечения по контурам товара, используя яркие розовые и голубые цвета.',
            icon: <NeonIcon className="w-5 h-5" />,
            color: 'bg-pink-600 hover:bg-pink-700'
        },
        { 
            name: 'Ч/Б', 
            prompt: 'Преобразуй изображение в высококонтрастную, драматичную черно-белую фотографию.',
            icon: <BWIcon className="w-5 h-5" />,
            color: 'bg-gray-500 hover:bg-gray-600'
        },
        { 
            name: 'Кино', 
            prompt: 'Придай изображению кинематографический вид с цветокоррекцией в стиле "teal and orange", легким леттербоксингом и атмосферным настроением.',
            icon: <CinematicIcon className="w-5 h-5" />,
            color: 'bg-sky-600 hover:bg-sky-700'
        },
    ];

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customPrompt.trim()) {
            onEdit(customPrompt);
            setCustomPrompt('');
        }
    };

    return (
        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-semibold text-center text-gray-300 mb-3">Креативная обработка</h4>
            <div className="grid grid-cols-2 gap-2 mb-4">
                {quickFilters.map(filter => (
                    <button 
                        key={filter.name} 
                        onClick={() => onEdit(filter.prompt)} 
                        disabled={isLoading}
                        className={`px-3 py-2 text-xs font-bold text-white rounded-md transition-colors duration-200 flex items-center justify-center gap-2 ${filter.color} disabled:bg-gray-700 disabled:cursor-wait`}
                    >
                        {filter.icon}
                        <span>{filter.name}</span>
                    </button>
                ))}
            </div>
            <form onSubmit={handleCustomSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Или введите свой запрос..."
                    className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !customPrompt.trim()}
                    className="px-4 py-2 text-xs font-bold text-white bg-green-600 rounded-md transition-colors duration-200 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-wait flex items-center justify-center"
                >
                    {isLoading && !customPrompt ? (
                        '...'
                    ) : isLoading && customPrompt ? (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                       'Применить'
                    )}
                </button>
            </form>
        </div>
    );
};


const InfographicGenerator: React.FC<{ onGenerate: () => void; isLoading: boolean; }> = ({ onGenerate, isLoading }) => {
    return (
        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-semibold text-center text-gray-300 mb-3">Улучшить карточку</h4>
            <button
                onClick={onGenerate}
                disabled={isLoading}
                className="w-full px-4 py-3 text-sm font-bold text-white bg-purple-600 rounded-md transition-colors duration-200 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-wait flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                     <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     <span>Создание...</span>
                    </>
                ) : (
                    <>
                        <SparklesIcon className="w-5 h-5" />
                        Создать инфографику
                    </>
                )}
            </button>
        </div>
    );
};

const GeneratedCard: React.FC<GeneratedCardProps> = ({ product, analysis, onRegenerateImage, isImageLoading, onEditImage, isEditingImage, onGenerateInfographic, isGeneratingInfographic, onClone }) => {
  const isAnyImageTaskRunning = isImageLoading || isEditingImage || isGeneratingInfographic;
  
  return (
    <>
    <div className="bg-gray-700/50 rounded-2xl overflow-hidden border border-gray-600/50">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
        <div className="md:col-span-2 p-4 flex flex-col">
          <div className="relative aspect-square bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
            {isAnyImageTaskRunning && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
                    <div className="w-12 h-12 border-4 border-white/50 border-t-white rounded-full animate-spin"></div>
                    <p className="text-sm mt-3">
                        {isGeneratingInfographic ? 'Создаем инфографику...' : isEditingImage ? 'Редактируем...' : 'Магия в процессе...'}
                    </p>
                </div>
            )}
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
            ) : (
                <div className="text-gray-500">Генерация изображения...</div>
            )}
          </div>
          <ImageStyleRegenerator onRegenerate={onRegenerateImage} isLoading={isAnyImageTaskRunning} />
          <ImageEditingSuite onEdit={onEditImage} isLoading={isAnyImageTaskRunning} />
          <InfographicGenerator onGenerate={onGenerateInfographic} isLoading={isAnyImageTaskRunning} />
        </div>

        <div className="md:col-span-3 p-6 flex flex-col">
          <div className="relative mb-4">
              <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-extrabold text-white pr-20">{product.title}</h3>
                  <div className="absolute top-0 right-0 flex items-center space-x-2">
                        <button
                            onClick={() => onClone(product)}
                            className="p-1.5 bg-gray-700/50 rounded-md text-gray-400 hover:text-white hover:bg-gray-600 transition-all duration-200"
                            title="Клонировать карточку для редактирования"
                        >
                            <CloneIcon className="w-5 h-5" />
                        </button>
                        <CopyButton textToCopy={product.title} />
                  </div>
              </div>
          </div>
          
          <div className="relative bg-gray-800/50 rounded-lg p-4 mb-6 prose prose-invert prose-sm max-w-none prose-p:text-gray-300 prose-ul:text-gray-300 flex-grow">
            <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br />') }} />
             <div className="absolute top-2 right-2">
                <CopyButton textToCopy={product.description} />
             </div>
          </div>

          <div className="relative">
            <h4 className="text-lg font-semibold text-green-300 mb-3">Ключевые преимущества</h4>
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                   <svg className="w-5 h-5 mr-3 mt-0.5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
             <div className="absolute top-0 right-0">
                <CopyButton textToCopy={product.features.join('\n')} />
            </div>
          </div>
        </div>
      </div>
    </div>
    {analysis && <CardAnalytics analysis={analysis} />}
    </>
  );
};

export default GeneratedCard;