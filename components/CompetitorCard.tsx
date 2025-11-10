import React from 'react';
import { CompetitorProduct } from '../types';
import ExternalLinkIcon from './icons/ExternalLinkIcon';

// Fix: Defined the props interface for the component.
interface CompetitorCardProps {
  product: CompetitorProduct;
}

const CompetitorCard: React.FC<CompetitorCardProps> = ({ product }) => {
  // Fallback URL if product.url is not available
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(product.title + ' ' + (product.price || ''))}`;
  const productUrl = product.url ? (product.url.startsWith('http') ? product.url : `https://${product.url}`) : searchUrl;


  return (
    <div className="bg-gray-700/50 rounded-xl p-5 border border-gray-600/50 h-full flex flex-col transform hover:scale-105 hover:border-cyan-500/50 transition-all duration-300">
      <h3 className="text-md font-bold text-cyan-300 mb-2">{product.title}</h3>
      <p className="text-sm text-gray-400 mb-4 flex-grow">{product.descriptionSummary}</p>
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">Ключевые особенности:</h4>
        <ul className="space-y-1.5">
          {product.features.map((feature, index) => (
            <li key={index} className="flex items-start text-sm text-gray-400">
              <svg className="w-4 h-4 mr-2 mt-0.5 text-cyan-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-auto pt-3 border-t border-gray-600/50 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {product.price && (
                <span className="font-semibold text-white bg-gray-600 px-2.5 py-1 rounded-full text-xs">{product.price}</span>
            )}
            {product.rating && (
                <div className="flex items-center gap-1 text-yellow-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold">{product.rating.toFixed(1)}</span>
                </div>
            )}
          </div>
          <a href={productUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors duration-200">
              {product.url ? 'Перейти' : 'Найти'}
              <ExternalLinkIcon className="w-4 h-4" />
          </a>
      </div>
    </div>
  );
};

export default CompetitorCard;