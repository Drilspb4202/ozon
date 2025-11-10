import { GoogleGenAI, Type, Modality } from "@google/genai";
import { CompetitorProduct, GeneratedProduct, Marketplace, CardAnalysis, ImageStyle, ProductAnalysisResult, PriceAnalysis } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const dataUrlToMimeTypeAndBase64 = (dataUrl: string): { mimeType: string; data: string } => {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || mimeMatch.length < 2) {
        throw new Error("Invalid data URL");
    }
    return { mimeType: mimeMatch[1], data: arr[1] };
};


const competitorSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'Привлекательное название товара конкурента.',
      },
      descriptionSummary: {
        type: Type.STRING,
        description: 'Краткое содержание описания товара конкурента (2-3 предложения).',
      },
      features: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: 'Список из 3-5 ключевых особенностей или характеристик товара.',
      },
      price: {
        type: Type.STRING,
        description: 'Средняя цена товара, если доступна (например, "1500 ₽").',
      },
      rating: {
        type: Type.NUMBER,
        description: 'Средний рейтинг товара от 1 до 5, если доступен (например, 4.8).',
      },
      url: {
          type: Type.STRING,
          description: 'Прямая ссылка (URL) на страницу товара конкурента.',
      },
    },
    required: ["title", "descriptionSummary", "features"],
  },
};

const generatedCardSchema = {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'Новое, оптимизированное и привлекательное название для товара.',
      },
      description: {
        type: Type.STRING,
        description: 'Подробное и убедительное описание товара, включающее преимущества и призыв к действию. Форматировано с использованием markdown.',
      },
      features: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: 'Список из 5-7 ключевых продающих преимуществ товара.',
      },
      sku: {
        type: Type.STRING,
        description: 'Артикул (SKU) товара, извлеченный со страницы.'
      }
    },
    required: ["title", "description", "features"],
};

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        seoStrength: { type: Type.STRING, description: 'Анализ SEO-силы (название, ключи) в 1-2 предложениях.' },
        sellingPower: { type: Type.STRING, description: 'Анализ продающей силы (описание, призыв к действию) в 1-2 предложениях.' },
        uniqueness: { type: Type.STRING, description: 'Анализ уникальности и отличий от конкурентов в 1-2 предложениях.' },
        seoScore: { type: Type.NUMBER, description: 'Оценка SEO-силы от 1 до 10.' },
        sellingScore: { type: Type.NUMBER, description: 'Оценка продающей силы от 1 до 10.' },
        uniquenessScore: { type: Type.NUMBER, description: 'Оценка уникальности от 1 до 10.' },
        overallScore: { type: Type.NUMBER, description: 'Общая оценка карточки от 1 до 10.' },
        justification: { type: Type.STRING, description: 'Краткое (1 предложение) обоснование общей оценки.' },
    },
    required: ["seoStrength", "sellingPower", "uniqueness", "seoScore", "sellingScore", "uniquenessScore", "overallScore", "justification"],
};

const analysisByUrlSchema = {
    type: Type.OBJECT,
    properties: {
        analyzedProduct: { ...generatedCardSchema, required: ["title", "description", "features", "sku"]},
        competitors: competitorSchema,
        analysis: analysisSchema,
    },
    required: ["analyzedProduct", "competitors", "analysis"],
};

const priceAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        averagePrice: { type: Type.STRING, description: 'Средняя цена конкурентов в формате "X ₽".' },
        priceRange: { type: Type.STRING, description: 'Ценовой диапазон (от мин до макс) в формате "X ₽ - Y ₽".' },
        profitabilityAnalysis: { type: Type.STRING, description: 'Краткий анализ рентабельности и позиционирования в ценовом сегменте (2-3 предложения).' },
        recommendation: { type: Type.STRING, description: 'Конкретная рекомендация по ценообразованию для нового товара (1-2 предложения).' },
    },
    required: ["averagePrice", "priceRange", "profitabilityAnalysis", "recommendation"],
};


