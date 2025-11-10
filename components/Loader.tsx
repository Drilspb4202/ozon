
import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="w-16 h-16 border-4 border-cyan-400 border-dashed rounded-full animate-spin"></div>
      <p className="text-lg text-gray-300">{message}</p>
    </div>
  );
};

export default Loader;
