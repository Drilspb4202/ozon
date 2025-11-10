import React from 'react';
import ClipboardIcon from './icons/ClipboardIcon';
import CheckIcon from './icons/CheckIcon';
import VideoCameraIcon from './icons/VideoCameraIcon';
import CameraIcon from './icons/CameraIcon';
import SparklesIcon from './icons/SparklesIcon';
import RefreshIcon from './icons/RefreshIcon';

interface CreativePromptsGeneratorProps {
    onGenerate: () => void;
    isLoading: boolean;
    soraPrompt: string | null;
    groqPrompt: string | null;
}

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1.5 bg-gray-600/50 rounded-md text-gray-400 hover:text-white hover:bg-gray-500 transition-all duration-200"
            title="Копировать промпт"
        >
            {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
        </button>
    );
};

const CreativePromptsGenerator: React.FC<CreativePromptsGeneratorProps> = ({
    onGenerate,
    isLoading,
    soraPrompt,
    groqPrompt
}) => {
    const hasPrompts = soraPrompt && groqPrompt;

    return (
        <div className="mt-10 p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
            <h3 className="text-xl font-bold text-center mb-2 text-teal-300">Креативный Контент</h3>
            <p className="text-center text-sm text-gray-400 mb-6">
                Сгенерируйте готовые промпты для создания видео и фото контента с помощью AI.
            </p>

            {hasPrompts && !isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Sora Prompt Card */}
                    <div className="bg-gray-700/60 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <VideoCameraIcon className="w-6 h-6 text-teal-400" />
                                <h4 className="font-bold text-white">Видео-сценарий (Sora 2)</h4>
                            </div>
                            <CopyButton textToCopy={soraPrompt!} />
                        </div>
                        <textarea
                            readOnly
                            value={soraPrompt!}
                            className="w-full h-40 bg-gray-800 text-gray-300 text-sm p-3 rounded-md border border-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                    </div>

                    {/* Groq Prompt Card */}
                    <div className="bg-gray-700/60 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <CameraIcon className="w-6 h-6 text-teal-400" />
                                <h4 className="font-bold text-white">Идея для фото (Groq)</h4>
                            </div>
                            <CopyButton textToCopy={groqPrompt!} />
                        </div>
                        <textarea
                            readOnly
                            value={groqPrompt!}
                             className="w-full h-40 bg-gray-800 text-gray-300 text-sm p-3 rounded-md border border-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                    </div>
                </div>
            )}
            
            {isLoading && (
                 <div className="flex flex-col items-center justify-center p-4">
                     <svg className="animate-spin h-8 w-8 text-white mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-center text-sm text-gray-400">AI подбирает лучшие ракурсы и сценарии... Это может занять несколько секунд.</p>
                 </div>
            )}

            {!isLoading && (
                 <div className="flex justify-center">
                    <button
                        onClick={onGenerate}
                        disabled={isLoading}
                        className="px-6 py-3 text-base font-bold text-white bg-teal-600 rounded-lg transition-colors duration-200 hover:bg-teal-700 disabled:bg-gray-700 disabled:cursor-wait flex items-center justify-center gap-2"
                    >
                        {hasPrompts ? (
                            <>
                                <RefreshIcon className="w-5 h-5" />
                                <span>Перегенерировать</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                <span>Создать промпты</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CreativePromptsGenerator;