export const analyzeCompetitors = async (productQuery: string, marketplace: Marketplace): Promise<CompetitorProduct[]> => {
  const prompt = `Выступи в роли эксперта по маркетплейсам. Проанализируй топ 3-4 товара конкурентов для запроса "${productQuery}" на площадке ${marketplace}. Для каждого товара предоставь название, краткое описание, 3-5 ключевых характеристик, прямую ссылку на товар (URL), а также среднюю цену и рейтинг, если эта информация доступна. Верни результат в виде JSON, соответствующего предоставленной схеме.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: competitorSchema,
    },
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
};

export const generateProductCard = async (competitors: CompetitorProduct[], productQuery: string, marketplace: Marketplace): Promise<Omit<GeneratedProduct, 'imageUrl'>> => {
  const competitorContext = JSON.stringify(competitors, null, 2);
  const prompt = `На основе анализа конкурентов: ${competitorContext}, создай максимально убедительную и продающую карточку товара для запроса "${productQuery}" для маркетплейса ${marketplace}.
  - Твоя задача — создать текст, который говорит напрямую с покупателем, решает его 'боль' и предлагает идеальное решение.
  - Используй AIDA-модель (Attention, Interest, Desire, Action) в описании.
  - Текст должен быть эмоциональным, ярким и вызывать желание купить.
  - Сгенерируй новое, уникальное и SEO-оптимизированное название. Особое внимание удели корректному написанию брендов и технических терминов на русском и английском языках, не транслитерируй их некорректно.
  - Создай подробное продающее описание (используй Markdown для форматирования: заголовки, списки, **жирный** текст).
  - Сформируй список из 5-7 ключевых преимуществ.
  Результат верни в виде JSON, соответствующего предоставленной схеме.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: generatedCardSchema,
    },
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
};

