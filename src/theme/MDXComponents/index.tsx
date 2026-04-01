import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';

function OrbitDivider() {
  return (
    <div style={{ position: 'relative', margin: '2rem 0', height: '24px', width: '100%' }}>
      <svg width="100%" height="24" viewBox="0 0 800 24" preserveAspectRatio="none">
        <ellipse
          cx="400" cy="12" rx="395" ry="8"
          fill="none"
          stroke="rgba(74,106,223,0.3)"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
        <circle cx="0" cy="12" r="3" fill="#7aadff">
          <animate
            attributeName="cx"
            values="5;400;795;400;5"
            keyTimes="0;0.25;0.5;0.75;1"
            dur="6s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            values="12;4;12;20;12"
            keyTimes="0;0.25;0.5;0.75;1"
            dur="6s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
}

export default {
  ...MDXComponents,
  hr: () => <OrbitDivider />,
};