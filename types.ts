export enum Marketplace {
  Wildberries = 'Wildberries',
  Ozon = 'Ozon',
}

export enum ImageStyle {
    Standard = 'Стандартный',
    Lifestyle = 'Лайфстайл',
    Vibrant = 'Яркий',
    Dramatic = 'Драматичный',
    Minimalism = 'Минимализм',
}

export interface CompetitorProduct {
  title: string;
  descriptionSummary: string;
  features: string[];
  price?: string;
  rating?: number;
  url?: string;
}

export interface GeneratedProduct {
  title:string;
  description: string;
  features: string[];
  imageUrl: string;
  sku?: string;
}

export interface CardAnalysis {
    seoStrength: string;
    sellingPower: string;
    uniqueness: string;
    seoScore: number;
    sellingScore: number;
    uniquenessScore: number;
    overallScore: number;
    justification: string;
}

export interface PriceAnalysis {
  averagePrice: string;
  priceRange: string;
  profitabilityAnalysis: string;
  recommendation: string;
}

export interface ProductAnalysisResult {
  analyzedProduct: Omit<GeneratedProduct, 'imageUrl'> & { sku: string };
  competitors: CompetitorProduct[];
  analysis: CardAnalysis;
}