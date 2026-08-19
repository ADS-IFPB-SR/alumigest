import React, { useState } from 'react';

interface TabProps {
 label: string;
 children: React.ReactNode;
}

interface TabsProps {
 children: React.ReactElement<TabProps>[];
 defaultIndex?: number;
}

export function Tabs({ children, defaultIndex = 0 }: TabsProps) {
 const [activeIndex, setActiveIndex] = useState(defaultIndex);

 return (
 <div className="flex flex-col flex-1 overflow-hidden h-full">
 {/* Horizontal Tabs with smooth scroll */}
 <div className="border-b border-outline-variant mb-xs sm:mb-md flex overflow-x-auto no-scrollbar flex-none scrollbar-none gap-xs">
 {React.Children.map(children, (child, index) => {
 const isActive = index === activeIndex;
 return (
 <button
 onClick={() => setActiveIndex(index)}
 className={`px-md sm:px-lg py-sm sm:py-md font-label text-sm sm:text-base whitespace-nowrap transition-all border-b-2 font-medium cursor-pointer ${
 isActive 
 ? 'text-primary border-primary font-bold bg-surface-container rounded-t-md' 
 : 'text-secondary border-transparent hover:text-primary hover:bg-surface-container-high'
 }`}
 >
 {child.props.label}
 </button>
 );
 })}
 </div>
 
 {/* Tab Content */}
 <div className="flex-1 overflow-hidden flex flex-col">
 {React.Children.toArray(children)[activeIndex]}
 </div>
 </div>
 );
}

export function Tab({ children }: TabProps) {
 return <>{children}</>;
}