export const generateProductCardFromImage = async (
    base64ImageDataUrl: string,
    productQuery: string,
    userDescription: string | undefined,
    userFeatures: string[] | undefined,
    marketplace: Marketplace
): Promise<Omit<GeneratedProduct, 'imageUrl'>> => {
    const { mimeType, data } = dataUrlToMimeTypeAndBase64(base64ImageDataUrl);

    let prompt = `Ты — эксперт по маркетплейсам. Проанализируй изображение товара.
    **Контекст от пользователя:** "${productQuery}".
    Твоя задача — создать убедительную карточку товара для маркетплейса ${marketplace} на основе этого фото.
    - Создай новое, уникальное и SEO-оптимизированное название, которое точно описывает товар на фото.
    - Создай подробное продающее описание (используй Markdown), которое подчеркивает достоинства товара, видимые на изображении.
    - Сформируй список из 5-7 ключевых преимуществ, основанных на визуальном анализе.
    `;
    
    if(userDescription) {
        prompt += `\n**Учти это описание от пользователя как дополнительный контекст:** "${userDescription}"`;
    }
    if(userFeatures && userFeatures.length > 0) {
        prompt += `\n**Учти эти преимущества от пользователя как дополнительный контекст:** "${userFeatures.join(', ')}"`;
    }
    prompt += `\nРезультат верни в виде JSON, соответствующего предоставленной схеме.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: data,
                        mimeType: mimeType,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: generatedCardSchema,
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};


export const analyzeGeneratedCard = async (competitors: CompetitorProduct[], generatedCard: Omit<GeneratedProduct, 'imageUrl'>): Promise<CardAnalysis> => {
    const competitorContext = JSON.stringify(competitors, null, 2);
    const generatedCardContext = JSON.stringify(generatedCard, null, 2);
    const prompt = `Ты - опытный маркетолог на маркетплейсах. Сравни сгенерированную карточку товара с данными конкурентов. Проанализируй по 3 критериям: SEO-сила (название, ключи), Продающая сила (описание, призыв к действию), Уникальность. Для каждого из этих 3 критериев предоставь краткий анализ в 1-2 предложениях и поставь оценку от 1 до 10. Также поставь общую оценку от 1 до 10 и кратко обоснуй ее.
    Конкуренты: ${competitorContext}
    Сгенерированная карточка: ${generatedCardContext}
    Верни результат в виде JSON, соответствующего предоставленной схеме.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: analysisSchema,
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

export const analyzeByUrl = async (productUrl: string, marketplace: Marketplace): Promise<ProductAnalysisResult> => {
    const prompt = `Выступи в роли ведущего AI-эксперта по маркетплейсу ${marketplace}.
    Твоя задача — провести детальный и **безошибочно точный** анализ товара по его **URL-адресу**: "${productUrl}".

    **КРИТИЧЕСКИ ВАЖНЫЕ УКАЗАНИЯ:**
    1.  **АБСОЛЮТНАЯ ТОЧНОСТЬ:** Твой анализ должен быть основан **ИСКЛЮЧИТЕЛЬНО** на РЕАЛЬНЫХ, ПУБЛИЧНЫХ данных о товаре, который находится по ссылке "${productUrl}".
    2.  **ЗАПРЕТ НА ВЫМЫСЕЛ:** Категорически запрещено придумывать или подменять товар. Если ссылка недействительна или ведет не на карточку товара, это провал.

    **Твоя задача:**
    Проанализируй страницу товара по ссылке "${productUrl}" на **${marketplace}** и выполни следующие шаги:

    1.  **Анализ указанного товара:**
        - На основе публично доступной информации со страницы товара, воссоздай ключевые данные его карточки.
        - Извлеки:
            - **Артикул (SKU)**. Это обязательно.
            - Название (title).
            - Подробное продающее описание (description), отформатированное в Markdown.
            - Список из 5-7 ключевых преимуществ (features).

    2.  **Анализ конкурентов:** Определи 3-4 главных конкурента для этого **конкретного** товара на ${marketplace}. Для каждого конкурента предоставь:
        - Название (title).
        - Краткое содержание описания (descriptionSummary).
        - Список из 3-5 ключевых особенностей (features).
        - Прямую ссылку на товар (url).
        - Цену (price), если она указана.

    3.  **Сравнительный анализ:** Проведи экспертную оценку карточки товара по ссылке, сравнивая ее с найденными конкурентами по следующим критериям:
        - SEO-сила (название, ключи).
        - Продающая сила (описание, призыв к действию).
        - Уникальность и отстройка от конкурентов.

    4.  **Оценка:** Для каждого из трех критериев выше дай оценку от 1 до 10 и краткий текстовый анализ (1-2 предложения). Также выставь общую оценку от 1 до 10 и кратко обоснуй ее.

    Верни весь результат в виде единого JSON-объекта, строго соответствующего предоставленной схеме.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: analysisByUrlSchema,
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

export const analyzePricing = async (competitors: CompetitorProduct[]): Promise<PriceAnalysis> => {
    const competitorPrices = competitors.map(c => ({ title: c.title, price: c.price })).filter(c => c.price);
    if (competitorPrices.length === 0) {
        return {
            averagePrice: "Нет данных",
            priceRange: "Нет данных",
            profitabilityAnalysis: "Не удалось проанализировать рентабельность, так как у конкурентов не указаны цены.",
            recommendation: "Проведите дополнительное исследование цен вручную.",
        };
    }
    const prompt = `Ты — финансовый аналитик на маркетплейсах. На основе данных о ценах конкурентов, проведи анализ и дай рекомендации по ценообразованию.
    Данные о ценах конкурентов: ${JSON.stringify(competitorPrices, null, 2)}
    
    Твои задачи:
    1. Рассчитай среднюю цену.
    2. Определи ценовой диапазон (минимальная и максимальная цена).
    3. Напиши краткий анализ рентабельности. Укажи, в какой сегмент (низкий, средний, высокий) лучше целиться и почему.
    4. Дай четкую рекомендацию по стартовой цене для нового товара.
    
    Верни результат в виде JSON, соответствующего предоставленной схеме.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: priceAnalysisSchema,
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};


export const generateProductImage = async (prompt: string, style: ImageStyle): Promise<string> => {
    let stylePrompt = '';
    switch(style) {
        case ImageStyle.Lifestyle:
            stylePrompt = 'Лайфстайл фотография, товар используется в естественной, эстетичной и реалистичной обстановке, показывая его в действии, что помогает покупателю представить товар в своей жизни.';
            break;
        case ImageStyle.Vibrant:
            stylePrompt = 'Яркое, сочное и привлекающее внимание изображение, насыщенные цвета, динамичная композиция, возможно с креативными элементами, чтобы выделиться.';
            break;
        case ImageStyle.Dramatic:
            stylePrompt = 'Драматичное освещение, глубокие тени, создающие ощущение премиальности и высокого качества, акцент на текстуре и деталях материала.';
            break;
        case ImageStyle.Minimalism:
            stylePrompt = 'Элегантный минимализм, товар на идеально чистом однотонном фоне, мягкие пастельные тона, фокус на форме и простоте продукта.';
            break;
        default:
            stylePrompt = 'Стандартное студийное каталожное фото, предмет на нейтральном светлом фоне, идеальное освещение без резких теней.';
            break;
    }

    const fullPrompt = `${prompt} Стиль: ${stylePrompt}`;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    }
    throw new Error('Не удалось сгенерировать изображение.');
};

