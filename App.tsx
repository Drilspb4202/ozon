import React, { useState, useCallback } from 'react';
import { analyzeCompetitors, generateProductCard, generateProductImage, analyzeGeneratedCard, editProductImage, generateInfographic, analyzeByUrl, analyzePricing, generateSoraPrompt, generateGroqPrompt, generateProductCardFromImage } from './services/geminiService';
import { CompetitorProduct, GeneratedProduct, Marketplace, CardAnalysis, ImageStyle, PriceAnalysis } from './types';
import Header from './components/Header';
import SearchForm, { GeneratePayload } from './components/SearchForm';
import Loader from './components/Loader';
import CompetitorCard from './components/CompetitorCard';
import GeneratedCard from './components/GeneratedCard';
import PriceAnalysisCard from './components/PriceAnalysisCard';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [isGeneratingInfographic, setIsGeneratingInfographic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorProduct[]>([]);
  const [generatedProduct, setGeneratedProduct] = useState<GeneratedProduct | null>(null);
  const [cardAnalysis, setCardAnalysis] = useState<CardAnalysis | null>(null);
  const [priceAnalysis, setPriceAnalysis] = useState<PriceAnalysis | null>(null);
  const [step, setStep] = useState<string>('Готовы к работе. Введите запрос, чтобы начать.');
  const [resultTitle, setResultTitle] = useState('');
  const [initialFormData, setInitialFormData] = useState<{ title: string; description: string; features: string[] } | null>(null);
  const [soraPrompt, setSoraPrompt] = useState<string | null>(null);
  const [groqPrompt, setGroqPrompt] = useState<string | null>(null);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);


  const clearState = () => {
    setError(null);
    setCompetitors([]);
    setGeneratedProduct(null);
    setCardAnalysis(null);
    setPriceAnalysis(null);
    setResultTitle('');
    setSoraPrompt(null);
    setGroqPrompt(null);
  };

  const handleGenerate = useCallback(async (payload: GeneratePayload) => {
    const { productQuery, description, features, marketplace, style, uploadedImage } = payload;
    setIsLoading(true);
    clearState();
    setInitialFormData(null);

    try {
      setStep('Анализируем конкурентов...');
      const competitorData = await analyzeCompetitors(productQuery, marketplace);
      setCompetitors(competitorData);

      setStep('Анализируем цены и рентабельность...');
      const pricingData = await analyzePricing(competitorData);
      setPriceAnalysis(pricingData);

      let cardContent: Omit<GeneratedProduct, 'imageUrl'>;
      let imageUrl: string;

      if (uploadedImage) {
        setStep('Создаем описание по вашему фото...');
        cardContent = await generateProductCardFromImage(uploadedImage, productQuery, description, features, marketplace);
        imageUrl = uploadedImage;
      } else {
          if (description && features && features.length > 0) {
              setStep('Обновляем вашу карточку товара...');
              cardContent = {
                  title: productQuery,
                  description,
                  features
              };
          } else {
              setStep('Создаем вашу уникальную карточку товара...');
              cardContent = await generateProductCard(competitorData, productQuery, marketplace);
          }
          
          setStep('Генерируем изображение для товара...');
          const imagePrompt = `Фотореалистичное изображение высокого качества: ${cardContent.title}. Студийный свет, чистый фон.`;
          imageUrl = await generateProductImage(imagePrompt, style);
      }
      
      setStep('Проводим экспертный анализ...');
      const analysis = await analyzeGeneratedCard(competitorData, cardContent);
      setCardAnalysis(analysis);
      
      setGeneratedProduct({ ...cardContent, imageUrl });
      setStep('Готово! Ваша карточка товара успешно создана.');
      setResultTitle('Ваша сгенерированная карточка');

    } catch (err) {
      console.error(err);
      setError('Произошла ошибка. Пожалуйста, проверьте API ключ и попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleAnalyzeByUrl = useCallback(async (productUrl: string, marketplace: Marketplace) => {
    setIsLoading(true);
    clearState();
    
    try {
      setStep('Анализируем карточку по ссылке...');
      const result = await analyzeByUrl(productUrl, marketplace);
      setCompetitors(result.competitors);

      setStep('Анализируем цены и рентабельность...');
      const pricingData = await analyzePricing(result.competitors);
      setPriceAnalysis(pricingData);

      setCardAnalysis(result.analysis);
      
      setStep('Воссоздаем изображение для анализа...');
      const imagePrompt = `Фотореалистичное изображение высокого качества: ${result.analyzedProduct.title}. Студийный свет, чистый фон.`;
      const imageUrl = await generateProductImage(imagePrompt, ImageStyle.Standard);

      setGeneratedProduct({ ...result.analyzedProduct, imageUrl });
      setStep('Анализ завершен!');
      setResultTitle(`Анализ карточки (артикул: ${result.analyzedProduct.sku})`);

    } catch (err) {
      console.error(err);
      setError('Произошла ошибка. Пожалуйста, проверьте API ключ, ссылку и попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRegenerateImage = useCallback(async (style: ImageStyle) => {
    if (!generatedProduct) return;
    setIsImageLoading(true);
    try {
        const imagePrompt = `Фотореалистичное изображение высокого качества: ${generatedProduct.title}. Студийный свет, чистый фон.`;
        const newImageUrl = await generateProductImage(imagePrompt, style);
        setGeneratedProduct(prev => prev ? { ...prev, imageUrl: newImageUrl } : null);
    } catch (err) {
        console.error("Image regeneration failed:", err);
        setError('Не удалось перегенерировать изображение.');
    } finally {
        setIsImageLoading(false);
    }
}, [generatedProduct]);

const handleEditImage = useCallback(async (editPrompt: string) => {
    if (!generatedProduct?.imageUrl) return;
    setIsEditingImage(true);
    setError(null);
    try {
        const newImageUrl = await editProductImage(generatedProduct.imageUrl, editPrompt);
        setGeneratedProduct(prev => prev ? { ...prev, imageUrl: newImageUrl } : null);
    } catch (err) {
        console.error("Image editing failed:", err);
        setError('Не удалось отредактировать изображение.');
    } finally {
        setIsEditingImage(false);
    }
  }, [generatedProduct]);

  const handleGenerateInfographic = useCallback(async () => {
    if (!generatedProduct) return;
    setIsGeneratingInfographic(true);
    setError(null);
    try {
        const newImageUrl = await generateInfographic(generatedProduct);
        setGeneratedProduct(prev => prev ? { ...prev, imageUrl: newImageUrl } : null);
    } catch (err) {
        console.error("Infographic generation failed:", err);
        setError('Не удалось создать инфографику.');
    } finally {
        setIsGeneratingInfographic(false);
    }
  }, [generatedProduct]);
  
  const handleCloneCard = useCallback((product: GeneratedProduct) => {
    setInitialFormData({
        title: product.title,
        description: product.description,
        features: product.features,
    });
    // Clear previous results to avoid confusion
    setCompetitors([]);
    setGeneratedProduct(null);
    setCardAnalysis(null);
    setPriceAnalysis(null);
    setResultTitle('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleGenerateCreativePrompts = useCallback(async () => {
    if (!generatedProduct) return;
    setIsGeneratingPrompts(true);
    setSoraPrompt(null);
    setGroqPrompt(null);
    setError(null); 
    try {
      const [soraResult, groqResult] = await Promise.all([
        generateSoraPrompt(generatedProduct),
        generateGroqPrompt(generatedProduct),
      ]);
      setSoraPrompt(soraResult);
      setGroqPrompt(groqResult);
    } catch (err) {
      console.error("Creative prompt generation failed:", err);
      setError('Не удалось сгенерировать креативные промпты.'); 
    } finally {
      setIsGeneratingPrompts(false);
    }
  }, [generatedProduct]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <SearchForm 
            onGenerate={handleGenerate} 
            onAnalyze={handleAnalyzeByUrl} 
            isLoading={isLoading}
            initialData={initialFormData}
          />

          {(isLoading || error || competitors.length > 0 || generatedProduct) && (
            <div className="mt-8 p-6 bg-gray-800 rounded-2xl shadow-lg">
              {isLoading && <Loader message={step} />}
              {error && <p className="text-red-400 text-center">{error}</p>}
              
              {!isLoading && !error && (
                <div className="space-y-10">
                  {competitors.length > 0 && (
                    <section>
                      <h2 className="text-2xl font-bold mb-4 text-cyan-400">Анализ конкурентов</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {competitors.map((comp, index) => (
                          <CompetitorCard key={index} product={comp} />
                        ))}
                      </div>
                    </section>
                  )}

                  {priceAnalysis && (
                     <section>
                      <h2 className="text-2xl font-bold mb-4 text-yellow-400">Анализ цен и рентабельности</h2>
                      <PriceAnalysisCard analysis={priceAnalysis} />
                    </section>
                  )}

                  {generatedProduct && (
                    <section>
                      <h2 className="text-2xl font-bold mb-4 text-green-400">{resultTitle}</h2>
                      <GeneratedCard 
                        product={generatedProduct}
                        analysis={cardAnalysis}
                        onRegenerateImage={handleRegenerateImage}
                        isImageLoading={isImageLoading}
                        onEditImage={handleEditImage}
                        isEditingImage={isEditingImage}
                        onGenerateInfographic={handleGenerateInfographic}
                        isGeneratingInfographic={isGeneratingInfographic}
                        onClone={handleCloneCard}
                        onGenerateCreativePrompts={handleGenerateCreativePrompts}
                        isGeneratingPrompts={isGeneratingPrompts}
                        soraPrompt={soraPrompt}
                        groqPrompt={groqPrompt}
                      />
                    </section>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
