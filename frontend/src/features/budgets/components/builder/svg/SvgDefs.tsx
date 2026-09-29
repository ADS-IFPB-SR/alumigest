import React from 'react';

export const SvgDefs: React.FC = () => {
  return (
    <defs>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.2" />
      </filter>
    </defs>
  );
};
