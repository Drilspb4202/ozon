import React from 'react';

const NeonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.25 18.25L18 21l-.25-2.75a3.375 3.375 0 00-2.25-2.25L12.75 15l2.75-.25a3.375 3.375 0 002.25-2.25L18 9.75l.25 2.75a3.375 3.375 0 002.25 2.25L23.25 15l-2.75.25a3.375 3.375 0 00-2.25 2.25z" />
  </svg>
);

export default NeonIcon;
