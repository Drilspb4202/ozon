import React from 'react';

const LightBulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a7.5 7.5 0 01-7.5 0c.407.407.822.784 1.25.1153 1.25-1.153 2.5-2.305 3.75-2.305s2.5 1.152 3.75 2.305c.428-.37.843-.746 1.25-1.153z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v.01M12 3c-3.142 0-6 2.858-6 6.333c0 2.25.9 4.333 2.333 5.667c.3.333.667.667 1 .667h5.334c.333 0 .667-.333 1-.667c1.433-1.334 2.333-3.417 2.333-5.667C18 5.858 15.142 3 12 3z" />
    </svg>
);

export default LightBulbIcon;