export const editProductImage = async (base64ImageDataUrl: string, prompt: string): Promise<string> => {
    const { mimeType, data } = dataUrlToMimeTypeAndBase64(base64ImageDataUrl);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: data,
                        mimeType: mimeType,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
    }
    
    throw new Error('Не удалось отредактировать изображение.');
};

export const generateInfographic = async (product: GeneratedProduct): Promise<string> => {
    const { mimeType, data } = dataUrlToMimeTypeAndBase64(product.imageUrl);
    
    const featuresText = product.features.slice(0, 4).map(f => `- ${f}`).join('\n');

    const prompt = `Ты — профессиональный дизайнер инфографики для маркетплейсов. Возьми предоставленное изображение товара и преврати его в продающую инфографику.
**Задача:**
1. Используй это изображение как основу.
2. Добавь на изображение яркий, привлекающий внимание заголовок, связанный с товаром. Например: 'ВЫСОКОЕ КАЧЕСТВО' или 'ТРЕНД СЕЗОНА'.
3. Размести на изображении следующие ключевые преимущества товара в виде текста. Используй для этого хорошо читаемые шрифты, яркие плашки, иконки или нумерацию для акцентов:
${featuresText}
4. Композиция должна быть гармоничной, не перегруженной и профессиональной. Текст не должен перекрывать важные детали самого товара. Цветовая схема должна быть яркой и современной.
5. Результат должен выглядеть как карточка товара с лучших позиций на Wildberries или Ozon. Не добавляй логотипы брендов маркетплейсов или чужие вотермарки.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: data,
                        mimeType: mimeType,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
    }
    
    throw new Error('Не удалось создать инфографику.');
};

export const generateSoraPrompt = async (product: GeneratedProduct): Promise<string> => {
    const productContext = JSON.stringify({ title: product.title, description: product.description, features: product.features.slice(0,3) });
    const prompt = `Ты — креативный директор и эксперт по AI-видеогенерации для Sora 2. На основе данных о товаре: ${productContext}, создай детальный, яркий и кинематографичный промпт.
    
    **Требования к промпту:**
    - **Стиль:** Фотореалистичный, кинематографичный, высокое качество, 8K.
    - **Длительность:** Сцена для короткого ролика (5-10 секунд).
    - **Содержание:** Промпт должен описывать сцену, демонстрирующую товар в привлекательном и естественном контексте использования. Покажи ключевые преимущества товара в действии.
    - **Детали:** Включи описание ракурса камеры (например, "close-up shot", "dynamic tracking shot"), освещения (например, "soft natural light", "dramatic studio lighting"), и атмосферы (например, "cozy morning atmosphere", "energetic and vibrant mood").
    - **Формат:** Верни только текст самого промпта, без лишних вступлений и объяснений.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text.trim();
};

export const generateGroqPrompt = async (product: GeneratedProduct): Promise<string> => {
    const productContext = JSON.stringify({ title: product.title, description: product.description, features: product.features.slice(0,3) });
    const prompt = `Ты — арт-директор и AI-фотограф, эксперт по созданию промптов для Midjourney/DALL-E 3 (используя Groq для скорости). На основе данных о товаре: ${productContext}, создай подробный промпт для генерации фотореалистичного рекламного изображения.

    **Требования к промпту:**
    - **Стиль:** Фотореалистичное, журнальное качество, рекламный снимок продукта.
    - **Содержание:** Опиши сцену, в которой товар является центральным элементом. Контекст должен соответствовать целевой аудитории и назначению товара.
    - **Детали:** Укажи композицию, ракурс (например, "eye-level shot", "top-down view"), тип объектива (например, "85mm lens, f/1.8"), освещение ("soft window light", "three-point studio lighting"), и цветовую палитру.
    - **Формат:** Верни только текст самого промпта, готовый для копирования, без лишних слов. Пример: "photo of a [product] on a [surface], [details about background and lighting], 8k, photorealistic, shot on a Sony A7IV".`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text.trim();
};