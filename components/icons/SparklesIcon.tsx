import React from 'react';

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 004.463-1.077.75.75 0 01.819.162l1.903 1.904a.75.75 0 01-.32 1.223l-1.391.522a.75.75 0 01-.842-.842l.522-1.391a.75.75 0 011.223-.32l1.904 1.903a.75.75 0 01.162.819A8.97 8.97 0 0018 21a9 9 0 00-9-9 8.97 8.97 0 00-1.077-4.463.75.75 0 01.162-.819l1.903-1.904a.75.75 0 011.223.32l-1.391.522a.75.75 0 01-.842-.842l.522-1.391a.75.75 0 01.32-1.223L9.528 1.718z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 12.75l.25.25a.75.75 0 010 1.06l-.25.25a.75.75 0 01-1.06 0l-.25-.25a.75.75 0 010-1.06l.25-.25a.75.75 0 011.06 0z" />
    </svg>
);

export default SparklesIcon;